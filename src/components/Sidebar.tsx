import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Shield, Zap, Sparkles, MessageSquareHeart, Smile, ChevronDown, ChevronUp, X } from "lucide-react";
import { Session } from "../types";

import dekuFistBump from "../assets/images/all_might_deku_fist_bump_1783059301035.jpg";
import dekuBackToBack from "../assets/images/all_might_deku_back_to_back_1783059315650.jpg";
import pointingClipping from "../assets/images/all_might_pointing_clipping_1783059702730.jpg";
import beachClipping from "../assets/images/all_might_midoriya_golden_clipping_1783059720310.jpg";

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  allMightAvatar: string;
  oflCapacity: number;
  onCheer: () => void;
  onTriggerSticker: (messageText: string, stickerUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const STICKERS = [
  {
    id: "fist_bump",
    name: "Heroic Fist-Bump!",
    tagline: "[Anime Clipping: Episode 49]",
    image: dekuFistBump,
    triggerMessage: "🤜🤛 *[Fist Bump!]* Go beyond, Young Midoriya! Let's smash our way to victory!",
  },
  {
    id: "back_to_back",
    name: "Team United!",
    tagline: "[Anime Clipping: Battle Movie]",
    image: dekuBackToBack,
    triggerMessage: "🔥 *[Back-To-Back Battle Mode]* We stand together as one! No limit can hold us back!",
  },
  {
    id: "pointing_turn",
    name: "Now It's Your Turn",
    tagline: "[Anime Clipping: Final Impact]",
    image: pointingClipping,
    triggerMessage: "👉 *[Symbol of Peace Pointing Pose]* Now... it is your turn! Rise and shine, young hero!",
  },
  {
    id: "beach_sunset",
    name: "Passing the Torch",
    tagline: "[Anime Clipping: Beach Sunset]",
    image: beachClipping,
    triggerMessage: "🌅 *[Beach Training Sunset]* True strength is born from perseverance! Clench your fist and look forward!",
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  allMightAvatar,
  oflCapacity,
  onCheer,
  onTriggerSticker,
  isOpen,
  onClose,
}) => {
  const [isDeckExpanded, setIsDeckExpanded] = useState<boolean>(true);

  return (
    <aside
      id="sidebar-container"
      className={`fixed lg:relative inset-y-0 left-0 z-30 w-[290px] sm:w-[330px] lg:w-96 bg-hero-slate/95 lg:bg-hero-slate/90 border-r-3 border-hero-gold flex flex-col h-full overflow-hidden shadow-[8px_0_24px_rgba(0,0,0,0.5)] backdrop-blur-md transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Decorative Golden Manga Top Line */}
      <div className="h-2 w-full bg-gradient-to-r from-hero-gold via-hero-crimson to-hero-blue" />

      {/* Hero Profile Header Card */}
      <div className="p-6 border-b-2 border-hero-gold/20 bg-gradient-to-b from-hero-slate/50 to-hero-dark/60 relative">
        {/* Mobile close button */}
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-md bg-hero-dark border border-slate-700 text-slate-400 hover:text-white hover:border-hero-gold transition-colors z-20"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-hero-gold via-hero-crimson to-hero-blue opacity-75 blur-sm group-hover:opacity-100 transition duration-300 animate-pulse" />
            <img
              src={allMightAvatar}
              alt="All Might Avatar"
              referrerPolicy="no-referrer"
              className="relative w-16 h-16 rounded-full border-2 border-hero-gold object-cover shadow-[0_0_15px_rgba(245,158,11,0.5)] bg-hero-dark"
            />
            <div className="absolute -bottom-1 -right-1 bg-hero-gold text-hero-dark rounded-full p-1 border border-black shadow">
              <Shield className="w-3.5 h-3.5" fill="currentColor" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-display font-black text-xl text-hero-gold tracking-tight uppercase text-glow-gold">
                All Might
              </h2>
              <span className="text-[10px] bg-hero-crimson text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider shadow">
                O.F.A
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">Symbol of Peace</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Yagi Toshinori</p>
          </div>
        </div>

        {/* Dynamic Interactive OFA Meter */}
        <div className="mt-5 p-3 rounded-lg border-2 border-hero-gold/30 bg-hero-dark/70 shadow-inner">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-hero-gold animate-bounce" />
              One For All Capacity:
            </span>
            <span className="text-xs font-mono font-black text-hero-gold-bright">
              {oflCapacity}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-black">
            <motion.div
              className="h-full bg-gradient-to-r from-hero-crimson via-hero-gold to-hero-gold-bright"
              animate={{ width: `${oflCapacity}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            />
          </div>

          <button
            onClick={onCheer}
            className="w-full mt-3 bg-gradient-to-r from-hero-gold to-hero-crimson hover:from-hero-gold-bright hover:to-red-500 text-hero-dark font-display font-black text-xs py-1.5 px-3 rounded border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-hero-dark animate-pulse" />
            Cheer: PLUS ULTRA! (+25%)
          </button>
        </div>
      </div>

      {/* Missions/Sessions Manager */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs font-display font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-hero-gold" />
            Hero Training Missions
          </span>
          <button
            onClick={onCreateSession}
            className="p-1.5 bg-hero-blue hover:bg-blue-500 text-white rounded border border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            title="Start New Mission"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1" id="session-list">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                className={`group flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-hero-blue-dark to-hero-slate border-hero-gold shadow-[4px_4px_0px_0px_rgba(245,158,11,0.5)] translate-x-1"
                    : "bg-hero-dark/40 border-slate-700/60 hover:bg-hero-dark/80 hover:border-hero-gold/40"
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-hero-gold animate-ping" : "bg-slate-500"
                    }`}
                  />
                  <div className="truncate">
                    <p className={`text-xs font-bold truncate ${isActive ? "text-hero-gold" : "text-slate-200"}`}>
                      {session.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {session.messages.length} battle dialogue{session.messages.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 bg-hero-crimson/10 hover:bg-hero-crimson text-hero-crimson hover:text-white rounded border border-transparent hover:border-black transition-all"
                    title="Terminate Mission"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Expandable/Shrinkable Sticker Deck */}
      <div 
        className={`bg-hero-dark/85 border-t-2 border-hero-gold/30 flex flex-col transition-all duration-300 ease-in-out relative ${
          isDeckExpanded ? "h-72" : "h-14"
        }`}
      >
        <div 
          onClick={() => setIsDeckExpanded(!isDeckExpanded)}
          className="p-3 bg-hero-slate/40 hover:bg-hero-slate/70 cursor-pointer flex items-center justify-between border-b border-hero-gold/10 select-none"
        >
          <span className="text-[11px] font-display font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-hero-gold animate-bounce" />
            Hero Sticker Deck (Tap to send)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-hero-gold bg-hero-gold/10 px-1.5 py-0.5 rounded border border-hero-gold/20">
              {STICKERS.length} CLIPS
            </span>
            {isDeckExpanded ? (
              <ChevronDown className="w-4 h-4 text-hero-gold animate-pulse" />
            ) : (
              <ChevronUp className="w-4 h-4 text-hero-gold animate-pulse" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isDeckExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-1 grid grid-cols-2 gap-3 p-4 overflow-y-auto pr-1 custom-scroll"
              id="stickers-grid"
            >
              {STICKERS.map((sticker) => (
                <motion.div
                  key={sticker.id}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTriggerSticker(sticker.triggerMessage, sticker.image)}
                  className="group p-1.5 bg-hero-slate/80 border-2 border-slate-700 hover:border-hero-gold rounded-lg flex flex-col items-center cursor-pointer transition-all duration-150 shadow relative overflow-hidden"
                >
                  {/* Halftone style overlay */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:8px_8px]" />

                  <div className="relative w-full aspect-video rounded-md overflow-hidden border border-black/40 mb-1.5 bg-hero-dark">
                    <img
                      src={sticker.image}
                      alt={sticker.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 flex items-end justify-center p-1">
                      <span className="text-[8px] font-display font-black text-white bg-hero-crimson/90 px-1 py-0.5 rounded border border-black shadow">
                        SEND CLIP
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] font-black text-slate-200 text-center truncate w-full uppercase tracking-tight">
                    {sticker.name}
                  </p>
                  <p className="text-[8px] text-hero-gold font-mono text-center truncate w-full mt-0.5 font-bold">
                    {sticker.tagline}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};
