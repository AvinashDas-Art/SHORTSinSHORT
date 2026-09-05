import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = "C93YXO";
  const salt = "zDhUoiR5IDgshAVb40Owm0LAnvhpnwrp";
  const txnid = "Txn" + Date.now();
  const amount = "20.00";
  const productinfo = "CinemaClub";
  const firstname = "Member";
  const email = "member@shortsinshort.com";
  const phone = "9876543210";
  const surl = "https://shortsinshort.com/?payment=success";
  const furl = "https://shortsinshort.com/?payment=failed";
  const service_provider = "payu_paisa";

  // Official PayU Hash Sequence:
  // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
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
      service_provider,
      hash
    }
  });
}
