import React, { useCallback, useEffect, useRef, useState } from 'react';
import ShareButton from './ShareButton';
import CinemaClubGateway from './CinemaClubGateway';
import { useAuth } from '../context/AuthContext';
import { filmPath } from '../utils/slug';
import { cleanFilmTitle, cleanEditorialText } from '../utils/editorialText';

const SITE_URL = 'https://www.shortsinshort.com';
const GATEWAY_SESSION_KEY = 'shortsinshort-cinema-club-gateway-seen';

const safeText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};

export default function PlayerModal({ film, onClose, lang, setLang }) {
  const shell = useRef(null);
  const iframeRef = useRef(null);
  const currentTimeRef = useRef(0);
  const playerStateRef = useRef(-1);
  const controlsTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const { isMember, loading } = useAuth();
  const [gatewaySeen, setGatewaySeen] = useState(() => {
    try {
      return window.sessionStorage.getItem(GATEWAY_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });

  const continueToFilm = useCallback(() => {
    try {
      window.sessionStorage.setItem(GATEWAY_SESSION_KEY, '1');
    } catch {
      // Playback still works when a private browser disables storage.
    }
    setGatewaySeen(true);
  }, []);

  const sendPlayerCommand = useCallback((func, args = []) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func,
      args
    }), '*');
  }, []);

  const seekBy = useCallback((seconds) => {
    sendPlayerCommand('seekTo', [Math.max(0, currentTimeRef.current + seconds), true]);
  }, [sendPlayerCommand]);

  const requestBestQuality = useCallback(() => {
    // YouTube makes the final choice from the qualities available for each film,
    // but highres asks for the best stream the TV and connection can sustain.
    sendPlayerCommand('setPlaybackQuality', ['highres']);
  }, [sendPlayerCommand]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    if (playerStateRef.current === 1) {
      controlsTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
        if (shell.current && shell.current.contains(document.activeElement)) {
          try { shell.current.focus({ preventScroll: true }); } catch { shell.current.focus(); }
        }
      }, 4000);
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (playerStateRef.current === 1) {
      sendPlayerCommand('pauseVideo');
      setControlsVisible(true);
      if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    } else {
      sendPlayerCommand('playVideo');
      requestBestQuality();
      showControls();
    }
  }, [requestBestQuality, sendPlayerCommand, showControls]);

  const toggleFullscreen = useCallback(() => {
    const target = shell.current;
    if (!target) return;

    const activeNativeFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (isFullscreen || activeNativeFullscreen) {
      const exitFullscreen = document.exitFullscreen
        || document.webkitExitFullscreen
        || document.webkitCancelFullScreen
        || document.msExitFullscreen;
      if (exitFullscreen) {
        try {
          const result = exitFullscreen.call(document);
          if (result && typeof result.catch === 'function') result.catch(() => {});
        } catch {
          // The CSS fallback below still exits fullscreen.
        }
      }
      setIsFullscreen(false);
      return;
    }

    // Samsung TV browsers do not always support the standard fullscreen API.
    // Turn on the CSS fullscreen immediately, then use any native API available.
    setIsFullscreen(true);
    const requestFullscreen = target.requestFullscreen
      || target.webkitRequestFullscreen
      || target.webkitRequestFullScreen
      || target.msRequestFullscreen;
    if (requestFullscreen) {
      try {
        const result = requestFullscreen.call(target);
        if (result && typeof result.catch === 'function') result.catch(() => {});
      } catch {
        // CSS fullscreen remains active.
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleShowControls = () => {
      showControls();
      window.setTimeout(() => {
        const playButton = shell.current && shell.current.querySelector('.sis-tv-play');
        if (!playButton) return;
        try { playButton.focus({ preventScroll: true }); } catch { playButton.focus(); }
      }, 50);
    };
    const handleTogglePlayback = () => togglePlayback();
    window.addEventListener('sis-tv-show-controls', handleShowControls);
    window.addEventListener('sis-tv-toggle-playback', handleTogglePlayback);
    return () => {
      window.removeEventListener('sis-tv-show-controls', handleShowControls);
      window.removeEventListener('sis-tv-toggle-playback', handleTogglePlayback);
      if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    };
  }, [showControls, togglePlayback]);

  useEffect(() => {
    if (isPlaying) showControls();
    else {
      setControlsVisible(true);
      if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    }
  }, [isPlaying, showControls]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const keys = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'f' || event.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', keys);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', keys);
    };
  }, [onClose, toggleFullscreen]);

  useEffect(() => {
    const syncFullscreen = () => {
      const nativeFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
      if (!nativeFullscreen) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
    };
  }, []);

  useEffect(() => {
    const receivePlayerInfo = (event) => {
      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { return; }
      }
      if (!data || data.event !== 'infoDelivery' || !data.info) return;
      if (typeof data.info.currentTime === 'number') currentTimeRef.current = data.info.currentTime;
      if (typeof data.info.playerState === 'number') {
        playerStateRef.current = data.info.playerState;
        setIsPlaying(data.info.playerState === 1);
        if (data.info.playerState === 1) requestBestQuality();
      }
    };

    const listen = () => {
      if (!iframeRef.current || !iframeRef.current.contentWindow) return;
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'listening',
        id: 'sis-tv-youtube'
      }), '*');
    };

    window.addEventListener('message', receivePlayerInfo);
    const timer = window.setInterval(listen, 1000);
    listen();

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('message', receivePlayerInfo);
    };
  }, [requestBestQuality]);

  if (!film) return null;
  const videoId = film.youtubeVideoId || film.id;
  const rawTitle = lang === 'hi' && film.titleHi ? film.titleHi : safeText(film.title, lang);
  const title = cleanFilmTitle(rawTitle, lang);
  const director = lang === 'hi' && film.directorHi ? film.directorHi : safeText(film.director, lang);
  const rawDescription = lang === 'hi' && film.descriptionHi ? film.descriptionHi : film.description;
  const description = cleanEditorialText(rawDescription, lang);
  const metadata = [safeText(film.country, lang), safeText(film.language, lang), film.year, safeText(film.duration, lang)].filter(Boolean);
  const showGateway = !loading && !isMember && !gatewaySeen;
  const showFilm = !loading && !showGateway;

  return (
    <div className={`sis3-player${isFullscreen ? ' is-tv-fullscreen' : ''}${controlsVisible ? ' controls-visible' : ' controls-hidden'}`} ref={shell} tabIndex="-1" data-tv-player role="dialog" aria-modal="true" aria-label={title}>
      <header className="sis3-player-top">
        <button type="button" onClick={onClose} aria-label="Close player" data-tv-close data-tv-initial-focus>←</button>
        <span>SHORTSinSHORT</span>
        <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>{isFullscreen ? '×' : '⛶'}</button>
        <ShareButton
          lang={lang}
          url={SITE_URL + filmPath(film)}
          title={`${title} | SHORTSinSHORT`}
          text={lang === 'hi' ? `SHORTSinSHORT पर देखिए: ${title}` : `Watch "${title}" on SHORTSinSHORT`}
        />
      </header>

      {showGateway && (
        <CinemaClubGateway film={film} lang={lang} setLang={setLang} onContinue={continueToFilm} />
      )}

      <div className="sis3-player-stage">
        <div className="sis3-video-frame">
          {!showFilm ? (
            <div className="sis3-player-wait" aria-hidden="true" />
          ) : videoId ? (
            <>
              <iframe
                ref={iframeRef}
                id="sis-tv-youtube"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&controls=0&enablejsapi=1&iv_load_policy=3&cc_load_policy=0&vq=hd1080`}
                title={title}
                onLoad={() => {
                  window.setTimeout(requestBestQuality, 600);
                  window.setTimeout(requestBestQuality, 1800);
                }}
                tabIndex="-1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <nav className={`sis-tv-player-controls${controlsVisible ? '' : ' is-hidden'}`} aria-label="Film controls" aria-hidden={!controlsVisible}>
                <button type="button" tabIndex={controlsVisible ? 0 : -1} onFocus={showControls} onClick={() => { seekBy(-10); showControls(); }} aria-label="Rewind 10 seconds">↶ <span>10</span></button>
                <button type="button" tabIndex={controlsVisible ? 0 : -1} onFocus={showControls} onClick={togglePlayback} aria-label={isPlaying ? 'Pause film' : 'Play film'} className="sis-tv-play">
                  {isPlaying ? 'Ⅱ' : '▶'}
                </button>
                <button type="button" tabIndex={controlsVisible ? 0 : -1} onFocus={showControls} onClick={() => { seekBy(10); showControls(); }} aria-label="Forward 10 seconds"><span>10</span> ↷</button>
                <button type="button" tabIndex={controlsVisible ? 0 : -1} onFocus={showControls} onClick={() => { toggleFullscreen(); showControls(); }} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>{isFullscreen ? '×' : '⛶'}</button>
              </nav>
            </>
          ) : <p>{lang === 'hi' ? 'वीडियो उपलब्ध नहीं है' : 'Video unavailable'}</p>}
        </div>
      </div>

      <section className="sis3-player-info">
        <div>
          <p className="sis3-eyebrow">NOW PLAYING</p>
          <h2>{title}</h2>
          <p className="sis3-player-meta">{metadata.join(' · ')}</p>
        </div>
        <div className="sis3-curator-note">
          <span>{lang === 'hi' ? 'हमने इसे क्यों चुना' : 'Why we chose it'}</span>
          <p>{description || (lang === 'hi' ? 'दुनिया भर से चुनी हुई एक असाधारण शॉर्ट फ़िल्म।' : 'An exceptional short film selected from world cinema.')}</p>
          {director && <small>{lang === 'hi' ? 'निर्देशक' : 'Director'} · {director}</small>}
        </div>
      </section>
    </div>
  );
}
