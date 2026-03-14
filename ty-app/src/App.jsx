import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Github, Twitter, Linkedin, Dribbble, Star, GitFork, BookOpen, ExternalLink, Code2, Trophy, Award, Figma, TrendingUp, Palette, GraduationCap, Database, Landmark, Cloud } from 'lucide-react';

// --- GLOBAL STYLES & ANIMATIONS ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');

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

// Hook to dynamically load and manage HLS video
const useHlsVideo = (videoRef, src) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loadVideo = async () => {
      // @ts-ignore
      if (window.Hls && window.Hls.isSupported()) {
        // @ts-ignore
        const hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        // Dynamic load of hls.js script if not available
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = () => {
          // @ts-ignore
          if (window.Hls.isSupported()) {
             // @ts-ignore
            const hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
          }
        };
        document.body.appendChild(script);
      }
    };
    loadVideo();
  }, [src, videoRef]);
};

// ... (rest of ty.jsx unchanged, see previous content for full code) ...

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