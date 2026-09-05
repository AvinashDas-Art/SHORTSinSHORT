import crypto from "crypto";
import { payuVerifyPayment } from "./_lib/payu.js";
import { adminDb, applyMembershipForPayment } from "./_lib/membership.js";

function secureEqual(received, expected) {
  const left = Buffer.from(String(received || ""));
  const right = Buffer.from(String(expected || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function isAuthorized(req) {
  const configured = process.env.ADMIN_RECONCILE_SECRET;
  if (!configured) return false;

  const header = req.headers.authorization || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  return secureEqual(provided, configured);
}

/**
 * One-time-use admin tool: given a PayU txnid, ask PayU directly whether
 * it was a genuine successful payment (independent of any webhook), and if
 * so activate/extend that payer's membership. Never charges anything —
 * it only reads PayU's own record of a transaction that already happened,
 * and it's safe to call more than once for the same txnid because
 * applyMembershipForPayment() records the paymentId and refuses to apply
 * the same payment twice.
 *
 * Usage, once ADMIN_RECONCILE_SECRET is set in Vercel and deployed:
 *
 *   curl -X POST https://shortsinshort.com/api/admin-reconcile-payment \
 *     -H "Authorization: Bearer <ADMIN_RECONCILE_SECRET>" \
 *     -H "Content-Type: application/json" \
 *     -d '{"txnid":"<the stuck transaction'"'"'s txnid>"}'
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const txnid = String(body.txnid || "").trim();

    if (!txnid) {
      return res.status(400).json({ error: "txnid is required" });
    }

    const merchantKey = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!merchantKey || !salt) {
      throw new Error("PayU verification credentials are not configured");
    }

    const detail = await payuVerifyPayment({ txnid, key: merchantKey, salt });

    if (!detail) {
      return res.status(404).json({ error: "PayU has no record of this txnid" });
    }

    const status = String(detail.status || "").toLowerCase();
    if (status !== "success") {
      return res.status(200).json({
        reconciled: false,
        payuStatus: detail.status,
        reason: "Transaction was not successful at PayU",
      });
    }

    const paymentId = String(detail.mihpayid || detail.txnid || "").replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );

    const email = body.email
      ? String(body.email).trim().toLowerCase()
      : String(detail.email || "").trim().toLowerCase();

    const db = adminDb();
    const { result } = await applyMembershipForPayment({
      db,
      provider: "payu",
      paymentId,
      txnid: detail.txnid,
      amount: detail.amt ?? detail.amount,
      email,
    });

    return res.status(200).json({ reconciled: true, result, email, paymentId });
  } catch (error) {
    console.error("Admin reconcile failed:", error.message);
    return res.status(500).json({ error: "Reconciliation failed" });
  }
}
