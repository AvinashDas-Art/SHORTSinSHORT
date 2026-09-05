import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";

const MEMBERSHIP_DAYS = 28;
const MEMBERSHIP_AMOUNT = 20;

export function adminDb() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured");
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  return getFirestore();
}

/**
 * Activates (or extends) a member's SHORTSinSHORT Cinema Club membership
 * for one confirmed ₹20 payment, and records the payment so the same
 * transaction can never be applied twice — no matter how many times this
 * function is called for the same paymentId (webhook retry, manual
 * reconciliation, etc.).
 *
 * `source` here must already be verified true by the caller (either PayU's
 * own webhook hash, or PayU's verify_payment API) — this function itself
 * does not re-check authenticity, it only applies the outcome.
 */
export async function applyMembershipForPayment({
  db,
  provider = "payu",
  paymentId,
  txnid,
  amount,
  email,
}) {
  const cleanPaymentId = String(paymentId || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!cleanPaymentId) {
    return { result: "invalid", reason: "missing_payment_id" };
  }

  if (Number(amount) !== MEMBERSHIP_AMOUNT) {
    return { result: "ignored", reason: "amount_mismatch" };
  }

  const cleanEmail = String(email || "").trim().toLowerCase();
  const paymentRef = db.collection("payuPayments").doc(cleanPaymentId);

  const users = cleanEmail
    ? await db.collection("users").where("email", "==", cleanEmail).limit(1).get()
    : null;

  let result = "unmatched";

  await db.runTransaction(async (transaction) => {
    const existingPayment = await transaction.get(paymentRef);

    if (existingPayment.exists) {
      result = "duplicate";
      return;
    }

    const paymentRecord = {
      provider,
      paymentId: cleanPaymentId,
      txnid: String(txnid || ""),
      amount: Number(amount),
      email: cleanEmail,
      status: "success",
      receivedAt: FieldValue.serverTimestamp(),
    };

    if (!users || users.empty) {
      transaction.set(paymentRef, {
        ...paymentRecord,
        membershipApplied: false,
      });
      return;
    }

    const userRef = users.docs[0].ref;
    const userSnapshot = await transaction.get(userRef);
    const profile = userSnapshot.data() || {};
    const now = Date.now();
    const oldExpiry = profile.membershipExpiresAt?.toMillis?.() || 0;
    const base = Math.max(now, oldExpiry);
    const expiresAt = Timestamp.fromMillis(base + MEMBERSHIP_DAYS * 24 * 60 * 60 * 1000);

    transaction.set(
      userRef,
      {
        membershipStatus: "active",
        membershipStartedAt: FieldValue.serverTimestamp(),
        membershipExpiresAt: expiresAt,
        lastPayuPaymentId: cleanPaymentId,
      },
      { merge: true }
    );

    transaction.set(paymentRef, {
      ...paymentRecord,
      membershipApplied: true,
      userId: userRef.id,
      membershipExpiresAt: expiresAt,
    });

    result = "activated";
  });

  return { result };
}
