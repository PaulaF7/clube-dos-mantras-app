/**
 * =================================================================
 * Clube dos Mantras - Backend com Firebase Functions
 * =================================================================
 *
 * Este arquivo contém a lógica do servidor para o aplicativo.
 * A principal função é o `hotmartWebhookHandler`, que recebe
 * notificações de pagamento da Hotmart para automatizar a
 * liberação de acesso premium aos usuários.
 *
 * Para configurar as variáveis de ambiente (como o hottok):
 * Use o comando da Firebase CLI no seu terminal:
 * firebase functions:config:set hotmart.hottok="SEU_TOKEN_SECRETO_DA_HOTMART"
 *
 * Depois de configurar, faça o deploy das suas funções com:
 * firebase deploy --only functions
 *
 */

// Importações dos módulos do Firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa o SDK do Firebase Admin para permitir acesso ao Firestore
admin.initializeApp();
const db = admin.firestore();

/**
 * =================================================================
 * Webhook Handler para a Hotmart
 * =================================================================
 * Endpoint: /hotmartWebhookHandler
 *
 * Esta função é acionada sempre que a Hotmart envia um evento para
 * o URL do webhook configurado.
 *
 * Fluxo:
 * 1. Validação de Segurança: Verifica se o `hottok` recebido no
 * header corresponde ao token configurado, garantindo que a
 * requisição é legítima e veio da Hotmart.
 *
 * 2. Processamento do Evento: Filtra apenas eventos de compra
 * aprovada (`PURCHASE_APPROVED`) ou assinatura ativada
 * (`SUBSCRIPTION_ACTIVATED`).
 *
 * 3. Busca de Usuário: Procura no banco de dados (`users`) por um
 * usuário com o mesmo e-mail do comprador.
 *
 * 4. Lógica de Ativação:
 * - Se o usuário JÁ EXISTE: O campo `assinatura_ativa` do
 * documento do usuário é atualizado para `true`.
 * - Se o usuário NÃO EXISTE: Um novo documento é criado na
 * coleção `pending_users` com o e-mail do comprador. Este
 * registro será usado para ativar a assinatura quando o
 * usuário criar sua conta no aplicativo.
 */
exports.hotmartWebhookHandler = functions
  .region("southamerica-east1") // Recomendado definir a região para menor latência
  .https.onRequest(async (request, response) => {
    // Log para registrar o recebimento do webhook (útil para depuração)
    functions.logger.info("Webhook da Hotmart recebido!", {
      headers: request.headers,
      body: request.body,
    });

    // 1. Validação de Segurança com o Hottok
    try {
      const hottokRecebido = request.headers["x-hotmart-hottok"];
      // Pega o token configurado nas variáveis de ambiente do Firebase
      const tokenConfigurado = functions.config().hotmart.hottok;

      if (!hottokRecebido || hottokRecebido !== tokenConfigurado) {
        functions.logger.error("Falha na autenticação do Webhook: Hottok inválido ou ausente.", {
            recebido: hottokRecebido,
        });
        // Retorna status 401 (Não Autorizado) se o token for inválido
        return response.status(401).send("Acesso não autorizado.");
      }

      // 2. Processamento do Evento
      const eventData = request.body;

      // Verifica se o evento é de compra aprovada ou assinatura ativada
      if (eventData && (eventData.event === "PURCHASE_APPROVED" || eventData.event === "SUBSCRIPTION_ACTIVATED")) {
        // Extrai o e-mail do comprador dos dados do evento
        const userEmail = eventData.data?.buyer?.email;

        if (!userEmail) {
            functions.logger.warn("Webhook recebido sem e-mail do comprador.", { body: eventData });
            return response.status(400).send("E-mail do comprador não encontrado no payload.");
        }
        
        const emailNormalizado = userEmail.toLowerCase().trim();

        // 3. Busca de Usuário no Firestore
        const usersRef = db.collection("users");
        const userQuery = usersRef.where("email", "==", emailNormalizado);
        const snapshot = await userQuery.get();

        // 4. Lógica de Ativação
        if (!snapshot.empty) {
          // Cenário 1: Usuário já tem conta no app.
          const userDoc = snapshot.docs[0];
          await userDoc.ref.update({ assinatura_ativa: true });
          functions.logger.info(`Assinatura premium ativada com sucesso para o usuário existente: ${emailNormalizado} (UID: ${userDoc.id})`);
        } else {
          // Cenário 2: Usuário ainda não tem conta.
          // Salva o e-mail na coleção de usuários pendentes.
          // O ID do documento será o próprio e-mail para facilitar a busca no lado do cliente.
          const pendingUserRef = db.collection("pending_users").doc(emailNormalizado);
          await pendingUserRef.set({
            email: emailNormalizado,
            status: "pending_activation",
            purchase_event: eventData.event,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          functions.logger.info(`Assinatura pendente registrada para o novo usuário: ${emailNormalizado}`);
        }
      } else {
        functions.logger.info("Evento recebido não requer ação.", { event: eventData.event });
      }

      // Responde à Hotmart com status 200 para confirmar o recebimento
      return response.status(200).send("Webhook processado com sucesso.");

    } catch (error) {
      functions.logger.error("Erro crítico ao processar o webhook da Hotmart:", error);
      // Retorna um erro 500 em caso de falha interna
      return response.status(500).send("Erro interno no servidor.");
    }
  });
