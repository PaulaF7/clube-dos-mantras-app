const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

// ALTERAÇÃO: Importando de forma modular e mais robusta
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const db = getFirestore();
const bucket = getStorage().bucket();
// A variável 'FieldValue' agora vem diretamente da importação acima.

// Configure sua chave de API do SendGrid (definida via Firebase CLI)
sgMail.setApiKey(functions.config().sendgrid.key);

/**
 * Função que envia e-mail quando a resposta do astrólogo é ADICIONADA.
 */
exports.sendAstroAnswerEmail = functions.firestore
  .document("users/{userId}/astroHistory/{answerId}")
  .onUpdate(async (change, context) => { // <-- GATILHO ALTERADO PARA onUpdate
    const before = change.before.data();
    const after = change.after.data();

    // CONDIÇÃO: Só executa se o campo 'response' antes estava vazio e agora não está.
    if (!before.response && after.response) {
      const userId = after.userId;

      if (!userId) {
        console.error("Resposta sem userId, não é possível enviar e-mail.");
        return null;
      }

      try {
        const userDoc = await admin.firestore().collection("users").doc(userId).get();
        const userEmail = userDoc.data()?.email;

        if (!userEmail) {
          console.error("Usuário sem e-mail:", userId);
          return null;
        }

      // Monta mensagem de e-mail inicial
      const msg = {
        to: userEmail,
        from: "contato.evoluo.ir@gmail.com", // configure seu remetente verificado
        subject: "✨ Sua resposta no Mantras Mais já está disponível",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; background: #faf7fd; padding: 20px; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2 style="color: #4a148c; text-align: center;">🌙 Olá, sua resposta já chegou!</h2>
            <p style="font-size: 16px; line-height: 1.5; text-align: center;">
              Você fez uma pergunta ao nosso astrólogo no <strong>Mantras Mais</strong>, e temos uma boa notícia:  
              <br>✨ A resposta já está disponível para você dentro do aplicativo.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://clube-dos-mantras.netlify.app" style="background: #FFD54F; color: #2c0b4d; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                 Acessar minha resposta
              </a>
            </div>
            <p style="font-size: 14px; color: #555; text-align: center;">
              Não esqueça de confirmar no app quando já tiver lido 🌟  
              Assim conseguimos acompanhar seu progresso e manter tudo organizado.
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0d7f7;">
            <p style="font-size: 12px; color: #888; text-align: center;">
              Mantras Mais <br>
              <em>Conectando você com autoconhecimento e harmonia.</em>
            </p>
          </div>
        `,
        };

        await sgMail.send(msg);
        
        // Garante que a resposta começa com isRead = false
        await change.after.ref.update({ isRead: false });

        console.log("E-mail de resposta disponível enviado para:", userEmail);
        return true;
      } catch (error) {
        console.error("Erro ao enviar e-mail de resposta disponível:", error);
        return null;
      }
    }
    
    // Se a condição não for atendida (ex: outra atualização no documento), a função não faz nada.
    return null;
  });

/**
 * Função que envia e-mail quando o usuário confirma leitura de uma resposta.
 */
exports.sendAstroReadConfirmationEmail = functions.firestore
  .document("users/{userId}/astroHistory/{answerId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Só dispara se o campo isRead mudou de false -> true
    if (!before.isRead && after.isRead) {
      const userId = after.userId;

      if (!userId) {
        console.error("Resposta sem userId");
        return null;
      }

      try {
        // Buscar e-mail do usuário no Firestore
        const userDoc = await admin.firestore().collection("users").doc(userId).get();
        const userEmail = userDoc.data()?.email;

        if (!userEmail) {
          console.error("Usuário sem e-mail:", userId);
          return null;
        }

        // Monta mensagem de agradecimento
        const msg = {
          to: userEmail,
          from: "contato.evoluo.ir@gmail.com", // configure seu remetente verificado
          subject: "🙏 Obrigado por acompanhar sua resposta no Mantras Mais",
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; background: #faf7fd; padding: 20px; border-radius: 12px; max-width: 600px; margin: auto;">
              <h2 style="color: #4a148c; text-align: center;">✨ Que bom que você conferiu sua resposta!</h2>
              <p style="font-size: 16px; line-height: 1.5; text-align: center;">
                Ficamos felizes em saber que você já leu a resposta do nosso astrólogo.  
                Continue aproveitando as ferramentas do <strong>Mantras Mais</strong> para fortalecer sua jornada de autoconhecimento 🌟.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://clube-dos-mantras.netlify.app" style="background: #FFD54F; color: #2c0b4d; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Acessar o app novamente
                </a>
              </div>
              <p style="font-size: 14px; color: #555; text-align: center;">
                Estamos sempre aqui para você 💜  
              </p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0d7f7;">
              <p style="font-size: 12px; color: #888; text-align: center;">
                Mantras Mais <br>
                <em>Conectando você com autoconhecimento e harmonia.</em>
              </p>
            </div>
          `,
        };

        await sgMail.send(msg);
        console.log("E-mail de confirmação de leitura enviado para:", userEmail);
        return true;
      } catch (error) {
        console.error("Erro ao enviar e-mail de confirmação de leitura:", error);
        return null;
      }
    }

    return null;
  });


  /**
 * Função que notifica o astrólogo quando uma nova pergunta é criada.
 */
