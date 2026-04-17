import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Github, Twitter, Linkedin, Dribbble, Star, GitFork, BookOpen, ExternalLink, Code2, Trophy, Award, Figma, TrendingUp, Palette, GraduationCap, Database, Landmark, Cloud, GitCommit, GitPullRequest } from 'lucide-react';

// --- GLOBAL STYLES & ANIMATIONS ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&display=swap');

  :root {
    --bg: 0 0% 4%;
    --surface: 0 0% 8%;
    --text: 0 0% 96%;
    --muted: 0 0% 53%;
    --stroke: 0 0% 12%;
    --accent: 0 0% 96%;
  }

  body {
    background-color: hsl(var(--bg));
    color: hsl(var(--text));
    font-family: 'Inter', sans-serif;
    margin: 0;
    overflow-x: hidden;
  }

  /* Utility classes mapped to prompt's custom config for single-file preview */
  .bg-bg { background-color: hsl(var(--bg)); }
  .bg-surface { background-color: hsl(var(--surface)); }
  .text-text-primary { color: hsl(var(--text)); }
  .text-muted { color: hsl(var(--muted)); }
  .text-bg { color: hsl(var(--bg)); }
  .border-stroke { border-color: hsl(var(--stroke)); }
  .font-display { font-family: 'Instrument Serif', serif; }
  .font-figtree { font-family: 'Figtree', sans-serif; }

  .accent-gradient {
    background: linear-gradient(90deg, #89AACC 0%, #4E85BF 100%);
  }

  @keyframes scroll-down {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(200%); }
  }
  .animate-scroll-down {
    animation: scroll-down 1.5s ease-in-out infinite;
  }

  @keyframes role-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-role-fade-in {
    animation: role-fade-in 0.4s ease-out forwards;
  }

  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation: marquee 40s linear infinite;
  }

  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes scroll-reverse {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  .animate-scroll { animation: scroll 30s linear infinite; }
  .animate-scroll-reverse { animation: scroll-reverse 30s linear infinite; }

  @keyframes pan {
    0% { transform: scale(1.02) translateX(0); }
    50% { transform: scale(1.05) translateX(-2%); }
    100% { transform: scale(1.02) translateX(0); }
  }
  .bg-animate { animation: pan 20s ease-in-out infinite; transform-origin: center center; }

  /* Smooth scroll for html */
  html { scroll-behavior: smooth; }

  /* Hide scrollbar for clean look */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: hsl(var(--bg)); }
  ::-webkit-scrollbar-thumb { background: hsl(var(--stroke)); border-radius: 4px; }

  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- HOOKS ---

// Hook to dynamically load and manage HLS video with warm-cache, quality switching and recovery
const useHlsVideo = (
  videoRef: React.RefObject<HTMLVideoElement>,
  src: string,
  opts: { prefetch?: boolean; startLowThenHigh?: boolean } = { prefetch: true, startLowThenHigh: true }
) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: any = null;
    let scriptEl: HTMLScriptElement | null = null;
    let scriptAddedByUs = false;
    const cacheName = 'hls-video-cache-v1';
    let reconnectAttempts = 0;
    const maxReconnect = 4;
    let fallbackTimer: number | null = null;
    let keepAliveInterval: number | null = null;
    let destroyRequested = false;

    const parseManifestForUrls = (baseUrl: string, manifestText: string) => {
      const lines = manifestText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const urls: string[] = [];
      for (const line of lines) {
        if (!line.startsWith('#')) {
          try {
            const u = new URL(line, baseUrl).toString();
            urls.push(u);
          } catch (e) {
            // ignore malformed lines
          }
        }
      }
      return urls;
    };

    const warmCache = async () => {
      if (!opts.prefetch) return;
      try {
        if ('caches' in window) {
          const cache = await caches.open(cacheName);
          const resp = await fetch(src, { credentials: 'include' });
          if (resp && resp.ok) {
            await cache.put(src, resp.clone());
            const txt = await resp.text();
            const urls = parseManifestForUrls(src, txt);
            for (let i = 0; i < Math.min(3, urls.length); i++) {
              try {
                const r = await fetch(urls[i], { credentials: 'include' });
                if (r && r.ok) await cache.put(urls[i], r.clone());
              } catch (e) {
                // ignore individual fetch errors
              }
            }
          }
        } else {
          await fetch(src, { credentials: 'include' });
        }
      } catch (e) {
        // non-fatal
        // eslint-disable-next-line no-console
        console.warn('HLS prefetch failed', e);
      }
    };

    const loadHlsScript = () =>
      new Promise<void>((resolve) => {
        // already available
        // @ts-ignore
        if ((window as any).Hls && (window as any).Hls.isSupported && (window as any).Hls.isSupported()) return resolve();

        const existing = document.querySelector('script[data-hlsjs-src]');
        if (existing) {
          existing.addEventListener('load', () => resolve());
          // if already present and Hls available, resolve now
          // @ts-ignore
          if ((window as any).Hls) return resolve();
          return;
        }

        scriptEl = document.createElement('script');
        scriptEl.setAttribute('data-hlsjs-src', '1');
        scriptEl.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        scriptEl.async = true;
        scriptEl.onload = () => resolve();
        scriptEl.onerror = () => resolve();
        document.body.appendChild(scriptEl);
        scriptAddedByUs = true;
      });

    const tryPlay = async () => {
      try {
        if (video.paused) await video.play();
      } catch (e) {
        // ignore autoplay errors (browsers may block)
      }
    };

    const destroyHls = () => {
      try {
        hlsInstance?.destroy?.();
      } catch (e) {}
      hlsInstance = null;
    };

    const initHls = async () => {
      if (destroyRequested) return;
      await loadHlsScript();

      const v = video;
      // @ts-ignore
      if ((window as any).Hls && (window as any).Hls.isSupported && (window as any).Hls.isSupported()) {
        // @ts-ignore
        const Hls = (window as any).Hls;

        destroyHls();
        // create a fresh instance
          hlsInstance = new Hls({ maxBufferLength: 30, capLevelToPlayerSize: false, maxMaxBufferLength: 60 });
        if (typeof hlsInstance.startLevel !== 'undefined') hlsInstance.startLevel = 0;

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          try {
            const levels = hlsInstance.levels || [];
              if (levels.length) {
                // Force highest-quality level for an HD background
                const highest = levels.length - 1;
                hlsInstance.currentLevel = highest;
                hlsInstance.autoLevelEnabled = false;
              }
          } catch (e) {}
        });

        // error handling and recovery
        hlsInstance.on(Hls.Events.ERROR, (_evt: any, data: any) => {
          try {
            const { type, details, fatal } = data || {};
            // eslint-disable-next-line no-console
            console.warn('HLS error', type, details, fatal);
            if (!fatal) return;

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              try {
                hlsInstance.recoverMediaError();
                return;
              } catch (e) {
                destroyHls();
              }
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              try {
                hlsInstance.startLoad();
                return;
              } catch (e) {
                destroyHls();
              }
            }

            // fatal: try to re-init a few times
            destroyHls();
            if (reconnectAttempts < maxReconnect) {
              reconnectAttempts += 1;
              setTimeout(() => {
                if (!destroyRequested) initHls();
              }, 1500);
            }
          } catch (e) {}
        });

        hlsInstance.attachMedia(v);
        hlsInstance.loadSource(src);

        const switchToBest = () => {
          try {
            const levels = hlsInstance.levels || [];
            if (!levels.length) return;
            let bestIdx = 0;
            let bestScore = -1;
            for (let i = 0; i < levels.length; i++) {
              const lvl = levels[i];
              const score = (lvl.width || 0) + ((lvl.bitrate || 0) / 1000000);
              if (score > bestScore) {
                bestScore = score;
                bestIdx = i;
              }
            }
            hlsInstance.currentLevel = bestIdx;
          } catch (e) {}
        };

        const onPlaying = () => setTimeout(switchToBest, 1200);
        v.addEventListener('playing', onPlaying);
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
        fallbackTimer = window.setTimeout(switchToBest, 3000);

        const onEnded = () => {
          try {
            v.currentTime = 0;
            tryPlay();
          } catch (e) {}
        };
        v.addEventListener('ended', onEnded);

        const onStalled = () => {
          tryPlay();
          try {
            hlsInstance?.startLoad?.();
          } catch (e) {}
        };
        v.addEventListener('stalled', onStalled);
        v.addEventListener('waiting', onStalled);

        const onPauseTry = () => setTimeout(() => { if (v.paused) tryPlay(); }, 500);
        v.addEventListener('pause', onPauseTry);

        keepAliveInterval = window.setInterval(() => {
          if (v.paused) tryPlay();
        }, 2000);

        (v as any).__hlsCleanup = () => {
          v.removeEventListener('playing', onPlaying);
          v.removeEventListener('ended', onEnded);
          v.removeEventListener('stalled', onStalled);
          v.removeEventListener('waiting', onStalled);
          v.removeEventListener('pause', onPauseTry);
          if (fallbackTimer) { window.clearTimeout(fallbackTimer); fallbackTimer = null; }
          if (keepAliveInterval) { window.clearInterval(keepAliveInterval); keepAliveInterval = null; }
          destroyHls();
        };
      } else {
        // native HLS fallback (Safari)
        v.src = src;
      }

      // best-effort autoplay
      try {
        v.preload = 'auto';
        v.muted = true;
        tryPlay();
      } catch (e) {}
    };

    // start warming cache and init
    warmCache();
    initHls();

    return () => {
      destroyRequested = true;
      const v = videoRef.current;
      if (v) {
        const cleanup = (v as any).__hlsCleanup;
        if (typeof cleanup === 'function') cleanup();
      }
      // intentionally keep global hls.js script in DOM for other instances
    };
  }, [src, videoRef]);
};

