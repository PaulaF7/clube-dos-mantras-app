const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ALTERAÇÃO: Importando de forma modular e mais robusta
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const db = getFirestore();
const bucket = getStorage().bucket();
// A variável 'FieldValue' agora vem diretamente da importação acima.

//---------------------------------------------------------------------
// Função 1: Webhook da Kiwify (Sintaxe v1)
//---------------------------------------------------------------------
exports.kiwifyWebhookHandler = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  try {
    const event = req.body;
    functions.logger.info("Webhook da Kiwify recebido!", { event });

    if (event.webhook_event_type === "order_approved") {
      const purchaseData = event;
      const customerEmail = purchaseData.Customer?.email;
      const orderId = purchaseData.order_id;
      const productId = purchaseData.Product?.id;

      if (!customerEmail || !productId) {
        functions.logger.warn("Webhook 'order_approved' sem e-mail ou ID de produto.", { orderId });
        return res.status(400).json({ error: "Dados do cliente ou produto ausentes." });
      }

      const PRODUTO_PERGUNTA_AVULSA_ID = "392ff370-8a61-11f0-886b-f553752d816a";

      functions.logger.info(`Processando pedido para: ${customerEmail}`);
      const usersRef = db.collection("users");
      const userQuery = await usersRef.where("email", "==", customerEmail).limit(1).get();

      if (String(productId) === PRODUTO_PERGUNTA_AVULSA_ID) {
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({ perguntasAvulsas: FieldValue.increment(1) });
          functions.logger.info(`+1 crédito adicionado para ${customerEmail}.`);
        } else {
          functions.logger.warn(`Compra de pergunta avulsa para usuário inexistente: ${customerEmail}.`);
        }
      } else {
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({ isPremium: true });
          functions.logger.info(`Usuário ${customerEmail} atualizado para premium.`);
        } else {
          const pendingPremiumRef = db.collection("pendingPremium");
          await pendingPremiumRef.add({
            email: customerEmail,
            status: "pending",
            purchaseDate: FieldValue.serverTimestamp(),
            orderId: orderId,
          });
          functions.logger.info(`Registro pendente criado para ${customerEmail}.`);
        }
      }
    }

    if (event.webhook_event_type === "subscription_canceled" || event.webhook_event_type === "subscription_expired") {
      const customerEmail = event.Customer?.email;
      if (customerEmail) {
        const usersRef = db.collection("users");
        const userQuery = await usersRef.where("email", "==", customerEmail).limit(1).get();
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({ isPremium: false });
          functions.logger.info(`Assinatura de ${customerEmail} cancelada.`);
        }
      }
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    functions.logger.error("Erro fatal no webhook:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//--------------------------------------------------------------------------------------------------
// Função 2: Ativar premium na criação do usuário (Sintaxe v1)
//--------------------------------------------------------------------------------------------------
exports.activatePremiumOnUserCreation = functions.firestore.document("users/{userId}").onCreate(async (snap, context) => {
  const userId = context.params.userId;
  const newUser = snap.data();
  const userEmail = newUser.email;

  if (!userEmail) {
    functions.logger.log(`Novo usuário ${userId} criado sem email.`);
    return null;
  }

  functions.logger.log(`Novo usuário: ${userEmail}. Verificando compras pendentes.`);
  const pendingPremiumRef = db.collection("pendingPremium");
  const pendingQuery = await pendingPremiumRef.where("email", "==", userEmail).get();

  if (!pendingQuery.empty) {
    functions.logger.log(`Compra pendente encontrada para ${userEmail}. Ativando premium.`);
    const pendingDoc = pendingQuery.docs[0];
    await snap.ref.update({ isPremium: true });
    await pendingDoc.ref.delete();
    functions.logger.log(`Usuário ${userId} atualizado para premium e registro pendente removido.`);
  } else {
    functions.logger.log(`Nenhuma compra pendente para ${userEmail}.`);
  }
  return null;
});

//--------------------------------------------------------------------------------------------------
// Função 3: Perguntas para o Astrólogo (Sintaxe v1)
//--------------------------------------------------------------------------------------------------
exports.askAstrologer = functions.https.onCall(async (data, context) => {
  const { userId, question, astroProfile } = data;
  const auth = context.auth;

  if (!auth || auth.uid !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Usuário não autenticado.");
  }
  if (!question) {
    throw new functions.https.HttpsError("invalid-argument", "A pergunta é obrigatória.");
  }

  const userRef = db.collection("users").doc(userId);
  try {
    await db.runTransaction(async (t) => {
      const userSnap = await t.get(userRef);
      if (!userSnap.exists) {
        throw new functions.https.HttpsError("failed-precondition", "Usuário não encontrado.");
      }
      
      const userData = userSnap.data() || {};
      const isPremium = !!userData.isPremium;
      const freeUsed = !!userData.freeQuestionUsed;
      const avulsasCredits = userData.perguntasAvulsas || 0;

      if (!isPremium && freeUsed && avulsasCredits <= 0) {
        throw new functions.https.HttpsError("failed-precondition", "Créditos insuficientes.");
      }

      const newDocRef = userRef.collection("astroHistory").doc();
      t.set(newDocRef, {
        question,
        response: null,
        status: "waiting",
        astroProfile: astroProfile || null,
        createdAt: FieldValue.serverTimestamp(),
        saved: false,
        isRead: false,
      });

      if (!isPremium && freeUsed && avulsasCredits > 0) {
        t.update(userRef, { perguntasAvulsas: FieldValue.increment(-1) });
      } else if (!isPremium && !freeUsed) {
        t.update(userRef, { freeQuestionUsed: true });
      }
    });
    return { success: true, message: "Pergunta registrada com sucesso." };
  } catch (error) {
    functions.logger.error("Erro em askAstrologer:", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "Erro interno ao processar pergunta.");
  }
});

//--------------------------------------------------------------------------------------------------
// Função 4: Limpeza de dados do usuário (Sintaxe v1)
//--------------------------------------------------------------------------------------------------
exports.cleanupUserData = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;
  const logger = functions.logger;

  logger.log(`Iniciando limpeza de dados para o usuário: ${uid}`);
  const userDocRef = db.collection("users").doc(uid);
  const promises = [];

  const userAudioPath = `userAudios/${uid}`;
  const profilePicPath = `profilePictures/${uid}`;
  promises.push(
    bucket.deleteFiles({ prefix: userAudioPath }).catch(err => logger.error(`Falha ao limpar ${userAudioPath}`, err)),
    bucket.deleteFiles({ prefix: profilePicPath }).catch(err => logger.error(`Falha ao limpar ${profilePicPath}`, err))
  );

  const collections = ["entries", "astroHistory", "fcmTokens", "journeyProgress", "meusAudios", "playlists"];
  for (const collection of collections) {
      const subcollectionRef = userDocRef.collection(collection);
      promises.push(
          db.collection(subcollectionRef.path).get().then(snapshot => {
              if (snapshot.empty) return null;
              const batch = db.batch();
              snapshot.docs.forEach(doc => batch.delete(doc.ref));
              return batch.commit();
          }).catch(err => logger.error(`Falha ao limpar subcoleção ${collection} para ${uid}`, err))
      );
  }
  
  promises.push(
    userDocRef.delete().catch(err => logger.error(`Falha ao deletar documento principal para ${uid}`, err))
  );
  
  await Promise.all(promises);
  logger.log(`Limpeza de dados para o usuário ${uid} concluída.`);
  return null;
});