exports.notifyAstrologerOnNewQuestion = functions.firestore
  .document("users/{userId}/astroHistory/{questionId}")
  .onCreate(async (snap, context) => {
    const questionData = snap.data();
    const userId = context.params.userId;

    // ⚠️ IMPORTANTE: Substitua pelo seu e-mail ou o e-mail do astrólogo.
    const ASTROLOGER_EMAIL = "contato.evoluo.ir@gmail.com";

    try {
      // Buscar o nome do usuário para personalizar o e-mail
      const userDoc = await db.collection("users").doc(userId).get();
      const userName = userDoc.data()?.name || "Um usuário";

      const questionText = questionData.question;

      // Monta a mensagem de e-mail para o astrólogo
      const msg = {
        to: ASTROLOGER_EMAIL,
        from: "contato.evoluo.ir@gmail.com", // Seu remetente verificado no SendGrid
        subject: `✨ Nova Pergunta Astrológica de ${userName} no Mantras Mais`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; background: #faf7fd; padding: 20px; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2 style="color: #4a148c;">Nova Pergunta Recebida</h2>
            <p style="font-size: 16px; line-height: 1.5;">
              Uma nova pergunta foi enviada por <strong>${userName}</strong>.
            </p>
            <div style="background: #fff; border: 1px solid #e0d7f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="font-style: italic; color: #555;">"${questionText}"</p>
            </div>
            <p style="font-size: 14px;">
              Para responder, acesse o documento do usuário no Firestore.
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0d7f7;">
            <p style="font-size: 12px; color: #888; text-align: center;">
              Notificação do App Mantras Mais
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`Notificação de nova pergunta enviada para ${ASTROLOGER_EMAIL}`);
      return { success: true };

    } catch (error) {
      console.error("Erro ao notificar astrólogo:", error);
      return { success: false, error: error.message };
    }
  });

  /**
 * Função que envia um e-mail de boas-vindas quando um usuário se torna Premium.
 */
