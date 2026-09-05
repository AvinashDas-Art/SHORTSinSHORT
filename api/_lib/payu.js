import crypto from "crypto";

export function secureEqual(received, expected) {
  const left = Buffer.from(String(received || "").toLowerCase());
  const right = Buffer.from(String(expected || "").toLowerCase());
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

/**
 * Recomputes the PayU "reverse" hash for a webhook payload and checks it
 * against the hash PayU sent. This only works when the webhook payload's
 * own fields (udf1-5, productinfo, firstname, email, amount, txnid) are
 * exactly what PayU signed. PayU's Payment Links product does not always
 * populate every field the same way a merchant-initiated hosted checkout
 * does, so this can legitimately fail for a genuine, successful payment.
 * That's why payuVerifyPayment() below exists as an independent fallback.
 */
export function verifyPayuHash(payload, salt) {
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

function verifyApiBase() {
  const env = String(process.env.PAYU_ENV || "production").toLowerCase();
  return env === "test"
    ? "https://test.payu.in/merchant/postservice?form=2"
    : "https://info.payu.in/merchant/postservice?form=2";
}

/**
 * Independently asks PayU whether a given txnid was a genuine, successful
 * payment for this merchant. This is the authoritative, server-to-server
 * source of truth — it does not trust anything the caller supplied except
 * the txnid, so it's safe to use as a fallback when a webhook's own hash
 * fails to verify (a bad actor cannot forge a "success" response from
 * PayU's own servers).
 *
 * Returns null if PayU has no record of this txnid or the lookup itself
 * fails. Otherwise returns the transaction detail object PayU holds for
 * that txnid (mihpayid, status, amt, email, txnid, ...).
 */
export async function payuVerifyPayment({ txnid, key, salt }) {
  if (!txnid || !key || !salt) return null;

  const command = "verify_payment";
  const hash = crypto
    .createHash("sha512")
    .update(`${key}|${command}|${txnid}|${salt}`)
    .digest("hex");

  const body = new URLSearchParams({ key, command, var1: txnid, hash });

  const response = await fetch(verifyApiBase(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) return null;

  const data = await response.json().catch(() => null);
  if (!data || Number(data.status) !== 1 || !data.transaction_details) return null;

  const detail =
    data.transaction_details[txnid] || Object.values(data.transaction_details)[0];
  if (!detail) return null;

  return detail;
}

/**
 * Same call as payuVerifyPayment(), but never collapses a failure into
 * `null` — it returns exactly what PayU's server said back (HTTP status,
 * parsed JSON if it parsed, raw body text otherwise), so a caller that
 * needs to diagnose *why* a lookup failed (wrong txnid vs wrong
 * key/salt vs wrong PAYU_ENV host vs a network/API error) can see it.
 * Never include `key`/`salt` themselves in anything derived from this.
 */
export async function payuVerifyPaymentRaw({ txnid, key, salt }) {
  const command = "verify_payment";
  const hash = crypto
    .createHash("sha512")
    .update(`${key}|${command}|${txnid}|${salt}`)
    .digest("hex");

  const body = new URLSearchParams({ key, command, var1: txnid, hash });
  const apiBase = verifyApiBase();

  let response;
  try {
    response = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch (error) {
    return { apiBase, ok: false, networkError: error.message };
  }

  const text = await response.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch (_error) {
    // Not JSON — fall through, rawBody below carries what PayU actually sent.
  }

  return {
    apiBase,
    ok: response.ok,
    httpStatus: response.status,
    data,
    rawBody: data ? undefined : text.slice(0, 800),
  };
}
