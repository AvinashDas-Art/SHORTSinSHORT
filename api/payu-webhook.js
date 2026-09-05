import crypto from "crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    return Object.fromEntries(new URLSearchParams(body));
  }
  return body;
}

function secureEqual(received, expected) {
  const left = Buffer.from(String(received || "").toLowerCase());
  const right = Buffer.from(String(expected || "").toLowerCase());
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function verifyPayuHash(payload, salt) {
  const reverse = [
    salt,
    payload.status || "",
    "", "", "", "", "", "",
    payload.udf5 || "",
    payload.udf4 || "",
    payload.udf3 || "",
    payload.udf2 || "",
    payload.udf1 || "",
    payload.email || "",
    payload.firstname || "",
    payload.productinfo || "",
    payload.amount || "",
    payload.txnid || "",
    payload.key || "",
  ].join("|");

  const extra = payload.additionalCharges || payload.additional_charges;
  const source = extra ? `${extra}|${reverse}` : reverse;
  const expected = crypto.createHash("sha512").update(source).digest("hex");

  return secureEqual(payload.hash, expected);
}

function adminDb() {
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = parseBody(req.body);
    const merchantKey = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!merchantKey || !salt) {
      throw new Error("PayU verification credentials are not configured");
    }

    if (payload.key !== merchantKey || !verifyPayuHash(payload, salt)) {
      return res.status(401).json({ error: "Invalid PayU signature" });
    }

    const successful =
      String(payload.status).toLowerCase() === "success" &&
      ["captured", "success"].includes(
        String(payload.unmappedstatus || "success").toLowerCase()
      );

    if (!successful) {
      return res.status(200).json({ received: true, activated: false });
    }

    if (Number(payload.amount) !== 20) {
      return res.status(200).json({ received: true, activated: false });
    }

    const paymentId = String(payload.mihpayid || payload.txnid || "")
      .replace(/[^a-zA-Z0-9_-]/g, "");

    if (!paymentId) {
      return res.status(400).json({ error: "Missing payment reference" });
    }

    const email = String(payload.email || "").trim().toLowerCase();
    const db = adminDb();
    const paymentRef = db.collection("payuPayments").doc(paymentId);

    const users = email
      ? await db.collection("users").where("email", "==", email).limit(1).get()
      : null;

    let result = "unmatched";

    await db.runTransaction(async (transaction) => {
      const existingPayment = await transaction.get(paymentRef);

      if (existingPayment.exists) {
        result = "duplicate";
        return;
      }

      const paymentRecord = {
        provider: "payu",
        paymentId,
        txnid: String(payload.txnid || ""),
        amount: Number(payload.amount),
        email,
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
      const expiresAt = Timestamp.fromMillis(base + 28 * 24 * 60 * 60 * 1000);

      transaction.set(
        userRef,
        {
          membershipStatus: "active",
          membershipStartedAt: FieldValue.serverTimestamp(),
          membershipExpiresAt: expiresAt,
          lastPayuPaymentId: paymentId,
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

    return res.status(200).json({ received: true, result });
  } catch (error) {
    console.error("PayU webhook failed:", error.message);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
