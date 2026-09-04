import React, { useState, useEffect } from "react";

export default function InstallPwa({ lang = "en" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      setIsStandalone(true);
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  if (isStandalone) return null;
  if (!deferredPrompt && !isIos) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="text-xs font-bold px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-500 transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
        title="Install Web App"
      >
        <span>📲</span>
        <span>{lang === "hi" ? "ऐप इंस्टॉल करें" : "Install App"}</span>
      </button>

      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="text-base font-bold text-white">
              {lang === "hi" ? "iPhone पर ऐप कैसे इंस्टॉल करें" : "Install on iPhone"}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {lang === "hi"
                ? "Safari ब्राउज़र में नीचे शेयर बटन (Share) दबाएँ और फिर Add to Home Screen चुनें।"
                : "Tap the Share icon at the bottom of Safari, then choose Add to Home Screen."}
            </p>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full bg-red-600 text-white font-bold text-xs py-2.5 rounded-xl"
            >
              {lang === "hi" ? "समझ गया" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
