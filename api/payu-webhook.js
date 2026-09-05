import { verifyPayuHash, payuVerifyPayment } from "./_lib/payu.js";
import { adminDb, applyMembershipForPayment } from "./_lib/membership.js";

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    return Object.fromEntries(new URLSearchParams(body));
  }
  return body;
}

function isSuccessStatus(status, unmappedstatus) {
  const successStatus = String(status || "").toLowerCase() === "success";
  const successUnmapped = ["captured", "success"].includes(
    String(unmappedstatus || "success").toLowerCase()
  );
  return successStatus && successUnmapped;
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

    const keyMatches = payload.key === merchantKey;
    const hashMatches = keyMatches && verifyPayuHash(payload, salt);

    // The webhook payload's own hash is the fast path. PayU's Payment
    // Links product doesn't always populate udf/productinfo/firstname the
    // same way a merchant-initiated hosted checkout would, so a genuine
    // successful payment can still fail this check. Rather than reject it,
    // fall back to asking PayU directly (server-to-server) whether this
    // txnid really was a successful payment for our merchant account.
    // That answer can't be forged by whoever is calling our webhook.
    let verified = hashMatches;
    let source = payload;

    if (!verified) {
      const txnid = payload.txnid || payload.mihpayid;
      const confirmed = await payuVerifyPayment({ txnid, key: merchantKey, salt });

      if (confirmed) {
        verified = true;
        source = confirmed;
      }
    }

    if (!verified) {
      return res.status(401).json({ error: "Invalid PayU signature" });
    }

    const status = source.status;
    const unmappedstatus = source.unmappedstatus;
    if (!isSuccessStatus(status, unmappedstatus)) {
      return res.status(200).json({ received: true, activated: false });
    }

    const paymentId = String(source.mihpayid || source.txnid || "").replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );

    if (!paymentId) {
      return res.status(400).json({ error: "Missing payment reference" });
    }

    const db = adminDb();
    const { result } = await applyMembershipForPayment({
      db,
      provider: "payu",
      paymentId,
      txnid: source.txnid,
      amount: source.amount ?? source.amt,
      email: source.email,
    });

    return res.status(200).json({ received: true, result });
  } catch (error) {
    console.error("PayU webhook failed:", error.message);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
