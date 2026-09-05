import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.PAYU_KEY;
  const salt = process.env.PAYU_SALT;

  if (!key || !salt) {
    return res.status(500).json({ error: "Payment gateway credentials not configured" });
  }

  const txnid = "TXN" + Date.now();
  const amount = "20.00";
  const productinfo = "CinemaClubSupport";
  const firstname = "Member";
  const email = "member@shortsinshort.com";
  const phone = "9876543210";
  const surl = "https://shortsinshort.com/?payment=success";
  const furl = "https://shortsinshort.com/?payment=failed";

  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();

  return res.status(200).json({
    action: "https://secure.payu.in/_payment",
    params: {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl,
      furl,
      hash
    }
  });
}
