// --- SEÇÃO DE IMPORTAÇÕES ---
const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/v2/params");

// --- INICIALIZAÇÃO E CONFIGURAÇÕES GLOBAIS ---
admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

// Define o nosso token secreto da Hotmart de forma segura.
const hotmartSecretToken = defineString("HOTMART_HOTTOK");


// ===================================================================
// A SUA FUNÇÃO DE WEBHOOK (VERSÃO FINAL E SEGURA)
// ===================================================================
exports.hotmartWebhookHandler = onRequest(
  { secrets: [hotmartSecretToken] }, // Informa à função que ela precisa do segredo para rodar.
  async (request, response) => {
    logger.info("Webhook v2 da Hotmart recebido!", { body: request.body });

    // 1. VERIFICAÇÃO DE SEGURANÇA BÁSICA
    if (request.method !== "POST") {
      logger.warn("Requisição recebida com método não permitido:", request.method);
      response.status(405).send("Método não permitido. Use POST.");
      return;
    }

    // 2. VERIFICAÇÃO DO TOKEN DA HOTMART (hottok)
    const hottokRecebido = request.headers["x-hotmart-hottok"];
    if (hottokRecebido !== hotmartSecretToken.value()) {
      logger.error("Falha na autenticação do Webhook. Hottok inválido.", { hottok: hottokRecebido });
      response.status(401).send("Não autorizado.");
      return;
    }

    // 3. PROCESSAMENTO DOS DADOS
    const eventData = request.body;

    try {
      if (eventData.event === "PURCHASE_APPROVED" || eventData.event === "SUBSCRIPTION_ACTIVATED") {
        const userEmail = eventData.data.buyer.email;

        // TODO: Sua lógica para atualizar o Firestore vai aqui.
        // Exemplo:
        // const userQuery = await admin.firestore().collection('users').where('email', '==', userEmail).get();
        // if (!userQuery.empty) {
        //   const userId = userQuery.docs[0].id;
        //   await admin.firestore().collection('users').doc(userId).update({ assinatura_ativa: true });
        //   logger.info(`Assinatura ativada para o usuário ${userEmail} (ID: ${userId})`);
        // } else {
        //   logger.warn(`Usuário com e-mail ${userEmail} não encontrado no Firestore.`);
        // }
         logger.info(`Lógica de ativação para o usuário ${userEmail} a ser implementada.`);
      }
      
      // ... você pode adicionar outros 'if' para outros eventos aqui (ex: CANCELAMENTO)

      // 4. ENVIAR RESPOSTA DE SUCESSO
      response.status(200).send("Webhook recebido e processado com sucesso.");
    } catch (error) {
      logger.error("Erro ao processar o webhook:", error);
      response.status(500).send("Erro interno ao processar o webhook.");
    }
  }
);