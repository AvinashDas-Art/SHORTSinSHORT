import React, { useEffect, useRef, useState } from 'react';

const DURATION_MS = 1400;

// A brief, silent logo flourish on every fresh load - the "opening the app"
// moment, Netflix-style, but without sound: browsers block audio from
// autoplaying without a click, so a genuine sound-on-load isn't possible
// here (it would just be silent anyway on first load, which reads as
// broken rather than intentional). Skips instantly for anyone who has
// asked their OS/browser for reduced motion.
export default function IntroAnimation({ onDone }) {
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  // Keep the latest onDone in a ref so the timer below is set up exactly
  // once on mount - if it depended on onDone directly, a parent re-render
  // (e.g. from an unrelated data fetch elsewhere on the page) would pass a
  // new inline function and reset the countdown, letting the intro linger
  // well past its intended ~1.4s.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (reducedMotion) {
      onDoneRef.current();
      return;
    }
    const timer = window.setTimeout(() => onDoneRef.current(), DURATION_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="sis3-intro" aria-hidden="true">
      <img src="/icon-512.png" alt="" className="sis3-intro-mark" />
    </div>
  );
}
