const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa o Firebase Admin SDK para ter acesso ao Firestore.
admin.initializeApp();
const db = admin.firestore();

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
    // Implementação da lógica de automação para aprovação de pedidos.
    if (event.webhook_event_type === "order_approved") {
      const purchaseData = event;
      const customerEmail = purchaseData.Customer?.email;
      const orderId = purchaseData.order_id;

      // Valida se o e-mail do cliente foi recebido no webhook.
      if (!customerEmail) {
        functions.logger.warn("Webhook 'order_approved' recebido sem e-mail do cliente.", { orderId });
        return res.status(400).json({ error: "E-mail do cliente ausente." });
      }

      functions.logger.info(`Processando aprovação de pedido para o e-mail: ${customerEmail}`);

      try {
        // Procura por um usuário existente com o mesmo e-mail.
        const usersRef = db.collection("users");
        const userQuery = await usersRef.where("email", "==", customerEmail).limit(1).get();

        if (!userQuery.empty) {
          // Cenário 1: Usuário já registrado no app.
          // Atualiza o documento do usuário para conceder o status premium.
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({ isPremium: true });
          functions.logger.info(`Usuário ${userDoc.id} (${customerEmail}) encontrado. Status premium atualizado para true.`);
        } else {
          // Cenário 2: Usuário novo (ainda não se registrou).
          // Cria um documento na coleção 'pendingPremium' para aguardar o registro.
          const pendingPremiumRef = db.collection("pendingPremium");
          await pendingPremiumRef.add({
            email: customerEmail,
            status: "pending",
            purchaseDate: admin.firestore.FieldValue.serverTimestamp(), // Usa o timestamp do servidor
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
    
    // --- INÍCIO DA NOVA IMPLEMENTAÇÃO: LÓGICA DE CANCELAMENTO ---
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
    // --- FIM DA NOVA IMPLEMENTAÇÃO ---

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
// Função 2: É acionada quando um novo usuário é criado para ativar o premium se houver compra pendente.
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
// Função 3: Perguntas para o Astrólogo (chamada pelo frontend com httpsCallable).
//--------------------------------------------------------------------------------------------------
exports.askAstrologer = functions.https.onCall(async (data, context) => {
  try {
    const { userId, question, astroProfile } = data;

    // Autenticação básica
    if (!context.auth || context.auth.uid !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Usuário não autenticado ou não autorizado."
      );
    }

    if (!question) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A pergunta é obrigatória."
      );
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

      // Se não assinante e já usou a pergunta grátis, bloquear
      if (!isPremium && freeUsed) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "A pergunta grátis já foi utilizada. Assine para enviar novas perguntas."
        );
      }

      const astroHistoryRef = userRef.collection("astroHistory");
      const newDocRef = astroHistoryRef.doc();

      // Cria o registro da pergunta
      t.set(newDocRef, {
        question,
        response: null,
        status: "waiting",
        astroProfile: astroProfile || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        saved: false,
      });

      // Marca o uso do crédito grátis se aplicável
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
