// IMPORTANTE: Este arquivo deve ser criado na pasta `public` do seu projeto React.

// Scripts que importam o SDK do Firebase
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// --- Configuração do Firebase -------------------------------------------
// A mesma configuração do seu aplicativo web.
// É crucial que estas chaves sejam preenchidas com seus valores reais do Firebase.
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Obtém uma instância do Cloud Messaging.
const messaging = firebase.messaging();

// Adiciona um manipulador de mensagens em segundo plano.
// É aqui que a "mágica" acontece quando o app não está aberto no navegador.
messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Mensagem recebida em segundo plano.',
    payload
  );

  // Personaliza a notificação que será exibida para o usuário
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png' // Você pode trocar para um ícone seu (ex: /seu-icone.png)
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

