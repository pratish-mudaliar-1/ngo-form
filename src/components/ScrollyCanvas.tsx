"use client";

import { useRef, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useCanvasSequence } from "@/hooks/useCanvasSequence";
import { ChevronDown } from "lucide-react";

export function ScrollyCanvas() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 120 frames in the sequence2 folder
  const frameCount = 120;
  const { canvasRef, drawFrame, loaded } = useCanvasSequence(frameCount, "/sequence2");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);

  useEffect(() => {
    return frameIndex.on("change", (latest) => {
      drawFrame(Math.floor(latest));
    });
  }, [frameIndex, drawFrame]);

  // Initial draw once loaded
  useEffect(() => {
    if (loaded) {
      drawFrame(0);
    }
  }, [loaded, drawFrame]);

  // Overlay Opacity and Transforms
  // Section A (0% - 20%)
  const opacityA = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.2], [1, 1, 0, 0]);
  const yA = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  // Section B (20% - 45%)
  const opacityB = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.45], [0, 1, 1, 0]);
  const xB = useTransform(scrollYProgress, [0.15, 0.45], [50, -50]);

  // Section C (45% - 70%)
  const opacityC = useTransform(scrollYProgress, [0.4, 0.5, 0.6, 0.7], [0, 1, 1, 0]);
  const xC = useTransform(scrollYProgress, [0.4, 0.7], [-50, 50]);

  // Section D (70% - 100%)
  const opacityD = useTransform(scrollYProgress, [0.65, 0.75, 1, 1], [0, 1, 1, 1]);
  const yD = useTransform(scrollYProgress, [0.65, 0.8], [50, 0]);

  return (
    <section ref={containerRef} className="relative h-[500vh] w-full bg-[#0f172a]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        {/* Loading Overlay */}
        {!loaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900 text-white">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 border-4 border-t-blue-500 border-white/20 rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium tracking-widest uppercase">{t('hero.loading')}</p>
            </div>
          </div>
        )}

        {/* Dark Gradient Overlay for better text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />

        {/* Content Overlays */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-6">
          
          {/* Section A */}
          <motion.div 
            style={{ opacity: opacityA, y: yA }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-wide mb-6 font-syne text-white/95 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              {t('hero.title1')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-200/95 max-w-2xl font-space tracking-wide drop-shadow-md">
              {t('hero.subtitle1')}
            </p>
            
            <motion.div 
              className="absolute bottom-12"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown className="w-8 h-8 opacity-70" />
            </motion.div>
          </motion.div>

          {/* Section B */}
          <motion.div 
            style={{ opacity: opacityB, x: xB }}
            className="absolute inset-0 flex flex-col items-start justify-center max-w-6xl mx-auto w-full text-white px-8 md:px-16"
          >
            <h2 className="text-4xl md:text-6xl font-medium leading-relaxed max-w-4xl font-space text-slate-100 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              {t('hero.title2_pt1')}<span className="font-syne font-bold text-blue-400">{t('hero.title2_pt2')}</span>{t('hero.title2_pt3')}
            </h2>
          </motion.div>

          {/* Section C */}
          <motion.div 
            style={{ opacity: opacityC, x: xC }}
            className="absolute inset-0 flex flex-col items-end justify-center max-w-6xl mx-auto w-full text-white px-8 md:px-16 text-right"
          >
            <h2 className="text-4xl md:text-6xl font-bold leading-snug max-w-4xl font-syne text-white/90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              {t('hero.title3_pt1')}<span className="font-space font-medium text-slate-300">{t('hero.title3_pt2')}</span>{t('hero.title3_pt3')}<br/>
              <span className="text-blue-400">{t('hero.title3_pt4')}</span><br/>
              {t('hero.title3_pt5')}
            </h2>
          </motion.div>

          {/* Section D */}
          <motion.div 
            style={{ opacity: opacityD, y: yD }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center text-white"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-wide mb-8 font-syne text-white/95 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              {t('hero.title4')}
            </h2>
            <button 
              className="pointer-events-auto bg-blue-600 hover:bg-blue-500 text-white font-medium text-lg px-8 py-4 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all transform hover:scale-105 active:scale-95"
              onClick={() => {
                document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('hero.cta')}
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
