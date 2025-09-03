const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa o Firebase Admin SDK para ter acesso aos serviços.
admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket(); // <-- ADICIONADO: Inicialização do Storage

//---------------------------------------------------------------------
// Função 1: Trata o webhook da Kiwify quando uma compra é feita.
//---------------------------------------------------------------------
exports.kiwifyWebhookHandler = functions.https.onRequest(async (req, res) => {
  // Validação básica para garantir que o corpo da requisição é um POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const event = req.body;
    functions.logger.info("Webhook da Kiwify recebido!", { event });

    // PREMIUM AUTOMATION START
    if (event.webhook_event_type === "order_approved") {
      const purchaseData = event;
      const customerEmail = purchaseData.Customer?.email;
      const orderId = purchaseData.order_id;

      if (!customerEmail) {
        functions.logger.warn("Webhook 'order_approved' recebido sem e-mail do cliente.", { orderId });
        return res.status(400).json({ error: "E-mail do cliente ausente." });
      }

      functions.logger.info(`Processando aprovação de pedido para o e-mail: ${customerEmail}`);

      try {
        const usersRef = db.collection("users");
        const userQuery = await usersRef.where("email", "==", customerEmail).limit(1).get();

        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({ isPremium: true });
          functions.logger.info(`Usuário ${userDoc.id} (${customerEmail}) encontrado. Status premium atualizado para true.`);
        } else {
          const pendingPremiumRef = db.collection("pendingPremium");
          await pendingPremiumRef.add({
            email: customerEmail,
            status: "pending",
            purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
            orderId: orderId,
          });
          functions.logger.info(`Usuário com e-mail ${customerEmail} não encontrado. Criado registro em pendingPremium.`);
        }
      } catch (dbError) {
        functions.logger.error("Erro de banco de dados ao processar o pedido.", { email: customerEmail, error: dbError });
        return res.status(500).json({ error: "Erro ao processar o pedido no banco de dados." });
      }
    }
    // PREMIUM AUTOMATION END
    
    // --- LÓGICA DE CANCELAMENTO ---
    if (event.webhook_event_type === "subscription_canceled" || event.webhook_event_type === "subscription_expired") {
        const customerEmail = event.Customer?.email;

        if (!customerEmail) {
            functions.logger.warn("Webhook de cancelamento recebido sem e-mail do cliente.", { orderId: event.order_id });
            return res.status(400).json({ error: "E-mail do cliente ausente no evento de cancelamento." });
        }

        functions.logger.info(`Processando cancelamento de assinatura para o e-mail: ${customerEmail}`);
        
        try {
            const usersRef = db.collection("users");
            const userQuery = await usersRef.where("email", "==", customerEmail).limit(1).get();

            if (!userQuery.empty) {
                const userDoc = userQuery.docs[0];
                await userDoc.ref.update({ isPremium: false });
                functions.logger.info(`Assinatura do usuário ${userDoc.id} (${customerEmail}) foi cancelada. Status premium atualizado para false.`);
            } else {
                functions.logger.warn(`Tentativa de cancelamento para um usuário não encontrado com o e-mail: ${customerEmail}`);
            }
        } catch (dbError) {
            functions.logger.error("Erro de banco de dados ao processar cancelamento.", { email: customerEmail, error: dbError });
            return res.status(500).json({ error: "Erro ao processar o cancelamento no banco de dados." });
        }
    }

    if (event.webhook_event_type === "order_refunded") {
      functions.logger.info(`Pedido reembolsado: ${event.order_id}`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    functions.logger.error("Erro ao processar webhook da Kiwify:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});


//--------------------------------------------------------------------------------------------------
// Função 2: É acionada quando um novo usuário é criado para ativar o premium.
//--------------------------------------------------------------------------------------------------
exports.activatePremiumOnUserCreation = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const newUser = snap.data();
    const userEmail = newUser.email;
    const userId = context.params.userId;

    if (!userEmail) {
      functions.logger.log(`Novo usuário ${userId} criado sem email.`);
      return null;
    }

    functions.logger.log(`Novo usuário criado: ${userEmail}. Verificando compras pendentes.`);

    const pendingPremiumRef = db.collection("pendingPremium");
    const pendingQuery = await pendingPremiumRef.where("email", "==", userEmail).get();

    if (!pendingQuery.empty) {
      functions.logger.log(`Compra pendente encontrada para ${userEmail}. Ativando premium.`);
      
      const pendingDoc = pendingQuery.docs[0];
      await snap.ref.update({ isPremium: true });
      await pendingDoc.ref.delete();
      
      functions.logger.log(`Usuário ${userId} atualizado para premium e registro pendente removido.`);
      return null;
    } else {
      functions.logger.log(`Nenhuma compra pendente encontrada para ${userEmail}.`);
      return null;
    }
  });


//--------------------------------------------------------------------------------------------------
// Função 3: Perguntas para o Astrólogo.
//--------------------------------------------------------------------------------------------------
exports.askAstrologer = functions.https.onCall(async (data, context) => {
  try {
    const { userId, question, astroProfile } = data;

    if (!context.auth || context.auth.uid !== userId) {
      throw new functions.https.HttpsError("permission-denied", "Usuário não autenticado.");
    }

    if (!question) {
      throw new functions.https.HttpsError("invalid-argument", "A pergunta é obrigatória.");
    }

    const userRef = db.collection("users").doc(userId);

    await db.runTransaction(async (t) => {
      const userSnap = await t.get(userRef);
      if (!userSnap.exists) {
        throw new functions.https.HttpsError("failed-precondition", "Usuário não encontrado.");
      }
      const u = userSnap.data() || {};
      const isPremium = !!u.isPremium;
      const freeUsed = !!u.freeQuestionUsed;

      if (!isPremium && freeUsed) {
        throw new functions.https.HttpsError("failed-precondition", "A pergunta grátis já foi utilizada.");
      }

      const astroHistoryRef = userRef.collection("astroHistory");
      const newDocRef = astroHistoryRef.doc();

      t.set(newDocRef, {
        question,
        response: null,
        status: "waiting",
        astroProfile: astroProfile || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        saved: false,
      });

      if (!isPremium && !freeUsed) {
        t.update(userRef, { freeQuestionUsed: true });
      }
    });

    return { success: true, message: "Pergunta registrada com sucesso." };
  } catch (error) {
    functions.logger.error("Erro em askAstrologer:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Erro interno.");
  }
});


//--------------------------------------------------------------------------------------------------
// Função 4: Limpa os dados do usuário no Firestore e Storage após a exclusão da conta.  <-- NOVA FUNÇÃO
//--------------------------------------------------------------------------------------------------
exports.cleanupUserData = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;
  const logger = functions.logger;

  logger.log(`Iniciando limpeza de dados para o usuário: ${uid}`);

  // 1. Deletar todos os arquivos do usuário no Storage
  const userAudioPath = `userAudios/${uid}`;
  const profilePicPath = `profilePictures/${uid}`;
  
  try {
    await bucket.deleteFiles({ prefix: userAudioPath });
    await bucket.deleteFiles({ prefix: profilePicPath });
    logger.log(`Arquivos do Storage em '${userAudioPath}' e '${profilePicPath}' deletados.`);
  } catch (error) {
    logger.error(`Erro ao deletar arquivos do Storage para o usuário ${uid}:`, error);
  }

  // 2. Deletar todos os documentos e subcoleções no Firestore
  const userDocRef = db.collection("users").doc(uid);
  try {
    const collections = ["entries", "astroHistory", "fcmTokens", "journeyProgress", "meusAudios", "playlists"];
    for (const collection of collections) {
        const snapshot = await db.collection("users").doc(uid).collection(collection).get();
        if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
            logger.log(`Subcoleção '${collection}' do usuário ${uid} deletada.`);
        }
    }

    await userDocRef.delete();
    logger.log(`Documento principal do usuário ${uid} deletado.`);

  } catch (error) {
    logger.error(`Erro ao deletar dados do Firestore para o usuário ${uid}:`, error);
  }
  
  logger.log(`Limpeza de dados para o usuário ${uid} concluída.`);
  return null;
});

//--------------------------------------------------------------------------------------------------
// Função 5: Deleta o usuário da Autenticação (chamada pelo cliente após reautenticar).
//--------------------------------------------------------------------------------------------------
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  // Garante que a função foi chamada por um usuário autenticado.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "É preciso estar autenticado para deletar a conta."
    );
  }

  const uid = context.auth.uid;
  const logger = functions.logger;

  try {
    // A exclusão do usuário aqui irá disparar a função 'cleanupUserData' automaticamente.
    await admin.auth().deleteUser(uid);
    logger.log(`Usuário ${uid} deletado com sucesso da Autenticação.`);
    return { success: true, message: "Conta de usuário deletada com sucesso." };
  } catch (error) {
    logger.error(`Erro ao deletar o usuário ${uid} da Autenticação:`, error);
    throw new functions.https.HttpsError(
      "internal",
      "Ocorreu um erro no servidor ao tentar deletar a conta."
    );
  }
});