exports.sendWelcomeEmailOnPremium = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before.isPremium && after.isPremium) {
      const userEmail = after.email;
      const userName = after.name || "Ser de Luz";

      if (!userEmail) {
        console.error("Usuário premium sem e-mail. UID:", context.params.userId);
        return null;
      }

      const msg = {
        to: userEmail,
        from: "contato.evoluo.ir@gmail.com",
        subject: "Parabéns pela Assinatura Premium!",
        // Utiliza o template HTML, injetando o conteúdo dinâmico
        html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
        <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
              <meta http-equiv="X-UA-Compatible" content="IE=Edge">
              <style type="text/css">
            body, p, div {
              font-family: inherit;
              font-size: 14px;
            }
            body {
              color: #000000;
            }
            body a {
              color: #1188E6;
              text-decoration: none;
            }
            p { margin: 0; padding: 0; }
            table.wrapper {
              width:100% !important;
              table-layout: fixed;
              -webkit-font-smoothing: antialiased;
              -webkit-text-size-adjust: 100%;
              -moz-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
            @media screen and (max-width:480px) {
              table.wrapper-mobile {
                width: 100% !important;
                table-layout: fixed;
              }
            }
          </style>
              <link href="https://fonts.googleapis.com/css?family=Playfair+Display&display=swap" rel="stylesheet"><style>
            body {font-family: 'Playfair Display', serif;}
        </style></head>
            <body>
              <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
                <div class="webkit">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
                    <tr>
                      <td valign="top" bgcolor="#FFFFFF" width="100%">
                        <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="100%">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                      <tr>
                                        <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
            <tr>
              <td role="module-content">
                <p>Sua jornada de autoconhecimento começa agora.</p>
              </td>
            </tr>
          </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 0px 0px 0px;" bgcolor="#fff5f9" data-distribution="1">
            <tbody>
              <tr role="module-content">
                <td height="100%" valign="top"><table width="580" style="width:580px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
              <tbody>
                <tr>
                  <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="e5a6af02-de55-45d8-b3da-10c95eb9dd64">
                    <tbody><tr><td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor=""></td></tr></tbody>
                  </table>
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="83050002-1a90-4222-ab77-f872b9ea0369" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:18px 30px 18px 30px; line-height:32px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div>
                            <div style="font-family: inherit; text-align: center"><span style="color: #1a3b40; font-size: 30px; font-family: inherit"><strong>Seja Bem-vindo(a) à família Mantras Mais, ${userName}!</strong></span></div>
                            <div style="font-family: inherit; text-align: center; margin-top: 15px;"><span style="color: #1a3b40; font-size: 25px;">Sua assinatura foi ativada e estamos muito felizes em ter você em uma jornada ainda mais profunda.</span></div></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="554531d2-74f6-45e8-9f0b-26b02ac5e585">
                    <tbody><tr><td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center"><img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="339" alt="" data-proportionally-constrained="true" data-responsive="false" src="http://cdn.mcauto-images-production.sendgrid.net/954c252fedab403f/b20c7855-0722-4344-b977-ed6bf0a9cc4f/339x264.png" height="264"></td></tr></tbody>
                  </table>
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="5d09ceb2-7561-4c5b-9ba0-1c41b8c4cb4d" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:50px 30px 0px 30px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div style="font-family: inherit; text-align: center"><span style="color: #1a3b40; font-size: 25px"><strong>O que você desbloqueou:</strong></span></div>
                          <div style="font-family: inherit; text-align: center; color: #1a3b40; font-size: 25px; line-height: 32px; padding-top: 15px;">                            
                            Acesso a <strong>todas as Jornadas</strong> de Prática.<br>
                            <strong>Santuário Pessoal ilimitado</strong> para seus áudios e playlists.<br>
                            Acesso ilimitado ao <strong>Oráculo</strong> e <strong>Astrólogo</strong>.<br>
                            Todas as <strong>Músicas Mântricas</strong> e <strong>Mantras Falados</strong>.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="82c10226-9bcc-4a8a-8388-bbcc015d7798">
                    <tbody>
                      <tr>
                        <td align="center" bgcolor="" class="outer-td" style="padding:20px 0px 50px 0px;">
                          <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                            <tbody>
                              <tr>
                              <td align="center" bgcolor="#ffc107" class="inner-td" style="border-radius:9999px; font-size:16px; text-align:center; background-color:inherit;">
                                <a href="https://clube-dos-mantras.netlify.app/" style="background-color:#ffc107; border:1px solid #ffc107; border-color:#ffc107; border-radius:9999px; border-width:1px; color:#2c0b4d; display:inline-block; font-size:25px; font-weight:bold; letter-spacing:0px; line-height:normal; padding:14px 28px 14px 28px; text-align:center; text-decoration:none; border-style:solid; font-family:Helvetica, Arial, sans-serif;" target="_blank">Começar a Explorar</a>
                              </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table></td>
                </tr>
              </tbody>
            </table></td>
              </tr>
            </tbody>
          </table><div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="background-color:#fff5f9; color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5"><div class="Unsubscribe--addressLine"><p class="Unsubscribe--senderName" style="font-size:15px; line-height:20px;">Mantras Mais</p><p style="font-size:15px; line-height:20px;"><span class="Unsubscribe--senderAddress">contato.evoluo.ir@gmail.com</span></p></div><p style="font-size:15px; line-height:20px;"><a class="Unsubscribe--unsubscribeLink" href="{{{unsubscribe}}}" target="_blank" style="">Cancelar Inscrição</a></p></div></td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
              </center>
            </body>
          </html>
        `,
      };

      try {
        await sgMail.send(msg);
        console.log(`E-mail de boas-vindas Premium enviado para: ${userEmail}`);
        return { success: true };
      } catch (error) {
        console.error("Erro ao enviar e-mail de boas-vindas Premium:", error);
        return { success: false, error: error.message };
      }
    }
    return null;
  });

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
        userId: userId, // <-- CORREÇÃO ADICIONADA AQUI
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

//=====================================================================
//  INÍCIO: MÓDULO MAPA DA MANIFESTAÇÃO
//=====================================================================

// Fonte de verdade para os cálculos de vibração
const HAWKINS_SCALE = [
    { nivel: "Vergonha", hz: 20, rotulo: "Vergonha / Humilhação" },
    { nivel: "Culpa", hz: 30, rotulo: "Culpa / Ofensa" },
    { nivel: "Apatia", hz: 50, rotulo: "Apatia / Desespero" },
    { nivel: "Tristeza", hz: 75, rotulo: "Tristeza / Arrependimento" },
    { nivel: "Medo", hz: 100, rotulo: "Medo / Ansiedade" },
    { nivel: "Desejo", hz: 125, rotulo: "Desejo / Frustração" },
    { nivel: "Raiva", hz: 150, rotulo: "Raiva / Ódio" },
    { nivel: "Orgulho", hz: 175, rotulo: "Orgulho / Desprezo" },
    { nivel: "Coragem", hz: 200, rotulo: "Coragem / Afirmação" },
    { nivel: "Neutralidade", hz: 250, rotulo: "Neutralidade / Verdadeiro" },
    { nivel: "Boa vontade", hz: 310, rotulo: "Boa vontade / Otimista" },
    { nivel: "Aceitação", hz: 350, rotulo: "Aceitação / Perdão" },
    { nivel: "Razão", hz: 400, rotulo: "Razão / Compreensão" },
    { nivel: "Amor", hz: 500, rotulo: "Amor / Reverência" },
    { nivel: "Alegria", hz: 540, rotulo: "Alegria / Serenidade" },
    { nivel: "Paz", hz: 600, rotulo: "Paz / Felicidade" },
    { nivel: "Iluminação", hz: 800, rotulo: "Iluminação / Indescritível" },
];

/**
 * Helper: Encontra o nível de consciência mais próximo para um dado Hz.
 */
const findClosestNivel = (hz) => {
    if (!hz) return null;
    return HAWKINS_SCALE.reduce((prev, curr) =>
        Math.abs(curr.hz - hz) < Math.abs(prev.hz - hz) ? curr : prev
    );
};

/**
 * Helper: Calcula os Pontos de Vibração usando a fórmula logarítmica.
 */
const calculateVibrationPoints = (hz) => {
    if (!hz || hz <= 20) return 0;
    if (hz >= 900) return 100;
    const points = Math.round(
        (Math.log(hz) - Math.log(20)) / (Math.log(900) - Math.log(20)) * 100
    );
    return points;
};

/**
 * Helper: Classificador NLP simples baseado em palavras-chave (fallback).
 */
const NLP_classifyEmotion = (text) => {
    if (!text || typeof text !== "string") return { emotion: null, confidence: 0 };
    const t = text.toLowerCase();
    const mapping = [
      { keywords: ["culpa", "culpado"], nivel: "Culpa" },
      { keywords: ["vergonha", "humilha"], nivel: "Vergonha" },
      { keywords: ["triste", "tristeza", "arrepend"], nivel: "Tristeza" },
      { keywords: ["medo", "ansiedade", "ansioso"], nivel: "Medo" },
      { keywords: ["raiva", "ódio", "odio", "irritad"], nivel: "Raiva" },
      { keywords: ["desejo", "querer", "desejar"], nivel: "Desejo" },
      { keywords: ["orgulho"], nivel: "Orgulho" },
      { keywords: ["coragem", "confiante"], nivel: "Coragem" },
      { keywords: ["neutro", "neutralidade"], nivel: "Neutralidade" },
      { keywords: ["boa vontade", "otimista"], nivel: "Boa vontade" },
      { keywords: ["aceitação", "perdo"], nivel: "Aceitação" },
      { keywords: ["razão", "racional"], nivel: "Razão" },
      { keywords: ["amor", "amoroso", "amando"], nivel: "Amor" },
      { keywords: ["alegria", "feliz", "seren"], nivel: "Alegria" },
      { keywords: ["paz", "felicidade"], nivel: "Paz" },
      { keywords: ["ilumina", "iluminação", "iluminado"], nivel: "Iluminação" },
      { keywords: ["apático", "apatia", "desespero"], nivel: "Apatia" },
    ];
  
    let best = null;
    let bestCount = 0;
    mapping.forEach(m => {
      let count = 0;
      m.keywords.forEach(k => { if (t.includes(k)) count++; });
      if (count > bestCount) { best = m; bestCount = count; }
    });
  
    if (!best) return { emotion: null, confidence: 0 };
  
    const confidence = Math.min(0.95, 0.4 + 0.3 * bestCount);
    return { emotion: best.nivel, confidence };
};

/**
 * Helper: Sugere ações com base no Hz médio.
 */
function suggestActionsForHz(hz) {
    if (!hz) return [];
    const suggestions = [];
    if (hz < 100) {
      suggestions.push({ type: 'respiracao', title: 'Respiração 4-4-8', duration: 5, cta: 'Fazer agora' });
      suggestions.push({ type: 'grounding', title: 'Grounding (calcanhar/respiração)', duration: 5, cta: 'Fazer agora' });
      suggestions.push({ type: 'meditacao', title: 'Meditação guiada (5 min)', duration: 5, cta: 'Fazer agora' });
    } else if (hz < 200) {
      suggestions.push({ type: 'journaling', title: 'Journaling: 3 coisas que posso melhorar', duration: 8, cta: 'Escrever' });
      suggestions.push({ type: 'caminhada', title: 'Caminhada 10 minutos', duration: 10, cta: 'Agendar' });
      suggestions.push({ type: 'reframe', title: 'Técnica de Reframing', duration: 6, cta: 'Fazer agora' });
    } else if (hz < 350) {
      suggestions.push({ type: 'microtarefas', title: '1 micro-tarefa para progresso', duration: 10, cta: 'Criar tarefa' });
      suggestions.push({ type: 'gratidao', title: 'Exercício de gratidão (3 itens)', duration: 5, cta: 'Fazer agora' });
      suggestions.push({ type: 'checklist', title: 'Checklist de pequenas vitórias', duration: 7, cta: 'Fazer agora' });
    } else {
      suggestions.push({ type: 'visualizacao', title: 'Visualização da meta (10 min)', duration: 10, cta: 'Fazer agora' });
      suggestions.push({ type: 'afirmacao', title: 'Afirmações da meta', duration: 5, cta: 'Fazer agora' });
      suggestions.push({ type: 'meditacao_expansiva', title: 'Meditação de expansão/gratidão', duration: 12, cta: 'Fazer agora' });
    }
    return suggestions;
}

/**
 * Cloud Function (Callable): Cria um novo check-in de vibração (versão aprimorada).
 */
exports.createVibrationCheckin = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Você precisa estar logado.");
    const userId = context.auth.uid;

    // Verificação de Premium ou Trial
    await checkPremiumOrTrial(userId);

    const { period, emotionSelected, freeText, intensity = 5, note = null } = data;
    if (!period || (!emotionSelected && !freeText)) {
      throw new functions.https.HttpsError("invalid-argument", "Dados do check-in incompletos.");
    }
  
    let hz, emotionLabel;
    if (emotionSelected) {
      const found = HAWKINS_SCALE.find(e => e.nivel === emotionSelected);
      if (!found) throw new functions.https.HttpsError("not-found", "Emoção selecionada não encontrada.");
      hz = found.hz;
      emotionLabel = found.rotulo;
    } else {
      const { emotion, confidence } = NLP_classifyEmotion(freeText);
      if (!emotion || confidence < 0.7) {
        return { success: false, needsConfirmation: true, suggestion: emotion, confidence };
      }
      const found = HAWKINS_SCALE.find(e => e.nivel === emotion);
      hz = found.hz;
      emotionLabel = found.rotulo;
    }
  
    const hzClamped = Math.max(20, Math.min(900, hz));
    const docData = {
      userId,
      period,
      hz: hzClamped,
      emotionLabel,
      intensity,
      note,
      createdAt: FieldValue.serverTimestamp(),
    };
  
    const ref = await db.collection(`users/${userId}/vibrationCheckins`).doc();
    await ref.set(docData);
    return { success: true, checkinId: ref.id };
});

/**
 * Helper: Verifica se o usuário tem acesso Premium ou se está dentro do período de trial de 24h.
 * Inicia o trial no primeiro uso.
 * @param {string} userId O ID do usuário a ser verificado.
 * @throws {HttpsError} Se o usuário não tiver permissão.
 */
const checkPremiumOrTrial = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : {};

  // Se for assinante Premium, permite o acesso.
  if (userData.isPremium) {
    return true;
  }

  const now = admin.firestore.Timestamp.now();

  // Se não for premium e não tiver um trial iniciado, este é o primeiro uso.
  // Inicia o trial e permite o acesso.
  if (!userData.trialStart) {
    await userRef.set({ trialStart: now }, { merge: true });
    return true;
  }
  
  // Se já tem um trial, verifica se expirou.
  const trialStart = userData.trialStart.toDate();
  const trialExpiration = new Date(trialStart.getTime() + 24 * 60 * 60 * 1000); // 24 horas depois

  if (now.toDate() > trialExpiration) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "O período de teste de 24h expirou. Assine para continuar."
    );
  }

  // Se chegou até aqui, o trial ainda é válido.
  return true;
};

/**
 * Cloud Function (Callable): Salva a meta de manifestação do usuário.
 */
exports.saveManifestationMeta = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Você precisa estar logado.");
  const userId = context.auth.uid;

  // Verificação de Premium ou Trial
  await checkPremiumOrTrial(userId);

  const { titulo, hz_meta } = data;
    if (!titulo || !hz_meta) throw new functions.https.HttpsError("invalid-argument", "Meta inválida.");
    await db.collection("users").doc(userId).set({
      manifestationMeta: {
        titulo,
        hz_meta,
        updatedAt: FieldValue.serverTimestamp()
      }
    }, { merge: true });
    return { success: true };
});

/**
 * Cloud Function (Callable): Calcula e retorna os dados do Mapa da Manifestação (versão aprimorada).
 */
exports.getManifestationMap = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "É necessário estar autenticado.");
    }
    
    const userId = context.auth.uid;

    // Verificação de Premium ou Trial
    await checkPremiumOrTrial(userId);
    
    let startOfDay, endOfDay;

    // Prioriza o timestamp enviado pelo cliente, que é fuso-horário-agnóstico
    if (data.dateMs) {
        startOfDay = new Date(data.dateMs);
    } else {
        // Fallback para o comportamento antigo, menos preciso
        const targetDate = data.date ? new Date(data.date) : new Date();
        const localTimezoneOffset = targetDate.getTimezoneOffset() * 60000;
        const localDate = new Date(targetDate.getTime() - localTimezoneOffset);
        startOfDay = new Date(localDate.toISOString().split('T')[0] + "T00:00:00.000Z");
    }

    endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1); // 23:59:59.999 do mesmo dia

    try {
        const userDocPromise = db.collection('users').doc(userId).get();
        const checkinsPromise = db.collection(`users/${userId}/vibrationCheckins`)
            .where('createdAt', '>=', startOfDay)
            .where('createdAt', '<=', endOfDay)
            .get();

        const [userDoc, checkinsSnapshot] = await Promise.all([userDocPromise, checkinsPromise]);

        const meta = userDoc.exists ? userDoc.data().manifestationMeta : null;
        
        // Objeto para armazenar apenas o check-in mais recente de cada período
        const latestCheckins = {};

        checkinsSnapshot.docs.forEach(doc => {
            const checkinData = doc.data();
            const period = checkinData.period;

            // Se ainda não houver um check-in para este período, ou se o atual for mais recente,
            // armazena/sobrescreve.
            if (!latestCheckins[period] || checkinData.createdAt.toMillis() > latestCheckins[period].createdAt.toMillis()) {
                latestCheckins[period] = checkinData;
            }
        });

        // Converte o objeto de volta para um array para os cálculos
        const finalCheckins = Object.values(latestCheckins);
        
        if (finalCheckins.length === 0) {
            return {
                date: startOfDay.toISOString().split('T')[0],
                checkins: [],
                hz_medio: null,
                nivel: null,
                pontos: 0,
                meta: meta || null,
                suggestions: suggestActionsForHz(null),
            };
        }
        
        let sumWeightedHz = 0;
        let sumWeights = 0;
        
        finalCheckins.forEach(c => {
            const weight = c.intensity || 1;
            sumWeightedHz += c.hz * weight;
            sumWeights += weight;
        });

        const hz_medio = sumWeightedHz / sumWeights;
        const nivel = findClosestNivel(hz_medio);
        const pontos = calculateVibrationPoints(hz_medio);
        
        return {
            date: startOfDay.toISOString().split('T')[0],
            checkins: finalCheckins.map(c => ({ 
                period: c.period, 
                hz: c.hz, 
                emotion: c.emotionLabel, 
                createdAt: c.createdAt ? c.createdAt.toDate().toISOString() : null 
            })).sort((a,b) => (a.createdAt > b.createdAt) ? 1 : -1),
            hz_medio: parseFloat(hz_medio.toFixed(2)),
            nivel,
            pontos,
            meta: meta || null,
            suggestions: suggestActionsForHz(hz_medio),
        };

    } catch (error) {
        functions.logger.error("Erro ao calcular o mapa da manifestação:", error);
        throw new functions.https.HttpsError("internal", "Não foi possível calcular o mapa.");
    }
});
//=====================================================================
//  FIM: MÓDULO MAPA DA MANIFESTAÇÃO
//=====================================================================

/**
 * Cloud Function (Callable): Apaga a meta de manifestação do utilizador.
 */
exports.deleteManifestationMeta = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "É necessário estar autenticado.");
  }
  const userId = context.auth.uid;
  const userRef = db.collection("users").doc(userId);

  try {
    await userRef.update({
      manifestationMeta: FieldValue.delete()
    });
    return { success: true, message: "Meta removida com sucesso." };
  } catch (error) {
    functions.logger.error("Erro ao remover a meta de manifestação:", error);
    throw new functions.https.HttpsError("internal", "Não foi possível remover a meta.");
  }
});