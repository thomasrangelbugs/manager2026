import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  SPLASH_WALLPAPER_FADE_MS,
  SPLASH_WALLPAPER_INTERVAL_MS,
  SPLASH_WALLPAPERS,
} from '../data/splashWallpapers';

export const HeroWallpaperRotator = () => {
  const [index, setIndex] = useState(0);
  const slide = SPLASH_WALLPAPERS[index];

  useEffect(() => {
    SPLASH_WALLPAPERS.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SPLASH_WALLPAPERS.length);
    }, SPLASH_WALLPAPER_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hero-wallpaper pointer-events-none absolute inset-0 z-[1]" aria-hidden>
      {SPLASH_WALLPAPERS.map((item, slideIndex) => (
        <motion.div
          key={item.id}
          className="absolute inset-0 overflow-hidden"
          initial={false}
          animate={{ opacity: slideIndex === index ? 1 : 0 }}
          transition={{ duration: SPLASH_WALLPAPER_FADE_MS / 1000, ease: 'easeInOut' }}
        >
          <motion.img
            src={item.src}
            alt=""
            className="hero-wallpaper__img h-full w-full"
            onError={(event) => {
              const target = event.currentTarget;
              if (target.dataset.fallbackApplied) return;
              target.dataset.fallbackApplied = '1';
              target.src =
                'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80';
            }}
            animate={{ scale: slideIndex === index ? 1.04 : 1.1 }}
            transition={{ duration: SPLASH_WALLPAPER_INTERVAL_MS / 1000, ease: 'linear' }}
            loading={slideIndex <= 1 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
          />
        </motion.div>
      ))}
      <div className="hero-wallpaper__shade absolute inset-0" />
      <motion.p
        key={slide.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="absolute bottom-24 left-4 right-4 z-[2] max-w-md text-xs font-bold uppercase tracking-[0.14em] text-slate-200 sm:bottom-6 sm:left-8 sm:right-8"
      >
        <span className="mr-2 rounded-full border border-turf/35 bg-turf/15 px-2 py-0.5 text-[0.62rem] text-turf">
          Brasileirão 2026
        </span>
        {slide.label}
      </motion.p>
      <div className="hero-wallpaper__dots absolute bottom-6 right-5 z-[2] hidden gap-1.5 sm:flex sm:right-8">
        {SPLASH_WALLPAPERS.map((item, dotIndex) => (
          <span
            key={item.id}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              dotIndex === index ? 'w-6 bg-turf' : 'w-1.5 bg-white/35'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
