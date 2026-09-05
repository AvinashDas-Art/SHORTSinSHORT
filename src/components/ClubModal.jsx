import React from 'react';
import { useAuth } from '../context/AuthContext';

const SUBSCRIPTION_LINK = 'https://rzp.io/rzp/B9Z7fmQU';

const copy = {
  hi: {
    back: 'वापस',
    eyebrow: 'SHORTSinSHORT CINEMA CLUB',
    title: 'फ़िल्में मुफ़्त। सदस्यता हमारी क्यूरेशन की।',
    intro: '₹5 प्रति सप्ताह से SHORTSinSHORT की स्वतंत्र क्यूरेशन, मूल संपादकीय काम और सिनेमा-कम्युनिटी को सहयोग दें। किसी YouTube फ़िल्म को देखने के लिए भुगतान नहीं लिया जाता।',
    price: '₹5',
    cadence: 'प्रति सप्ताह',
    join: 'Cinema Club से जुड़ें — ₹5/सप्ताह',
    payment: 'सुरक्षित भुगतान Razorpay पर पूरा होगा। सदस्यता कभी भी रद्द की जा सकती है।',
    delivery: 'Launch phase में welcome और Club updates उस email पर भेजे जाएंगे, जो आप payment के समय देंगे।',
    profileOptional: 'प्रोफ़ाइल बनाना वैकल्पिक है। सदस्यता को प्रोफ़ाइल से जोड़ने के लिए payment में वही email इस्तेमाल करें।',
    signedIn: 'इस प्रोफ़ाइल का email payment में भी इस्तेमाल करें:',
    included: 'आपको क्या मिलेगा',
    benefits: [
      ['हर सप्ताह Curator’s Five', 'पाँच चुनी हुई फ़िल्मों का नया कार्यक्रम, सही viewing order और SHORTSinSHORT का मूल curator note।'],
      ['मासिक Cinema Room', 'शॉर्ट सिनेमा, craft और नई आवाज़ों पर members-only ऑनलाइन बातचीत।'],
      ['Member Jury', 'अगली theme, spotlight और community programme चुनने में मतदान।'],
      ['मूल Cinema Notebook', 'SHORTSinSHORT/Equal Tales की अपनी या विधिवत अधिकृत essays, interviews और filmmaking resources।'],
    ],
    promise: 'सार्वजनिक catalogue, search और सभी embedded फ़िल्में हर दर्शक के लिए मुफ़्त रहेंगी।',
  },
  en: {
    back: 'Back',
    eyebrow: 'SHORTSinSHORT CINEMA CLUB',
    title: 'Films stay free. Membership supports our curation.',
    intro: 'For ₹5 a week, support SHORTSinSHORT’s independent curation, original editorial work and cinema community. We never charge for watching a YouTube film.',
    price: '₹5',
    cadence: 'per week',
    join: 'Join Cinema Club — ₹5/week',
    payment: 'Secure 256-bit encrypted checkout via PayU. UPI, Cards & NetBanking accepted.',
    delivery: 'During launch, your welcome note and Club updates will be sent to the email provided at checkout.',
    profileOptional: 'A profile is optional. To link membership later, use the same email at checkout.',
    signedIn: '',
    included: 'What members receive',
    benefits: [
      ['Curator’s Five, every week', 'A fresh five-film programme with a considered viewing order and an original SHORTSinSHORT curator note.'],
      ['Monthly Cinema Room', 'A members-only online conversation about short cinema, craft and emerging voices.'],
      ['Member Jury', 'Vote on the next theme, spotlight and community programme.'],
      ['Original Cinema Notebook', 'Essays, interviews and filmmaking resources owned by or expressly licensed to SHORTSinSHORT/Equal Tales.'],
    ],
    promise: 'The public catalogue, discovery tools and every embedded film remain free for every viewer.',
  },
};


    const handlePayUCheckout = async () => {
    const txnid = "TXN" + Date.now();
    const amount = "20.00";
    const productinfo = "CinemaClub";
    const firstname = "Member";
    const email = "club@shortsinshort.com";
    const phone = "9876543210";
    const key = "C93YXO";
    const salt = "zDhUoiR5IDgshAVb40Owm0LAnvhpnwrp";

    // Standard PayU hash string: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
    const hashString = key + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + salt;

    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-512", enc.encode(hashString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://secure.payu.in/_payment";

    const fields = {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: "https://shortsinshort.com/?payment=success",
      furl: "https://shortsinshort.com/?payment=failed",
      hash,
      service_provider: "payu_paisa"
    };

    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

export default function ClubModal({ onClose, lang }) {
  const text = copy[lang === 'hi' ? 'hi' : 'en'];
  const { currentUser, isConfigured } = useAuth();

  const handleSubscribe = () => {
    const checkout = handlePayUCheckout();
    if (checkout) checkout.opener = null;
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[#171816] px-4 py-8 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onClose}
          className="mb-8 border-0 bg-transparent text-xs font-semibold text-zinc-400 transition hover:text-white"
        >
          ← {text.back}
        </button>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#28221d] via-[#1d1e1b] to-[#121311] shadow-2xl">
          <div className="grid gap-10 p-7 md:grid-cols-[1.2fr_.8fr] md:p-14">
            <div>
              <p className="mb-5 text-[.65rem] font-extrabold tracking-[.22em] text-amber-300">{text.eyebrow}</p>
              <h1 className="max-w-3xl font-serif text-4xl font-normal leading-[.98] tracking-[-.04em] text-[#f7f1e7] md:text-6xl">
                {text.title}
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">{text.intro}</p>
              <p className="mt-5 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs leading-5 text-emerald-100">
                ✓ {text.promise}
              </p>
            </div>

            <aside className="flex flex-col justify-between rounded-3xl border border-white/10 bg-black/30 p-6 md:p-8">
              <div>
                <strong className="block text-5xl font-black text-white">{text.price}</strong>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-[.16em] text-zinc-400">{text.cadence}</span>
              </div>
              <div className="mt-10">
                <button
                  type="button"
                  onClick={handleSubscribe}
                  className="w-full rounded-full bg-[#ff6256] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-red-950/30 transition hover:bg-[#ff756b] focus:outline-none focus:ring-2 focus:ring-[#ff8b82]"
                >
                  {text.join}
                </button>
                <p className="mt-3 text-center text-[.68rem] leading-5 text-zinc-500">{text.payment}</p>
                <p className="mt-2 text-center text-[.68rem] leading-5 text-zinc-400">{text.delivery}</p>
                {isConfigured && !currentUser && <p className="mt-2 text-center text-[.68rem] leading-5 text-zinc-400">{text.profileOptional}</p>}
                {currentUser?.email && <p className="mt-2 text-center text-[.68rem] leading-5 text-amber-200">{text.signedIn} {currentUser.email}</p>}
              </div>
            </aside>
          </div>

          <div className="border-t border-white/10 bg-black/15 p-7 md:p-14">
            <h2 className="font-serif text-3xl font-normal text-white">{text.included}</h2>
            <div className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2">
              {text.benefits.map(([title, description], index) => (
                <article key={title} className="bg-[#1b1c19] p-6 md:p-8">
                  <span className="text-xs font-black text-[#e9b96e]">0{index + 1}</span>
                  <h3 className="mt-3 text-base font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