// --- COMPONENTS ---

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0);
  const words = ["Design", "Create", "Inspire"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 2700;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * 100));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setTimeout(onComplete, 400);
      }
    };
    requestAnimationFrame(step);

    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 900);

    return () => clearInterval(wordInterval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: "-10vh" }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[9999] bg-bg flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-8 left-8 text-xs text-muted uppercase tracking-[0.3em]"
      >
        Portfolio
      </motion.div>

      <div className="flex-1 flex items-center justify-center">
        <div className="h-20 overflow-hidden relative w-full text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={wordIndex}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.4, ease: "backOut" }}
              className="absolute w-full text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80"
            >
              {words[wordIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums tracking-tighter">
        {String(count).padStart(3, "0")}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-stroke/50">
        <div 
          className="h-full accent-gradient origin-left transition-transform duration-75 ease-out"
          style={{ 
            transform: `scaleX(${count / 100})`,
            boxShadow: '0 0 12px rgba(137, 170, 204, 0.5)'
          }}
        />
      </div>
    </motion.div>
  );
};

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState({ ist: '', est: '' });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime({
        ist: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
        est: now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' })
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-4 md:pt-6 px-4 pointer-events-none">
      
      {/* Time zone clocks */}
      <div className="absolute top-6 left-6 hidden md:flex gap-4 text-[10px] text-muted tracking-widest uppercase font-medium">
        <div className="flex flex-col"><span>IST</span><span className="text-text-primary">{time.ist}</span></div>
        <div className="flex flex-col"><span>EST</span><span className="text-text-primary">{time.est}</span></div>
      </div>

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface/80 px-2 py-2 pointer-events-auto transition-shadow duration-300 ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}
      >
        <div className="relative group cursor-pointer p-1">
          <div className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-spin-slow p-[1px]" style={{ animationDuration: '3s' }} />
          <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center relative z-10 transition-transform group-hover:scale-110">
            <span className="font-display italic text-[13px] text-text-primary">SM</span>
          </div>
        </div>

        <div className="w-px h-5 bg-stroke mx-2 hidden sm:block" />

        <div className="flex items-center gap-1 sm:gap-2">
          {['Home', 'Work', 'Timeline'].map((item) => (
            <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-muted hover:text-text-primary hover:bg-stroke/50 transition-colors">
              {item}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-stroke mx-2" />

        <button onClick={() => scrollTo('contact')} className="relative group rounded-full p-[1px] overflow-hidden">
          <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-surface/80 group-hover:bg-surface rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 text-xs sm:text-sm text-text-primary transition-colors">
            Say hi <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </button>
      </motion.div>
    </nav>
  );
};

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useHlsVideo(videoRef, 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8');

  const [roleIndex, setRoleIndex] = useState(0);
  const roles = ["Developer", "ML Enthusiast", "Problem Solver", "Student"];

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" ref={containerRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef}
          autoPlay muted loop playsInline
          className="min-w-full min-h-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-bg to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 mt-16 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="text-xs text-muted uppercase tracking-[0.3em] mb-6 md:mb-8 font-medium"
        >
          Collection '26
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
          className="text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-4 md:mb-6 select-none"
        >
          Shaurya Mishra
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          className="text-xl md:text-3xl text-text-primary/90 mb-6 font-light"
        >
          A <span key={roleIndex} className="font-display italic text-text-primary animate-role-fade-in inline-block min-w-[120px] text-left">{roles[roleIndex]}</span> based in Indore.
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="text-sm md:text-base text-muted max-w-md mx-auto mb-10 leading-relaxed"
        >
          Developing solutions loved by 100s of users. Actively applying concepts in web development and data analysis through hands-on projects.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <button 
            onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative rounded-full text-sm font-medium hover:scale-105 transition-transform duration-300 p-[2px] overflow-hidden"
          >
            <div className="absolute inset-0 bg-text-primary transition-opacity group-hover:opacity-0" />
            <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-transparent group-hover:bg-bg px-8 py-4 rounded-full flex items-center justify-center transition-colors duration-300 h-full w-full">
              <span className="text-bg group-hover:text-text-primary transition-colors">See Works</span>
            </div>
          </button>
          
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative rounded-full text-sm font-medium hover:scale-105 transition-transform duration-300 p-[2px] overflow-hidden"
          >
            <div className="absolute inset-0 bg-stroke transition-opacity duration-300 group-hover:opacity-0" />
            <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-bg px-8 py-4 rounded-full flex items-center justify-center gap-1.5 h-full w-full">
              <span className="text-text-primary">Reach out</span>
              <ArrowUpRight size={14} className="text-text-primary" />
            </div>
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
        <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-medium">Scroll</span>
        <div className="w-px h-12 bg-stroke/50 overflow-hidden relative">
          <div className="w-full h-full bg-white animate-scroll-down" />
        </div>
      </div>
    </section>
  );
};

// --- Tech Marquee Component ---
const TechMarquee = () => {
  const techs1 = [
    { name: "CSS", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M10 12.5 8 15l2 2.5"></path><path d="m14 12.5 2 2.5-2 2.5"></path></svg> },
    { name: "Tailwind", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-cyan-400"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path></svg> },
    { name: "JavaScript", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-400"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"></path></svg> },
    { name: "React", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-400"><circle cx="12" cy="12" r="1"></circle><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"></path><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"></path></svg> },
    { name: "Next.js", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg> },
    { name: "Node.js", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg> },
    { name: "Python", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg> },
  ];

  const techs2 = [
    { name: "Docker", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600"><path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z"></path><path d="M10 21.9V14L2.1 9.1"></path><path d="m10 14 11.9-6.9"></path><path d="M14 19.8v-8.1"></path><path d="M18 17.5V9.4"></path></svg> },
    { name: "Solidity", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-400"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg> },
    { name: "PostgreSQL", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-300"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 12a9 3 0 0 0 5 2.69"></path><path d="M21 9.3V5"></path><path d="M3 5v14a9 3 0 0 0 6.47 2.88"></path><path d="M12 12v4h4"></path><path d="M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16"></path></svg> },
    { name: "Bun", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-200"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg> },
    { name: "Rust", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-orange-500"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><path d="m7.5 4.27 9 5.15"></path></svg> },
    { name: "Vercel", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg> },
    { name: "Figma", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-pink-500"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path></svg> }
  ];

  const TechCard = ({ tech }: { tech: any }) => (
    <div className="w-32 h-20 bg-surface border border-white/5 rounded-lg flex flex-col items-center justify-center gap-2 group hover:border-white/20 hover:bg-white/5 transition-all duration-300">
      <div className="group-hover:scale-110 transition-transform duration-300">{tech.icon}</div>
      <span className="text-xs font-medium text-muted group-hover:text-text-primary transition-colors">{tech.name}</span>
    </div>
  );

  return (
    <div className="w-full overflow-hidden bg-bg py-10 border-t border-stroke/50 relative">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />
      
      <div className="flex gap-4 w-max animate-scroll hover:[animation-play-state:paused] mb-4">
        <div className="flex gap-4">{techs1.map((t, i) => <TechCard key={i} tech={t} />)}</div>
        <div className="flex gap-4">{techs1.map((t, i) => <TechCard key={`dup-${i}`} tech={t} />)}</div>
        <div className="flex gap-4">{techs1.map((t, i) => <TechCard key={`dup2-${i}`} tech={t} />)}</div>
      </div>
      <div className="flex gap-4 w-max animate-scroll-reverse hover:[animation-play-state:paused]">
        <div className="flex gap-4">{techs2.map((t, i) => <TechCard key={i} tech={t} />)}</div>
        <div className="flex gap-4">{techs2.map((t, i) => <TechCard key={`dup-${i}`} tech={t} />)}</div>
        <div className="flex gap-4">{techs2.map((t, i) => <TechCard key={`dup2-${i}`} tech={t} />)}</div>
      </div>
    </div>
  );
};

const ContributionGraph = () => {
  const [data, setData] = useState<any>(null);
  const [eventData, setEventData] = useState<Record<string, any[]>>({});
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number; dayEvents: any[] } | null>(null);

  useEffect(() => {
    const generateBaseCalendar = () => {
      const weeks = [];
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      for (let i = 51; i >= 0; i--) {
        const days = [];
        for (let j = 0; j < 7; j++) {
          const date = new Date(now);
          date.setDate(now.getDate() - (i * 7 + (6 - j)));
          if (date > now) continue;
          days.push({
            date: date.toISOString().split('T')[0],
            contributionCount: 0
          });
        }
        if (days.length > 0) weeks.push({ contributionDays: days });
      }
      return weeks;
    };

    const loadRealData = async () => {
      let baseWeeks = generateBaseCalendar();
      let total = 0;
      let eventsMap: Record<string, any[]> = {};

      // 1. Fetch detailed recent events (for the rich hover tooltips)
      try {
        const res1 = await fetch('https://api.github.com/users/winshaurya/events?per_page=100');
        if (res1.ok) {
          const data1 = await res1.json();
          data1.forEach((ev: any) => {
            const d = ev.created_at.split('T')[0];
            if (!eventsMap[d]) eventsMap[d] = [];
            eventsMap[d].push(ev);
          });
        }
      } catch (e) {
        console.error("Failed to fetch events", e);
      }
      setEventData(eventsMap);

      let fetchedGraph = false;

      // 2. Try primary reliable GitHub Contributions Proxy
      try {
        const res = await fetch('https://github-contributions-api.jogr.app/v4/winshaurya');
        if (res.ok) {
          const proxyData = await res.json();
          total = proxyData.total?.lastYear || 0;
          
          const countMap: Record<string, number> = {};
          proxyData.contributions?.forEach((c: any) => {
            countMap[c.date] = c.count;
          });

          baseWeeks.forEach(week => {
            week.contributionDays.forEach(day => {
               day.contributionCount = countMap[day.date] || 0;
            });
          });
          fetchedGraph = true;
        }
      } catch (e) {
        console.warn("Primary proxy failed, trying fallback...");
      }

      // 3. Try fallback proxy if the first one is down
      if (!fetchedGraph) {
        try {
          const res = await fetch('https://github-contributions-api.deno.dev/winshaurya.json');
          if (res.ok) {
            const proxyData = await res.json();
            total = proxyData.totalContributions || 0;
            
            const countMap: Record<string, number> = {};
            if (proxyData.contributions) {
              proxyData.contributions.flat().forEach((c: any) => {
                countMap[c.date] = c.contributionCount;
              });
            }

            baseWeeks.forEach(week => {
              week.contributionDays.forEach(day => {
                 day.contributionCount = countMap[day.date] || 0;
              });
            });
            fetchedGraph = true;
          }
        } catch (e) {
           console.warn("Fallback proxy failed, calculating from events...");
        }
      }

      // 4. Last resort: Calculate purely from events map if both proxies fail (Rate limit safe)
      if (!fetchedGraph) {
        let calcTotal = 0;
        baseWeeks.forEach(week => {
          week.contributionDays.forEach(day => {
             if (eventsMap[day.date]) {
               let dayCount = 0;
               eventsMap[day.date].forEach(ev => {
                 if (ev.type === 'PushEvent') dayCount += (ev.payload.commits?.length || 1);
                 else dayCount += 1;
               });
               day.contributionCount = dayCount;
               calcTotal += dayCount;
             }
          });
        });
        total = calcTotal;
      }

      setData({ totalContributions: total, weeks: baseWeeks });
    };

    loadRealData();
  }, []);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-[#161616]";
    if (count <= 2) return "bg-[#0e4429]"; // GitHub specific dark greens
    if (count <= 5) return "bg-[#006d32]";
    if (count <= 10) return "bg-[#26a641]";
    return "bg-[#39d353]";
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const { filteredWeeks, monthLabels } = useMemo(() => {
    if (!data) return { filteredWeeks: [], monthLabels: [] };
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    data.weeks.forEach((week: any, weekIndex: number) => {
      if (week.contributionDays.length > 0) {
        const firstDay = week.contributionDays[0];
        const date = new Date(firstDay.date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: monthNames[month], weekIndex });
          lastMonth = month;
        }
      }
    });
    return { filteredWeeks: data.weeks, monthLabels: labels };
  }, [data]);

  const renderTooltipContent = () => {
    if (!tooltip) return null;
    
    // Summarize events for the rich tooltip
    const summary = tooltip.dayEvents.reduce((acc, ev) => {
      if (ev.type === 'PushEvent') {
        acc.commits += (ev.payload.commits?.length || 1);
        if (!acc.repos.includes(ev.repo.name)) acc.repos.push(ev.repo.name);
      }
      if (ev.type === 'PullRequestEvent') acc.prs += 1;
      if (ev.type === 'CreateEvent') acc.created += 1;
      if (ev.type === 'WatchEvent') acc.stars += 1;
      return acc;
    }, { commits: 0, repos: [] as string[], created: 0, stars: 0, prs: 0 });

    const formattedDate = new Date(tooltip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'});

    return (
      <div 
        className="fixed z-[100] px-4 py-4 bg-surface/95 backdrop-blur-xl border border-stroke rounded-2xl shadow-2xl pointer-events-none w-max min-w-[240px] max-w-[320px]"
        style={{ left: tooltip.x, top: tooltip.y - 12, transform: "translate(-50%, -100%)" }}
      >
         <div className="flex items-center justify-between border-b border-stroke/50 pb-3 mb-3">
            <span className="font-medium text-text-primary">{formattedDate}</span>
            <span className="text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-full text-white ml-4">{tooltip.count} contributions</span>
         </div>
         
         {tooltip.dayEvents && tooltip.dayEvents.length > 0 ? (
           <div className="flex flex-col gap-2.5">
             {summary.commits > 0 && (
               <div className="flex items-center gap-2.5 text-sm text-text-primary/90">
                 <GitCommit size={15} className="text-green-400 flex-shrink-0"/> 
                 <span className="truncate">Pushed {summary.commits} commit(s)</span>
               </div>
             )}
             {summary.prs > 0 && (
               <div className="flex items-center gap-2.5 text-sm text-text-primary/90">
                 <GitPullRequest size={15} className="text-purple-400 flex-shrink-0"/> 
                 <span>Opened {summary.prs} Pull Request(s)</span>
               </div>
             )}
             {summary.stars > 0 && (
               <div className="flex items-center gap-2.5 text-sm text-text-primary/90">
                 <Star size={15} className="text-yellow-400 flex-shrink-0"/> 
                 <span>Starred {summary.stars} repo(s)</span>
               </div>
             )}
             {summary.created > 0 && (
               <div className="flex items-center gap-2.5 text-sm text-text-primary/90">
                 <BookOpen size={15} className="text-blue-400 flex-shrink-0"/> 
                 <span>Created {summary.created} repo(s)</span>
               </div>
             )}
             
             {summary.commits === 0 && summary.prs === 0 && summary.stars === 0 && summary.created === 0 && (
               <div className="text-xs text-muted italic">Other GitHub activity ({tooltip.dayEvents.length} events)</div>
             )}
             
             {summary.repos.length > 0 && (
               <div className="mt-1 pt-2 border-t border-stroke/30 text-[11px] text-muted truncate">
                 Working on: <span className="text-text-primary/80 font-medium">{summary.repos[0].split('/').pop()}</span>
               </div>
             )}
           </div>
         ) : (
           <div className="text-xs text-muted leading-relaxed">No detailed event logs available for this date. (Only counts are tracked historically).</div>
         )}
      </div>
    );
  };

  if (!data) return <div className="h-40 animate-pulse bg-surface rounded-lg"></div>;

  return (
    <section className="mt-12 opacity-80 hover:opacity-100 transition-opacity duration-500 relative max-w-4xl mx-auto w-full overflow-x-auto pb-4 custom-scrollbar">
      {renderTooltipContent()}

      <div className="relative text-[10px] text-muted mb-2 h-4 w-full min-w-[700px]">
        {monthLabels.map((label, i) => (
          <span key={i} className="absolute" style={{ left: `${(label.weekIndex / filteredWeeks.length) * 100}%` }}>
            {label.month}
          </span>
        ))}
      </div>

      <div className="w-full min-w-[700px]">
        <div className="flex gap-[3px] w-full">
          {filteredWeeks.map((week: any, i: number) => (
            <div key={i} className="flex flex-col gap-[3px] flex-1">
              {week.contributionDays.map((day: any, j: number) => (
                <div
                  key={j}
                  className={`w-full aspect-square rounded-[2px] cursor-pointer hover:ring-1 hover:ring-white/50 transition-all ${getColorClass(day.contributionCount)}`}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ 
                      date: day.date, 
                      count: day.contributionCount, 
                      x: rect.left + rect.width / 2, 
                      y: rect.top,
                      dayEvents: eventData[day.date] || []
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-xs text-muted min-w-[700px]">
        <div className="flex items-center gap-2">
           <Github size={14} />
           {data.totalContributions > 0 ? (
             <span>{data.totalContributions.toLocaleString()} contributions in the last year</span>
           ) : (
             <span>Fetching real-time contribution data...</span>
           )}
        </div>
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-[3px]">
            {[0, 2, 5, 10, 15].map((c, i) => <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${getColorClass(c)}`} />)}
          </div>
          <span>More</span>
        </div>
      </div>
    </section>
  );
};

const GithubProjects = () => {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching up to 100 recent public repositories dynamically from GitHub API
    fetch('https://api.github.com/users/winshaurya/repos?sort=updated&per_page=100')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter out forks, keep all of them for the horizontal scroll
          setRepos(data.filter(r => !r.fork));
        } else if (data.message && data.message.includes('rate limit')) {
           // Fallback for API Rate Limits to prevent crashing
           console.warn("GitHub API rate limit exceeded. Showing cached repositories.");
           setRepos([
             { id: 1, name: "LeadGS", html_url: "https://github.com/winshaurya/LeadGS", description: "College Competitive Programming Leaderboard System", homepage: "https://lb.sgsits.ac.in", language: "TypeScript", stargazers_count: 2, forks_count: 0 },
             { id: 2, name: "bit.chess", html_url: "https://github.com/winshaurya/bit.chess", description: "Real-Time Multiplayer Chess Platform", homepage: "https://bit-chess.onrender.com", language: "JavaScript", stargazers_count: 1, forks_count: 0 },
             { id: 3, name: "MovieReccomendationSystem", html_url: "https://github.com/winshaurya/MovieReccomendationSystem", description: "Movie Recommendation Engine using Python", homepage: "https://moviereccomendationsystem-9669.streamlit.app", language: "Python", stargazers_count: 1, forks_count: 0 },
           ]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch GitHub repos:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="mt-16 h-40 animate-pulse bg-surface/50 rounded-2xl w-full max-w-4xl mx-auto"></div>;
  if (repos.length === 0) return null;

  return (
    <div className="mt-20 w-[100vw] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-px bg-stroke" />
          <span className="text-xs text-muted uppercase tracking-[0.3em]">All Repositories</span>
        </div>
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex gap-6 overflow-x-auto px-6 md:px-10 lg:px-16 pb-12 snap-x snap-mandatory hide-scrollbar">
        {repos.map((repo, i) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: Math.min(i * 0.05, 0.5), duration: 0.5 }}
            className="group relative flex flex-col w-[300px] sm:w-[380px] flex-shrink-0 h-[260px] rounded-2xl overflow-hidden border border-stroke snap-start"
          >
            {/* Blurred Background from Live Link */}
            {repo.homepage && (
              <div className="absolute inset-0 z-0 overflow-hidden bg-surface">
                <img 
                  src={`https://s0.wp.com/mshots/v1/${encodeURIComponent(repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`)}?w=600`}
                  alt=""
                  className="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700 blur-[8px]"
                />
              </div>
            )}
            
            {/* Base surface if no homepage or to darken image */}
            <div className={`absolute inset-0 z-0 transition-colors duration-300 ${repo.homepage ? 'bg-bg/60 group-hover:bg-bg/40' : 'bg-surface group-hover:bg-surface/80'}`} />

            {/* Content */}
            <div className="relative z-10 p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-text-primary overflow-hidden pr-4">
                  <BookOpen size={18} className="text-muted group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className="font-medium truncate hover:text-blue-400 transition-colors text-lg" title={repo.name}>
                    {repo.name}
                  </a>
                </div>
                <a href={repo.html_url} target="_blank" rel="noreferrer" className="flex-shrink-0">
                  <Github size={20} className="text-muted hover:text-white transition-colors" />
                </a>
              </div>
              
              <p className="text-sm text-muted mb-auto line-clamp-3">
                {repo.description || "No description provided."}
              </p>
              
              {/* Live Link Badge */}
              {repo.homepage && (
                <a 
                  href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200 mt-4 w-max px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md transition-colors"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span className="truncate max-w-[200px]">{repo.homepage.replace(/^https?:\/\//, '')}</span>
                  <ArrowUpRight size={12} />
                </a>
              )}

              <div className="flex items-center gap-4 text-xs text-muted mt-4 pt-4 border-t border-stroke/50">
                {repo.language && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />
                    <span>{repo.language}</span>
                  </div>
                )}
                {repo.stargazers_count > 0 && (
                  <div className="flex items-center gap-1 text-yellow-400/80">
                    <Star size={14} />
                    <span>{repo.stargazers_count}</span>
                  </div>
                )}
                {repo.forks_count > 0 && (
                  <div className="flex items-center gap-1">
                    <GitFork size={14} />
                    <span>{repo.forks_count}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CodeActivity = () => {
  return (
    <section className="bg-bg py-16 md:py-24 relative z-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Code Activity</span>
          </div>
         <ContributionGraph />
         <GithubProjects />
      </div>
    </section>
  );
};

const SelectedWorks = () => {
  const projects = [
    { slug: "leadgs", title: "LeadGS Leaderboard", desc: "College Competitive Programming Leaderboard managing 100+ active users with weighted scoring algorithms.", live: "https://lb.sgsits.ac.in", github: "https://github.com/winshaurya/LeadGS", image: "https://s0.wp.com/mshots/v1/https://lb.sgsits.ac.in?w=1600", gradient: "from-violet-500 via-fuchsia-400/60 via-indigo-500/60" },
    { slug: "bitchess", title: "bit.Chess Platform", desc: "Real-Time Multiplayer Chess Platform with spectator support via WebSockets and Express.js.", live: "https://bit-chess.onrender.com/", github: "https://github.com/winshaurya/bit.chess", image: "https://s0.wp.com/mshots/v1/https://bit-chess.onrender.com?w=1600", gradient: "from-sky-500 via-blue-400/60" },
    { slug: "movierec", title: "Movie Recommender", desc: "Recommendation system over TMDB Movies dataset, achieving 97% accuracy via Streamlit.", live: "https://moviereccomendationsystem-9669.streamlit.app/", github: "https://github.com/winshaurya/MovieReccomendationSystem", image: "https://s0.wp.com/mshots/v1/https://moviereccomendationsystem-9669.streamlit.app?w=1600", gradient: "from-emerald-500 via-emerald-300/60 via-teal-500/60" },
    { slug: "accrue", title: "Accrue Finance", desc: "Full-stack AI-powered finance platform with expense tracking and budget automation.", live: "", github: "https://github.com/winshaurya/accrue", image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff0f?q=80&w=1600&auto=format&fit=crop", gradient: "from-amber-500 via-amber-300/60 via-orange-500/60" },
  ];

  return (
    <section id="work" className="bg-bg py-16 md:py-24 relative z-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-12 md:mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Selected Work</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-6xl text-text-primary tracking-tight mb-4">
                Featured <span className="font-display italic">projects</span>
              </h2>
              <p className="text-muted max-w-sm text-sm md:text-base">
                A selection of projects I've worked on, from concept to launch. Focusing on motion and interaction.
              </p>
            </div>
            <button className="hidden md:inline-flex items-center gap-2 group rounded-full text-sm px-6 py-3 border border-stroke hover:border-transparent relative overflow-hidden transition-all duration-300">
               <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="absolute inset-[1px] bg-bg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-text-primary">View all work</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {projects.map((p, i) => {
            const spans = [7, 5, 5, 7];
            const colSpan = spans[i];
            
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                className={`group relative bg-surface border border-stroke rounded-3xl overflow-hidden cursor-pointer aspect-[4/3] md:aspect-auto md:h-[480px] md:col-span-${colSpan}`}
                style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
              >
                {/* Image */}
                <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                
                {/* Halftone & Tint Overlay */}
                <div className="absolute inset-0 opacity-20 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
                <div className={`absolute inset-0 bg-gradient-to-tr ${p.gradient} to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500 mix-blend-overlay`} />
                
                {/* Hover Glass Panel */}
                <div className="absolute inset-0 bg-bg/85 opacity-0 group-hover:opacity-100 backdrop-blur-md transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
                   <h3 className="text-2xl md:text-3xl font-display italic text-text-primary mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{p.title}</h3>
                   <p className="text-sm text-muted mb-8 max-w-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{p.desc}</p>
                   
                   <div className="flex flex-wrap items-center justify-center gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">
                     {p.live && (
                       <a href={p.live} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-text-primary text-bg px-5 py-2.5 rounded-full text-sm font-medium hover:scale-105 transition-transform">
                         Live Demo <ExternalLink size={16} />
                       </a>
                     )}
                     {p.github && (
                       <a href={p.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-surface border border-stroke text-text-primary px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stroke/50 hover:scale-105 transition-all">
                         GitHub <Github size={16} />
                       </a>
                     )}
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const BadgeImage = ({ src, alt, fallbackText, FallbackIcon, padding = "p-2" }: { src: string, alt: string, fallbackText: string, FallbackIcon: any, padding?: string }) => {
  const [error, setError] = useState(false);
  
  return error || !src ? (
    <div className="w-full h-full flex items-center justify-center bg-surface border border-stroke text-text-primary">
       <FallbackIcon size={24} className="text-muted group-hover:text-text-primary transition-colors" />
    </div>
  ) : (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <img src={src} alt={alt} onError={() => setError(true)} className={`w-full h-full object-contain ${padding}`} />
    </div>
  );
};

const Journal = () => {
  const entries = [
    { title: "McKinsey Forward Program (ML Track)", org: "McKinsey & Company", logo: "https://logo.clearbit.com/mckinsey.com", icon: TrendingUp, readTime: "Machine Learning", date: "Sep 2025 - Present", url: "#" },
    { title: "AI & Full Stack Engineer Intern", org: "DSSE, IIT Bombay", logo: "https://logo.clearbit.com/iitb.ac.in", icon: Database, readTime: "AI & Full Stack", date: "Jun 2025 - Jul 2025", url: "#" },
    { title: "Web Developer Intern", org: "IISPR", logo: "https://logo.clearbit.com/iispr.in", icon: Code2, readTime: "Web Dev", date: "Jul 2025 - Present", url: "#" },
    { title: "B.Tech CSE", org: "SGSITS, Indore", logo: "https://logo.clearbit.com/sgsits.ac.in", icon: GraduationCap, readTime: "Education", date: "2023 - 2027", url: "https://www.sgsits.ac.in/" },
  ];

  const certs = [
    { title: "Oracle AI Vector Search Certified Professional", issuer: "Oracle", logo: "https://logo.clearbit.com/oracle.com", icon: Database, url: "https://brm-certview.oracle.com/ords/certview/ecertificate?ssn=OC7271946&trackId=DB23AIOCP&key=e84660b28a54fb2245a138317e28b138f0c93e12" },
    { title: "Oracle Data Platform Foundations Associate", issuer: "Oracle", logo: "https://logo.clearbit.com/oracle.com", icon: Database, url: "http://brm-certview.oracle.com/ords/certview/ecertificate?ssn=OC7271946&trackId=OCI25DCFA&key=04ffc5244b1dbe9c69bc7e3920eb4c2585ab44b9" },
    { title: "Operations Analyst Virtual Internship", issuer: "Goldman Sachs", logo: "https://logo.clearbit.com/goldmansachs.com", icon: Landmark, url: "https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/MBA4MnZTNFEoJZGnk/wNge9cjzNTXD2acrv_MBA4MnZTNFEoJZGnk_vPeAnqdp386RWnZhq_1750972202661_completion_certificate.pdf" },
    { title: "Risk Management Virtual Internship", issuer: "Goldman Sachs", logo: "https://logo.clearbit.com/goldmansachs.com", icon: Landmark, url: "https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/MBA4MnZTNFEoJZGnk/ETGMhLB5eCrYjcH8o_MBA4MnZTNFEoJZGnk_vPeAnqdp386RWnZhq_1751248789544_completion_certificate.pdf" },
    { title: "Software Testing & QA", issuer: "Udemy", logo: "https://logo.clearbit.com/udemy.com", icon: BookOpen, url: "https://ude.my/UC-168ea58a-d7a4-4fd0-9d5f-77198ce7b31d" },
    { title: "Postman REST API Development", issuer: "Udemy", logo: "https://logo.clearbit.com/udemy.com", icon: Code2, url: "https://ude.my/UC-6809b3c1-728b-45c5-82d2-70cc4248f227" },
    { title: "Azure Fundamentals", issuer: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com", icon: Cloud, url: "https://ude.my/UC-d2468852-d717-426a-b93a-73bc08a66d2c" }
  ];

  return (
    <section id="timeline" className="bg-bg py-16 md:py-24 relative z-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="mb-12 md:mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Timeline</span>
          </div>
          <h2 className="text-4xl md:text-6xl text-text-primary tracking-tight mb-4">
            Experience & <span className="font-display italic">Education</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-4">
          {entries.map((entry, i) => (
            <motion.a
              href={entry.url}
              target={entry.url !== "#" ? "_blank" : "_self"}
              rel="noreferrer"
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-[40px] sm:rounded-full bg-surface/30 hover:bg-surface border border-stroke transition-colors duration-300"
            >
              <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-2xl overflow-hidden flex-shrink-0 border border-transparent group-hover:border-white/20 transition-all duration-300 bg-surface flex items-center justify-center">
                <BadgeImage src={entry.logo} alt={entry.org} fallbackText={entry.org} FallbackIcon={entry.icon} padding="p-3 sm:p-4" />
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-lg md:text-2xl font-medium text-text-primary group-hover:translate-x-1 transition-transform duration-300 truncate">
                  {entry.title}
                </h3>
                <span className="text-sm text-muted mt-1 group-hover:translate-x-1 transition-transform duration-300 delay-75">{entry.org}</span>
              </div>
              
              <div className="hidden lg:block flex-grow h-px bg-stroke/30 mx-4" />
              
              <div className="flex items-center gap-4 text-xs sm:text-sm text-muted">
                <span>{entry.readTime}</span>
                <span className="w-1 h-1 rounded-full bg-stroke" />
                <span>{entry.date}</span>
              </div>

              <div className="w-10 h-10 rounded-full border border-stroke flex items-center justify-center flex-shrink-0 group-hover:bg-text-primary group-hover:text-bg transition-colors duration-300 ml-auto sm:ml-0">
                <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Certifications Block */}
        <div className="mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Licenses & Certifications</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certs.map((cert, i) => (
              <motion.a
                href={cert.url}
                target="_blank"
                rel="noreferrer"
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col justify-between gap-4 p-5 rounded-2xl bg-surface/40 border border-stroke hover:border-white/20 hover:bg-surface transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted">
                  <ExternalLink size={16} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-stroke flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                     <BadgeImage src={cert.logo} alt={cert.issuer} fallbackText={cert.issuer} FallbackIcon={cert.icon} padding="p-2" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted uppercase tracking-wider font-medium mb-1">{cert.issuer}</span>
                    <span className="text-sm font-medium text-text-primary group-hover:text-blue-300 transition-colors line-clamp-2">
                      {cert.title}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

const Explorations = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const fallbackProjects = [
    { id: 'leadgs', title: "LeadGS Leaderboard", img: "https://s0.wp.com/mshots/v1/https://lb.sgsits.ac.in?w=600", url: "https://lb.sgsits.ac.in" },
    { id: 'bitchess', title: "bit.Chess", img: "https://s0.wp.com/mshots/v1/https://bit-chess.onrender.com?w=600", url: "https://bit-chess.onrender.com" },
    { id: 'movierec', title: "Movie Recommender", img: "https://s0.wp.com/mshots/v1/https://moviereccomendationsystem-9669.streamlit.app?w=600", url: "https://moviereccomendationsystem-9669.streamlit.app" },
    { id: 'accrue', title: "Accrue Finance", img: "https://images.unsplash.com/photo-1563986768494-4dee2763ff0f?q=80&w=600&auto=format&fit=crop", url: "https://github.com/winshaurya/accrue" },
    { id: 'portfolio', title: "Portfolio 2026", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop", url: "#" },
    { id: 'algorithms', title: "DSA Tracker", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop", url: "#" },
  ];

  const [displayItems, setDisplayItems] = useState<any[]>(fallbackProjects);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0vh", "-100vh"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0vh", "-150vh"]);

  useEffect(() => {
    // Fetch repos and filter those with live deployment links
    fetch('https://api.github.com/users/winshaurya/repos?sort=updated&per_page=100')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const fetchedLive = data
            .filter(r => !r.fork && r.homepage && r.homepage.startsWith('http'))
            .map(repo => ({
               id: repo.id,
               title: repo.name,
               img: `https://s0.wp.com/mshots/v1/${encodeURIComponent(repo.homepage)}?w=600`,
               url: repo.homepage
            }));

          // Always ensure LeadGS is included in the playground
          const leadGS = { id: 'leadgs-manual', title: "LeadGS Leaderboard", img: "https://s0.wp.com/mshots/v1/https://lb.sgsits.ac.in?w=600", url: "https://lb.sgsits.ac.in" };
          
          // Remove LeadGS if it was fetched to avoid duplicates
          const filteredFetched = fetchedLive.filter(r => !r.url.includes('lb.sgsits.ac.in') && !r.title.toLowerCase().includes('leadgs'));
          
          const combined = [leadGS, ...filteredFetched];
          
          // Fill with fallbacks if less than 6
          while (combined.length < 6) {
            const randomFallback = fallbackProjects[Math.floor(Math.random() * fallbackProjects.length)];
            if (!combined.find(c => c.title === randomFallback.title)) {
              combined.push(randomFallback);
            }
          }

          // Randomize array and pick top 6
          const shuffled = combined.sort(() => 0.5 - Math.random());
          setDisplayItems(shuffled.slice(0, 6));
        }
      })
      .catch(err => console.error("Failed to fetch live repos:", err));
  }, []);

  return (
    <section ref={containerRef} className="bg-bg relative min-h-[100vh] md:min-h-[300vh] pt-20">
      {/* Pinned Content (Background Layer) */}
      <div className="sticky top-0 h-screen w-full z-10 flex items-center pointer-events-none px-6 md:px-16">
        <div className="max-w-xl pointer-events-auto mix-blend-difference z-30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Explorations</span>
          </div>
          <h2 className="text-5xl md:text-8xl text-text-primary tracking-tight mb-6">
            Software <span className="font-display italic">playground</span>
          </h2>
          <p className="text-muted md:text-lg max-w-sm mb-8">
            A space for live deployments, web apps, and interactive software explorations.
          </p>
          <a href="https://www.figma.com/design/IkWG8DqUVSaOrMB6mPtEUa/project?t=V6Pe2JsqfuyklF8i-0" target="_blank" rel="noreferrer" className="group relative inline-flex items-center gap-3 rounded-full px-6 py-3 bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors duration-300">
             <Figma size={18} />
             <span className="text-sm font-medium">View Figma Designs</span>
          </a>
        </div>
      </div>

      {/* Parallax Columns (Foreground Layer) */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row gap-8 md:gap-40 justify-end md:items-start pt-[50vh] md:pt-0 pointer-events-auto">
          
          {/* Column 1 */}
          <motion.div style={{ y: y1 }} className="flex flex-col gap-12 md:gap-32 w-full md:w-1/3 md:mt-[20vh]">
            {displayItems.filter((_, i) => i % 2 === 0).map((item, i) => (
              <a href={item.url} target={item.url !== "#" ? "_blank" : "_self"} rel="noreferrer" key={item.id} className="relative aspect-square max-w-[400px] w-full mx-auto group cursor-pointer block" style={{ transform: `rotate(${(i+1) * 2}deg)` }}>
                <div className="absolute -inset-4 rounded-[40px] border border-stroke/50 group-hover:border-white/20 transition-colors duration-500" />
                <div className="w-full h-full rounded-[24px] overflow-hidden relative bg-surface">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-bg/60 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center">
                      <span className="font-display italic text-2xl text-white text-center px-4">{item.title}</span>
                      <span className="text-xs text-blue-300 mt-2 flex items-center gap-1"><ExternalLink size={12}/> Live App</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </motion.div>

          {/* Column 2 */}
          <motion.div style={{ y: y2 }} className="flex flex-col gap-12 md:gap-40 w-full md:w-1/3 md:mt-[60vh]">
             {displayItems.filter((_, i) => i % 2 !== 0).map((item, i) => (
              <a href={item.url} target={item.url !== "#" ? "_blank" : "_self"} rel="noreferrer" key={item.id} className="relative aspect-square max-w-[400px] w-full mx-auto group cursor-pointer block" style={{ transform: `rotate(-${(i+1) * 2}deg)` }}>
                <div className="absolute -inset-4 rounded-[40px] border border-stroke/50 group-hover:border-white/20 transition-colors duration-500" />
                <div className="w-full h-full rounded-[24px] overflow-hidden relative bg-surface">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-pink-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-bg/60 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center">
                      <span className="font-display italic text-2xl text-white text-center px-4">{item.title}</span>
                      <span className="text-xs text-pink-300 mt-2 flex items-center gap-1"><ExternalLink size={12}/> Live App</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  const [cfData, setCfData] = useState({ rating: '...', maxRating: '...', rank: 'Loading...' });
  const [lcData, setLcData] = useState({ solved: '...', rating: '1600' });
  const [ccData, setCcData] = useState({ rating: '...', stars: '...', rank: '...' });

  useEffect(() => {
    // Fetch Codeforces Stats
    fetch('https://codeforces.com/api/user.info?handles=winshaurya')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'OK' && data.result.length > 0) {
          const user = data.result[0];
          setCfData({
            rating: user.rating?.toString() || 'Unrated',
            maxRating: user.maxRating?.toString() || 'Unrated',
            rank: user.rank || 'Unrated'
          });
        }
      })
      .catch(err => console.error("CF Fetch Error:", err));

    // Fetch LeetCode Stats via reliable API proxy
    fetch('https://alfa-leetcode-api.onrender.com/winshaurya/solved')
      .then(res => res.json())
      .then(data => {
        if (data && data.solvedProblem) {
          setLcData({ solved: data.solvedProblem.toString(), rating: '1600' });
        } else {
          setLcData({ solved: '250+', rating: '1600' });
        }
      })
      .catch(err => setLcData({ solved: '250+', rating: '1600' }));

    // Fetch CodeChef Stats
    fetch('https://codechef-api.vercel.app/handle/winshaurya1')
      .then(res => res.json())
      .then(data => {
        if (data && data.success !== false) {
          // Parse the star number (e.g. "4★" -> 4) to render visual stars
          const starCount = parseInt(data.stars?.toString().charAt(0)) || 4;
          setCcData({ 
            rating: data.currentRating?.toString() || '1800', 
            stars: '★'.repeat(starCount), 
            rank: data.globalRank?.toString() || '5070' 
          });
        } else {
          setCcData({ rating: '1800', stars: '★★★★', rank: '5070' });
        }
      })
      .catch(err => setCcData({ rating: '1800', stars: '★★★★', rank: '5070' }));
  }, []);

  const stats = [
    { 
      platform: "LeetCode", 
      number: lcData.rating, 
      label: "Contest Rating", 
      sub: `Problems Solved: ${lcData.solved}`, 
      icon: <Code2 size={24} className="text-yellow-500 mb-4" />,
      link: "https://leetcode.com/u/winshaurya/"
    },
    { 
      platform: "CodeChef", 
      number: ccData.rating !== '...' ? ccData.rating : '1800', 
      label: "Highest Rating", 
      sub: `${ccData.stars !== '...' ? ccData.stars : '★★★★'} | Global Rank: ${ccData.rank !== '...' ? ccData.rank : '5070'}`, 
      icon: <Trophy size={24} className="text-amber-500 mb-4" />,
      link: "https://www.codechef.com/users/winshaurya1"
    },
    { 
      platform: "Codeforces", 
      number: cfData.rating !== '...' ? cfData.rating : 'N/A', 
      label: "Current Rating", 
      sub: `Rank: ${cfData.rank} | Max: ${cfData.maxRating}`, 
      icon: <Star size={24} className="text-blue-500 mb-4" />,
      link: "https://codeforces.com/profile/winshaurya"
    },
  ];

  return (
    <section className="bg-bg py-16 md:py-24 border-t border-stroke/50">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        
        <div className="flex items-center gap-4 mb-12">
          <div className="w-8 h-px bg-stroke" />
          <span className="text-xs text-muted uppercase tracking-[0.3em]">Competitive Programming</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.a 
              href={stat.link}
              target="_blank"
              rel="noreferrer"
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group flex flex-col p-8 rounded-[2rem] bg-surface border border-stroke hover:border-white/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  {stat.icon}
                  <ExternalLink size={18} className="text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
                </div>
                <span className="text-xs font-medium text-muted mb-8 block uppercase tracking-widest">{stat.platform}</span>
                <span className="text-6xl md:text-7xl font-medium tracking-tighter text-text-primary mb-6 block">
                  {stat.number}
                </span>
                <div className="w-full h-px bg-stroke mb-6 group-hover:bg-white/10 transition-colors duration-300" />
                <span className="text-lg md:text-xl font-medium text-text-primary mb-2 block">{stat.label}</span>
                <span className="text-sm text-muted block capitalize">{stat.sub}</span>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
};

const Footer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useHlsVideo(videoRef, 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8');

  return (
    <footer id="contact" className="bg-bg relative pt-20 md:pt-32 pb-8 md:pb-12 overflow-hidden border-t border-stroke/50">
      
      {/* Flipped Background Video */}
      <div className="absolute inset-0 z-0 scale-y-[-1] opacity-60">
        <video 
          ref={videoRef}
          autoPlay muted loop playsInline
          className="min-w-full min-h-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grayscale"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-bg to-transparent z-10" />
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-bg to-transparent z-10" />

      <div className="relative z-20 flex flex-col items-center">
        
        {/* Marquee */}
        <div className="w-full overflow-hidden mb-16 select-none flex whitespace-nowrap border-y border-stroke/20 py-4 bg-black/20 backdrop-blur-sm">
          <div className="animate-marquee inline-flex">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-5xl md:text-7xl lg:text-8xl font-display italic text-text-primary/20 px-4">
                BUILDING THE FUTURE •
              </span>
            ))}
          </div>
          <div className="animate-marquee inline-flex absolute top-0">
             {/* Duplicate for seamless loop handled by inline-flex layout naturally wrapping but absolute helps if gap issues */}
          </div>
        </div>

        <div className="max-w-2xl px-6 text-center mb-24">
          <p className="text-lg md:text-xl text-text-primary/80 mb-8 font-light">
            Have a project in mind? I'm always open to new ideas, collaborations, or just a friendly chat about design and code.
          </p>
          
          <motion.a 
            href="mailto:winshaurya9@gmail.com"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center justify-center p-[2px] rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-stroke transition-opacity duration-500 group-hover:opacity-0" />
            <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-surface group-hover:bg-surface/90 px-8 py-4 rounded-full flex items-center gap-3 transition-colors duration-500 w-full h-full">
              <span className="text-lg text-text-primary">winshaurya9@gmail.com</span>
              <ArrowUpRight className="text-text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </motion.a>
        </div>

        {/* Bottom Bar */}
        <div className="w-full max-w-[1400px] px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-stroke/30">
          
          <div className="flex gap-6">
            <a href="https://www.linkedin.com/in/shauryamishra1/" target="_blank" rel="noreferrer" className="text-muted hover:text-text-primary hover:-translate-y-1 transition-all"><Linkedin size={20} /></a>
            <a href="https://github.com/winshaurya" target="_blank" rel="noreferrer" className="text-muted hover:text-text-primary hover:-translate-y-1 transition-all"><Github size={20} /></a>
            <a href="https://www.figma.com/design/IkWG8DqUVSaOrMB6mPtEUa/project?t=V6Pe2JsqfuyklF8i-0" target="_blank" rel="noreferrer" className="text-muted hover:text-text-primary hover:-translate-y-1 transition-all"><Figma size={20} /></a>
          </div>

          <div className="flex items-center gap-3 bg-surface/50 border border-stroke/50 px-4 py-2 rounded-full backdrop-blur-sm">
             <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="text-sm text-muted">Available for projects</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

// --- MAIN APP ---
export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <style>{globalStyles}</style>
      
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }}
          className="bg-bg min-h-screen text-text-primary selection:bg-white/20"
        >
          <NavBar />
          <Hero />
          <TechMarquee />
          <CodeActivity />
          <SelectedWorks />
          <Journal />
          <Explorations />
          <Stats />
          <Footer />
        </motion.div>
      )}
    </>
  );
}