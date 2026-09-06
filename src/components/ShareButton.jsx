import React, { useState } from 'react';

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" /><line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
  </svg>
);

// Uses the native share sheet (navigator.share) where the browser supports
// it - the common case on phones, which is where sharing actually happens.
// Elsewhere (most desktop browsers) it falls back to copying the link and
// shows a small "Link copied" toast for a couple of seconds.
export default function ShareButton({ url, title, text, lang = 'en', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (event) => {
    event.stopPropagation();
    const shareUrl = url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch (error) {
        // AbortError just means the person closed the native share sheet -
        // nothing to report.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      window.prompt(lang === 'hi' ? 'यह लिंक कॉपी कर लीजिए:' : 'Copy this link:', shareUrl);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="sis3-share-wrap">
      <button
        type="button"
        onClick={handleShare}
        className={className}
        aria-label={lang === 'hi' ? 'शेयर करें' : 'Share'}
      >
        <ShareIcon />
      </button>
      {copied && (
        <span className="sis3-share-toast" role="status">
          {lang === 'hi' ? 'लिंक कॉपी हो गया' : 'Link copied'}
        </span>
      )}
    </span>
  );
}
