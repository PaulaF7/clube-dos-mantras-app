// checkPendingSubscription.js
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";

export async function checkPendingSubscription(userEmail, userId) {
  const db = getFirestore();

  try {
    const pendingRef = doc(db, "pending_subscriptions", userEmail.toLowerCase());
    const pendingSnap = await getDoc(pendingRef);

    if (pendingSnap.exists()) {
      // Atualiza assinatura_ativa do usuário
      await fetch(`/updateSubscriptionStatus?uid=${userId}`, {
        method: "POST",
      });

      // Remove pendência
      await deleteDoc(pendingRef);

      return true; // Indica que o usuário foi atualizado para premium
    }

    return false; // Não havia pendência
  } catch (error) {
    console.error("Erro ao verificar assinatura pendente:", error);
    return false;
  }
}