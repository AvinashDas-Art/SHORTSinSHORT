import React from 'react';

const COMPANY = 'Equal Tales Entertainment Pvt Ltd';
const ADDRESS = '1405, Sevilla, Raheja Exotica, Madh, Malad (W), Mumbai 400061';
const EMAIL = 'equaltales@gmail.com';
const PHONE = '9811908884';

const pages = {
  content: {
    en: {
      title: 'Content, Streaming & Copyright Policy',
      intro: 'SHORTSinSHORT is a curated discovery and promotional platform for independent, regional and global short cinema.',
      sections: [
        ['How films appear here', [
          'SHORTSinSHORT does not download, re-upload or sell third-party video files. Public films are shown through official embed players, including YouTube.',
          'The underlying films, channels, copyrights and monetisation rights remain with their creators, producers or lawful rights holders.',
          'Every publicly embedded film remains free to watch. Cinema Club membership is never required to play a film.',
        ]],
        ['Curation and submissions', [
          'Selection, categorisation and editorial notes are independent SHORTSinSHORT curation. A listing is not a transfer of copyright or ownership.',
          'SHORTSinSHORT currently does not charge filmmakers a submission or listing fee. If a separate paid review service is introduced later, its price, deliverables and non-selection terms will be disclosed before payment.',
        ]],
        ['Removal and grievances', [
          `A creator, copyright owner or authorised representative may request correction or removal at ${EMAIL}. Please include the film URL, proof of authority and the action requested.`,
          'We aim to acknowledge complete complaints promptly and review removal requests within 24 to 48 hours.',
        ]],
      ],
    },
    hi: {
      title: 'कंटेंट, स्ट्रीमिंग और कॉपीराइट नीति',
      intro: 'SHORTSinSHORT स्वतंत्र, क्षेत्रीय और वैश्विक शॉर्ट सिनेमा का curated discovery और promotional platform है।',
      sections: [
        ['फ़िल्में यहां कैसे दिखाई जाती हैं', [
          'SHORTSinSHORT तीसरे पक्ष की वीडियो फ़ाइलें download, re-upload या बेचता नहीं है। सार्वजनिक फ़िल्में YouTube समेत आधिकारिक embed players से दिखाई जाती हैं।',
          'फ़िल्म, channel, copyright और monetisation के अधिकार मूल निर्माता, producer या वैध rights holder के पास रहते हैं।',
          'हर सार्वजनिक embedded फ़िल्म मुफ़्त रहती है। किसी फ़िल्म को चलाने के लिए Cinema Club membership ज़रूरी नहीं है।',
        ]],
        ['क्यूरेशन और submissions', [
          'फ़िल्मों का चुनाव, वर्गीकरण और editorial notes SHORTSinSHORT की स्वतंत्र क्यूरेशन हैं। Listing से copyright या ownership का transfer नहीं होता।',
          'इस समय SHORTSinSHORT फ़िल्ममेकर्स से submission या listing fee नहीं लेता। भविष्य में अलग paid review service शुरू हुई तो भुगतान से पहले उसकी क़ीमत, मिलने वाली सेवा और non-selection terms साफ़ बतायी जाएंगी।',
        ]],
        ['Removal और शिकायत', [
          `Creator, copyright owner या अधिकृत प्रतिनिधि ${EMAIL} पर correction या removal request भेज सकते हैं। फ़िल्म का URL, अधिकार का प्रमाण और मांगी गयी कार्रवाई साथ भेजें।`,
          'पूरी जानकारी वाली शिकायत मिलने पर हम तुरंत जवाब देने और 24 से 48 घंटे में removal request की समीक्षा करने की कोशिश करेंगे।',
        ]],
      ],
    },
  },
  membership: {
    en: {
      title: 'Cinema Club Membership Terms',
      intro: 'Cinema Club is an optional viewer membership operated by Equal Tales Entertainment Pvt Ltd.',
      sections: [
        ['Price and billing', [
          'The introductory membership price is ₹5 per week. The recurring amount and frequency are displayed again on Razorpay before authorisation.',
          'Payments support SHORTSinSHORT’s original editorial curation and community programme. They do not buy, unlock or license access to any YouTube film.',
        ]],
        ['Member programme', [
          'The programme includes Curator’s Five, original curator notes, the monthly Cinema Room, Member Jury participation and owned or expressly licensed Cinema Notebook resources.',
          'Schedules, formats and individual programme items may evolve. Material changes will be communicated to active members.',
        ]],
        ['Fair use of membership', [
          'Member communications and original resources are for the member’s personal, non-commercial use. They may not be resold, bulk-copied or redistributed.',
          'The public film catalogue and all embedded films remain available without membership.',
        ]],
      ],
    },
    hi: {
      title: 'Cinema Club सदस्यता की शर्तें',
      intro: `Cinema Club दर्शकों की वैकल्पिक सदस्यता है, जिसे ${COMPANY} संचालित करता है।`,
      sections: [
        ['क़ीमत और billing', [
          'शुरुआती सदस्यता ₹5 प्रति सप्ताह है। Razorpay पर अनुमति देने से पहले recurring amount और उसकी अवधि फिर से दिखाई जाएगी।',
          'भुगतान SHORTSinSHORT की मूल editorial curation और community programme के लिए है। इससे किसी YouTube फ़िल्म का access ख़रीदा, खोला या license नहीं किया जाता।',
        ]],
        ['Members को मिलने वाला programme', [
          'Programme में Curator’s Five, मूल curator notes, मासिक Cinema Room, Member Jury और SHORTSinSHORT की अपनी या अधिकृत Cinema Notebook सामग्री शामिल है।',
          'Programme की तारीख़, format और अलग-अलग हिस्से समय के साथ बेहतर किये जा सकते हैं। बड़ा बदलाव active members को बताया जाएगा।',
        ]],
        ['Membership का सही इस्तेमाल', [
          'Member communications और original resources निजी और non-commercial इस्तेमाल के लिए हैं। इन्हें बेचा, bulk-copy या redistribute नहीं किया जा सकता।',
          'Public film catalogue और सभी embedded फ़िल्में membership के बिना भी उपलब्ध रहेंगी।',
        ]],
      ],
    },
  },
  refunds: {
    en: {
      title: 'Cancellation & Refund Policy',
      intro: 'This policy applies to SHORTSinSHORT Cinema Club recurring membership payments.',
      sections: [
        ['Cancellation', [
          `Members may request cancellation at any time by emailing ${EMAIL} from the email used for payment, with the Razorpay payment or subscription ID.`,
          'Cancellation stops future renewals. Access to already-issued member material may continue until the end of the paid billing period.',
        ]],
        ['Refunds', [
          'A refund may be requested for a duplicate charge, an unauthorised charge reported by the payer, or a paid membership that we could not activate because of a verified fault on our side.',
          'Send the request within 7 calendar days of the charge. We aim to decide complete requests within 7 business days. Approved refunds are returned to the original payment method; the bank or payment provider controls the final settlement time.',
          'A change of mind after member services or material have been delivered is normally not refundable, except where required by law.',
        ]],
      ],
    },
    hi: {
      title: 'Cancellation और Refund Policy',
      intro: 'यह नीति SHORTSinSHORT Cinema Club की recurring membership payments पर लागू होती है।',
      sections: [
        ['Cancellation', [
          `Member कभी भी payment वाले email से ${EMAIL} पर Razorpay payment या subscription ID भेजकर cancellation मांग सकते हैं।`,
          'Cancellation से आगे की renewal रुक जाएगी। पहले से जारी member material का access paid billing period ख़त्म होने तक रह सकता है।',
        ]],
        ['Refund', [
          'Duplicate charge, payer की शिकायत पर verified unauthorised charge या हमारी पुष्टि की गयी तकनीकी ग़लती के कारण activate न हो सकी paid membership पर refund मांगा जा सकता है।',
          'Charge के 7 calendar days के भीतर request भेजें। पूरी जानकारी मिलने के बाद हम 7 business days में फ़ैसला करने की कोशिश करेंगे। मंज़ूर refund उसी payment method पर लौटेगा; आख़िरी settlement time बैंक या payment provider तय करता है।',
          'Member service या material मिलने के बाद केवल मन बदलने पर आम तौर पर refund नहीं होगा, सिवाय वहां जहां क़ानून इसकी मांग करता हो।',
        ]],
      ],
    },
  },
  privacy: {
    en: {
      title: 'Privacy Policy',
      intro: 'We collect only the information reasonably needed to operate SHORTSinSHORT and Cinema Club.',
      sections: [
        ['Information and purpose', [
          'We may receive your name, email, support correspondence, membership status and Razorpay transaction or subscription reference. This is used to provide member services, resolve payments, prevent abuse and send essential service communication.',
          'Payment credentials such as full card or UPI details are processed by Razorpay and are not stored by SHORTSinSHORT.',
        ]],
        ['Storage and sharing', [
          'We do not sell personal information. It may be shared with service providers only as needed for hosting, authentication, payment processing, communication, security or legal compliance.',
          `For access, correction or deletion requests, email ${EMAIL}. Records required for tax, accounting, fraud prevention or legal compliance may be retained for the applicable period.`,
        ]],
      ],
    },
    hi: {
      title: 'Privacy Policy',
      intro: 'हम केवल उतनी जानकारी लेते हैं, जितनी SHORTSinSHORT और Cinema Club चलाने के लिए ज़रूरी है।',
      sections: [
        ['जानकारी और उसका इस्तेमाल', [
          'हमें आपका नाम, email, support correspondence, membership status और Razorpay transaction या subscription reference मिल सकता है। इसका इस्तेमाल member service देने, payment समस्या सुलझाने, ग़लत इस्तेमाल रोकने और ज़रूरी service communication के लिए होता है।',
          'पूरे card या UPI details जैसी payment credentials Razorpay process करता है। SHORTSinSHORT इन्हें store नहीं करता।',
        ]],
        ['Storage और sharing', [
          'हम निजी जानकारी बेचते नहीं हैं। Hosting, authentication, payment processing, communication, security या क़ानूनी ज़िम्मेदारी के लिए ज़रूरत भर service providers से साझा की जा सकती है।',
          `अपनी जानकारी देखने, ठीक कराने या मिटाने के लिए ${EMAIL} पर लिखें। Tax, accounting, fraud prevention या क़ानूनी ज़िम्मेदारी के records ज़रूरी अवधि तक रखे जा सकते हैं।`,
        ]],
      ],
    },
  },
  contact: {
    en: {
      title: 'About & Contact',
      intro: 'SHORTSinSHORT is an independent cinema initiative operated by Equal Tales Entertainment Pvt Ltd.',
      sections: [
        ['Business details', [
          `Legal entity: ${COMPANY}`,
          `Registered business address: ${ADDRESS}`,
          `Public support email: ${EMAIL}`,
          `Support phone: +91 ${PHONE}`,
        ]],
        ['What we do', [
          'We discover, organise and editorially curate independent, regional and global short films that are publicly embeddable from their original platforms.',
          'Cinema Club is a viewer-supported editorial and community programme. SHORTSinSHORT currently does not charge filmmakers a submission fee.',
        ]],
      ],
    },
    hi: {
      title: 'हमारे बारे में और संपर्क',
      intro: `SHORTSinSHORT स्वतंत्र सिनेमा की पहल है, जिसे ${COMPANY} संचालित करता है।`,
      sections: [
        ['Business details', [
          `क़ानूनी संस्था: ${COMPANY}`,
          `Business address: ${ADDRESS}`,
          `Public support email: ${EMAIL}`,
          `Support phone: +91 ${PHONE}`,
        ]],
        ['हम क्या करते हैं', [
          'हम स्वतंत्र, क्षेत्रीय और वैश्विक शॉर्ट फ़िल्मों को खोजते, व्यवस्थित करते और editorial नज़र से curate करते हैं। फ़िल्में उनके मूल platform के public embeds से दिखाई जाती हैं।',
          'Cinema Club दर्शकों के सहयोग से चलने वाला editorial और community programme है। इस समय SHORTSinSHORT फ़िल्ममेकर्स से submission fee नहीं लेता।',
        ]],
      ],
    },
  },
};

