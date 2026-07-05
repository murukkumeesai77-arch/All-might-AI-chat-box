import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SpecialEffectOverlayProps {
  effectType: "plus_ultra" | "detroit_smash" | "united_states" | null;
  onClose: () => void;
}

export const SpecialEffectOverlay: React.FC<SpecialEffectOverlayProps> = ({
  effectType,
  onClose,
}) => {
  useEffect(() => {
    if (effectType) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [effectType, onClose]);

  if (!effectType) return null;

  const effectDetails = {
    plus_ultra: {
      text: "PLUS ULTRA!!!",
      subtext: "GO BEYOND! SHATTER YOUR LIMITS!",
      color: "from-amber-400 via-red-500 to-blue-600",
      accent: "text-amber-300",
      vibe: "⚡⚡ O.F.A FULL COWL MAX ⚡⚡",
    },
    detroit_smash: {
      text: "DETROIT SMASH!!!",
      subtext: "100% OF ONE FOR ALL FORCE!",
      color: "from-blue-600 via-white to-red-600",
      accent: "text-red-500",
      vibe: "💥 WIND PRESSURE EXPLOSION 💥",
    },
    united_states: {
      text: "UNITED STATES OF SMASH!!!",
      subtext: "THE ABSOLUTE FINAL IMPACT OF PEACE!",
      color: "from-red-600 via-amber-400 to-blue-900",
      accent: "text-amber-400",
      vibe: "✨ FAREWELL, ONE FOR ALL... ✨",
    },
  };

  const current = effectDetails[effectType];

  return (
    <AnimatePresence>
      <div id="effect-overlay-root" className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden pointer-events-none">
        {/* Speed Lines Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-hero-dark animate-speed-lines"
          style={{
            backgroundImage: `repeating-conic-gradient(from 0deg, rgba(245,158,11,0.15) 0deg 10deg, transparent 10deg 20deg, rgba(239,68,68,0.15) 20deg 30deg, transparent 30deg 40deg)`,
          }}
        />

        {/* Flashing Vignette */}
        <motion.div
          animate={{
            boxShadow: [
              "inset 0 0 100px rgba(245, 158, 11, 0.4)",
              "inset 0 0 200px rgba(239, 68, 68, 0.6)",
              "inset 0 0 100px rgba(37, 99, 235, 0.4)",
            ],
          }}
          transition={{ duration: 0.3, repeat: 4, repeatType: "reverse" }}
          className="absolute inset-0 border-[20px] border-amber-500/20"
        />

        {/* Large Comic Action Banner */}
        <motion.div
          initial={{ scale: 0.2, rotate: -25, y: 100, opacity: 0 }}
          animate={{
            scale: 1,
            rotate: -3,
            y: 0,
            opacity: 1,
          }}
          exit={{ scale: 2, rotate: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 10, stiffness: 100 }}
          className="relative flex flex-col items-center justify-center p-8 text-center bg-gradient-to-r from-hero-dark via-hero-slate to-hero-dark border-y-8 border-amber-500 shadow-[0_0_80px_rgba(245,158,11,0.5)] max-w-2xl mx-4"
        >
          {/* Halftone dots style overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Spark Particles */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className={`text-sm font-mono tracking-widest ${current.accent} mb-2`}
          >
            {current.vibe}
          </motion.div>

          {/* Headline Text */}
          <h1
            className={`font-display text-5xl md:text-7xl font-extrabold tracking-black bg-gradient-to-br ${current.color} bg-clip-text text-transparent filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] uppercase select-none`}
            style={{ WebkitTextStroke: "2px #000000" }}
          >
            {current.text}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 font-sans text-lg md:text-xl font-bold text-white tracking-wide drop-shadow-md">
            {current.subtext}
          </p>

          {/* Action sparkles in layout */}
          <div className="flex gap-4 mt-4">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping delay-75" />
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping delay-150" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
