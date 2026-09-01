import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function VideoModal({ film, onClose, lang }) {
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!film) return;

    const filmKey = film.id || film.youtubeVideoId;
    const savedData = JSON.parse(localStorage.getItem(`watch_${filmKey}`) || '{}');
    const startSec = Math.floor(savedData.currentTime || 0);

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    const initPlayer = (start) => {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player('yt-player-frame', {
        videoId: film.youtubeVideoId,
        playerVars: {
          autoplay: 1,
          start: start > 5 ? start : 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                  const current = playerRef.current.getCurrentTime();
                  const duration = playerRef.current.getDuration() || 1;
                  const percent = Math.min(100, Math.round((current / duration) * 100));

                  const progressObj = {
                    filmId: filmKey,
                    title: film.title,
                    thumbnail: film.thumbnail,
                    director: film.director,
                    genre: film.genre,
                    duration: film.duration,
                    currentTime: current,
                    totalDuration: duration,
                    percent: percent,
                    lastWatched: Date.now()
                  };
                  localStorage.setItem(`watch_${filmKey}`, JSON.stringify(progressObj));
                }
              }, 3000);
            } else {
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          }
        }
      });
    };

    window.onYouTubeIframeAPIReady = () => initPlayer(startSec);
    if (window.YT && window.YT.Player) initPlayer(startSec);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [film]);

  if (!film) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-5xl bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-red-600 rounded-full text-zinc-300 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <div className="relative pt-[56.25%] bg-black">
          <div id="yt-player-frame" className="absolute inset-0 w-full h-full" />
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">{lang === 'hi' && film.titleHi ? film.titleHi : film.title}</h2>
          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{lang === 'hi' && film.descriptionHi ? film.descriptionHi : film.description}</p>
          <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
            <span><strong>{lang === 'hi' ? 'निर्देशक' : 'Director'}:</strong> {lang === 'hi' && film.directorHi ? film.directorHi : film.director}</span>
            <span><strong>{lang === 'hi' ? 'अवधि' : 'Duration'}:</strong> {film.duration}</span>
            <span><strong>{lang === 'hi' ? 'भाषा' : 'Language'}:</strong> {film.language}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