export default function LegalPage({ page = 'content', lang, onBack }) {
  const selected = pages[page] || pages.content;
  const text = selected[lang === 'hi' ? 'hi' : 'en'];

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[#171816] px-4 py-8 md:px-8 md:py-14">
      <article className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[#1e1f1c] p-6 shadow-2xl md:p-12">
        <button type="button" onClick={onBack} className="mb-8 border-0 bg-transparent text-xs font-semibold text-zinc-400 hover:text-white">
          ← {lang === 'hi' ? 'वापस' : 'Back'}
        </button>
        <p className="text-[.62rem] font-extrabold tracking-[.2em] text-[#e9b96e]">SHORTSinSHORT</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-[-.035em] text-[#f7f1e7] md:text-6xl">{text.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">{text.intro}</p>
        <div className="mt-10 space-y-9 border-t border-white/10 pt-9">
          {text.sections.map(([heading, paragraphs]) => (
            <section key={heading}>
              <h2 className="text-lg font-bold text-white">{heading}</h2>
              <div className="mt-3 space-y-3">
                {paragraphs.map((paragraph) => <p key={paragraph} className="text-sm leading-7 text-zinc-400">{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 border-t border-white/10 pt-5 text-[.68rem] text-zinc-500">Last updated: 3 September 2026</p>
      </article>
    </section>
  );
}
