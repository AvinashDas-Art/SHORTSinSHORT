import React, { useEffect, useRef } from 'react';

const safeText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] || val.en || Object.values(val)[0] || '';
  return String(val);
};

export default function PlayerModal({ film, onClose, lang, onProgressUpdate }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement && containerRef.current) {
          containerRef.current.requestFullscreen?.();
        } else if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!film) return null;

  const title = lang === 'hi' && film.titleHi ? film.titleHi : safeText(film.title, lang);
  const director = lang === 'hi' && film.directorHi ? film.directorHi : safeText(film.director, lang);
  const description = lang === 'hi' && film.descriptionHi ? film.descriptionHi : safeText(film.description, lang);
  const vid = film.youtubeVideoId || film.id;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-center items-center p-2 sm:p-4 md:p-6"
    >
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60 bg-zinc-900/60">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">{title}</h2>
            <p className="text-xs text-zinc-400">
              {director ? `${lang === 'hi' ? 'निर्देशक' : 'Directed by'}: ${director}` : 'SHORTSinSHORT Special'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition focus:outline-none"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Video Frame */}
        <div className="relative aspect-video w-full bg-black">
          {vid && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        {/* Footer info & shortcut hint */}
        <div className="px-4 py-3 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/40">
          <p className="line-clamp-1 max-w-xl">{description}</p>
          <div className="hidden sm:flex items-center space-x-2 text-[11px] text-zinc-500 font-mono">
            <span className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">ESC</span> Close
            <span className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">F</span> Fullscreen
          </div>
        </div>
      </div>
    </div>
  );
}
