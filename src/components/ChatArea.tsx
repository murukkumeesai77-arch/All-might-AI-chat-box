import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Sparkles, Zap, ShieldAlert, CornerDownLeft, Volume2, Menu, Copy, Check, 
  Settings, Download, Sliders, VolumeX, Edit3, Save, ThumbsUp, ThumbsDown, RefreshCw, X, MessageSquare, Info, Mic, MicOff, Paperclip, Image as ImageIcon,
  FileText, Headphones, Code2, ChevronDown, ChevronUp, Terminal, Activity, Cpu, BookOpen
} from "lucide-react";
import { Message } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (
    text: string,
    specialAttack?: "plus_ultra" | "detroit_smash" | "united_states" | null,
    image?: { data: string; mimeType: string } | null,
    attachment?: { data: string; mimeType: string; name: string; type: "image" | "audio" | "document" } | null
  ) => void;
  allMightAvatar: string;
  allMightBg: string;
  oflCapacity: number;
  onToggleSidebar: () => void;
  // ChatGPT & Claude features
  onRegenerateResponse: (messageIndex: number) => void;
  onEditUserMessage: (messageIndex: number, newText: string) => void;
  onRateMessage: (messageIndex: number, rating: "thumbs_up" | "thumbs_down" | null) => void;
  selectedModel: "ofa_100" | "ofa_50" | "ofa_120";
  onChangeModel: (model: "ofa_100" | "ofa_50" | "ofa_120") => void;
  customInstructions: string;
  onSaveCustomInstructions: (instructions: string) => void;
  onOpenArtifact: (title: string, content: string, language?: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
  allMightAvatar,
  allMightBg,
  oflCapacity,
  onToggleSidebar,
  onRegenerateResponse,
  onEditUserMessage,
  onRateMessage,
  selectedModel,
  onChangeModel,
  customInstructions,
  onSaveCustomInstructions,
  onOpenArtifact,
}) => {
  const [inputText, setInputText] = useState("");
  const [activeAttack, setActiveAttack] = useState<"detroit_smash" | "united_states" | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSystemInstructionsOpen, setIsSystemInstructionsOpen] = useState<boolean>(false);
  const [customInstructionsText, setCustomInstructionsText] = useState<string>(customInstructions);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Claude-style advanced interactive thinking state
  const [thinkingStep, setThinkingStep] = useState<number>(0);
  const [thinkingLogs, setThinkingLogs] = useState<Array<{ text: string; category: "system" | "parsing" | "codegen" | "quality"; delay: number; status: "completed" | "active" | "pending" }>>([]);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState<boolean>(true);
  const [thinkingLogFilter, setThinkingLogFilter] = useState<"all" | "system" | "parsing" | "codegen" | "quality">("all");
  const [sparkPower, setSparkPower] = useState<number>(15);

  const THOUGHT_STEPS = [
    { text: "Initializing Claude Sandboxed Compiler Core...", category: "system" as const, delay: 600 },
    { text: "Structuring cognitive query context & verifying custom safety directives...", category: "system" as const, delay: 700 },
    { text: "Detecting requested artifact layout: standard high-contrast document schema.", category: "parsing" as const, delay: 800 },
    { text: "Scanning prompt intent for dynamic interactive capabilities (HTML/SVG/JS)...", category: "parsing" as const, delay: 900 },
    { text: "Planning aesthetic design system: Space Grotesk displays + Inter paragraph spacing.", category: "parsing" as const, delay: 800 },
    { text: "Drafting layout: generating grid-systems, custom CSS containers, and structural rules.", category: "codegen" as const, delay: 1000 },
    { text: "Assembling document artifact: compiling React-compliant elements & classes...", category: "codegen" as const, delay: 1100 },
    { text: "Injecting interactive triggers for responsive desktop-first resizing structures...", category: "codegen" as const, delay: 900 },
    { text: "Parsing markup: validating correct markdown blocks, lists, and bold highlighting...", category: "quality" as const, delay: 800 },
    { text: "Configuring Word XML layout templates and custom double-border letterheads...", category: "quality" as const, delay: 1000 },
    { text: "Configuring high-fidelity PDF print layout vector configurations...", category: "quality" as const, delay: 800 },
    { text: "Performing final integrity validation on generated source code elements...", category: "quality" as const, delay: 700 },
    { text: "Releasing compiled document to live iframe viewport sandbox...", category: "system" as const, delay: 600 }
  ];

  useEffect(() => {
    if (isLoading) {
      setThinkingStep(0);
      setSparkPower(15);
      
      const initialLogs = THOUGHT_STEPS.map((t, idx) => ({
        ...t,
        status: (idx === 0 ? "active" : "pending") as "completed" | "active" | "pending"
      }));
      setThinkingLogs(initialLogs);

      let currentStep = 0;
      let timerId: any;

      const triggerNextStep = () => {
        if (currentStep < THOUGHT_STEPS.length - 1) {
          currentStep++;
          setThinkingStep(currentStep);
          setSparkPower(prev => Math.min(prev + Math.floor(Math.random() * 8) + 6, 99));
          setThinkingLogs(prev => prev.map((log, lIdx) => {
            if (lIdx < currentStep) return { ...log, status: "completed" as const };
            if (lIdx === currentStep) return { ...log, status: "active" as const };
            return log;
          }));
          
          timerId = setTimeout(triggerNextStep, THOUGHT_STEPS[currentStep].delay);
        } else {
          setSparkPower(100);
          setThinkingLogs(prev => prev.map(log => ({ ...log, status: "completed" as const })));
        }
      };

      timerId = setTimeout(triggerNextStep, THOUGHT_STEPS[0].delay);

      return () => {
        clearTimeout(timerId);
      };
    } else {
      setSparkPower(15);
      setThinkingStep(0);
    }
  }, [isLoading]);

  // Generalized Document, Audio & Photo Upload States
  const [attachedFile, setAttachedFile] = useState<{
    data: string;
    mimeType: string;
    name: string;
    type: "image" | "audio" | "document";
  } | null>(null);
  const [attachedPreviewUrl, setAttachedPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file) return;

    let type: "image" | "audio" | "document" = "document";
    if (file.type.startsWith("image/")) {
      type = "image";
    } else if (
      file.type.startsWith("audio/") || 
      file.name.endsWith(".mp3") || 
      file.name.endsWith(".wav") || 
      file.name.endsWith(".m4a") || 
      file.name.endsWith(".ogg") || 
      file.name.endsWith(".aac")
    ) {
      type = "audio";
    } else {
      type = "document";
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const commaIndex = base64String.indexOf(",");
      if (commaIndex !== -1) {
        const rawData = base64String.substring(commaIndex + 1);
        setAttachedFile({
          data: rawData,
          mimeType: file.type || (type === "audio" ? "audio/mp3" : "text/plain"),
          name: file.name,
          type,
        });
        setAttachedPreviewUrl(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const transcript = result[0].transcript;
          setInputText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript.trim()}` : transcript.trim();
          });
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser, or iframe permissions blocked mic access. Try opening the app in a new tab if it persists!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Keep local customInstructions text synchronized
  useEffect(() => {
    setCustomInstructionsText(customInstructions);
  }, [customInstructions]);

  // Copy message utility
  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Speech Synthesis utility for ChatGPT/Claude equivalents
  const handleSpeakMessage = (text: string, id: string) => {
    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }
    window.speechSynthesis.cancel();
    
    // Strip markdown bold asterisks & any custom code brackets
    const cleanText = text
      .replace(/\*\*([\s\S]*?)\*\*/g, "$1")
      .replace(/\[STICKER_EVENT\]:|🤜🤛|🔥|👉|🌅|⚡/g, "")
      .trim();
      
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    // Prefer male English voice for All Might
    const heroVoice = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("male")) || voices[0];
    if (heroVoice) {
      utterance.voice = heroVoice;
    }
    utterance.rate = 1.05; // Energetic and engaging rate!
    
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    
    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Cancel speech on component unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Export full chat log to Markdown download, matching Claude / ChatGPT Export Options!
  const handleExportChat = () => {
    if (messages.length === 0) return;
    
    let mdContent = `# 🌟 Hero's Convo: Training & Tactical Session Log 🌟\n`;
    mdContent += `*Recorded on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*\n`;
    mdContent += `*Model gear tuned: ${selectedModel === "ofa_100" ? "One For All 100% (Ultimate Reasoner)" : selectedModel === "ofa_50" ? "One For All 50% (Swift Conversationalist)" : "One For All 120% (Plus Ultra Creative)"}*\n`;
    if (customInstructions.trim()) {
      mdContent += `*Custom Directives applied: "${customInstructions}"*\n`;
    }
    mdContent += `\n---\n\n`;
    
    messages.forEach((msg) => {
      const sender = msg.role === "user" ? "🧑‍🎓 Young Student" : "🦸 All Might (Symbol of Peace)";
      mdContent += `### ${sender} - ${msg.timestamp}\n`;
      if (msg.edited) {
        mdContent += `*(Edited)*\n`;
      }
      mdContent += `> ${msg.content}\n\n`;
    });
    
    mdContent += `\n---\n*Keep training. Go beyond! PLUS ULTRA!*`;
    
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `all_might_hero_session_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || isLoading) return;

    onSendMessage(inputText.trim(), activeAttack, null, attachedFile);
    setInputText("");
    setActiveAttack(null); // Reset after use
    setAttachedFile(null);
    setAttachedPreviewUrl(null);
  };

  // Pre-configured attack triggers
  const triggerAttack = (attack: "detroit_smash" | "united_states") => {
    if (attack === "united_states" && oflCapacity < 50) {
      alert("One For All Capacity is too low! Cheer All Might to recharge his power!");
      return;
    }
    setActiveAttack(activeAttack === attack ? null : attack);
  };

  // Custom text-to-HTML formatter to render basic markdown and text layout beautifully
  const formatMessageContent = (content: string) => {
    if (!content) return "";
    
    // Split into paragraphs
    const paragraphs = content.split("\n\n");
    return paragraphs.map((paragraph, pIdx) => {
      // Split by ** for bold elements
      const parts = paragraph.split(/\*\*([\s\S]*?)\*\*/g);
      return (
        <p key={pIdx} className="mb-2 last:mb-0 leading-relaxed text-sm md:text-base">
          {parts.map((part, partIdx) => {
            // Odd indices are the captured bold text
            if (partIdx % 2 === 1) {
              return (
                <strong key={partIdx} className="text-hero-gold font-extrabold font-display">
                  {part}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  // Claude-Style Document & Code Artifact Parser and Renderer
  const parseAndRenderContent = (content: string, messageIndex: number) => {
    if (!content) return "";

    // Match code blocks like ```javascript ... ```
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    const parts: Array<{ type: "text" | "artifact"; content: string; language?: string; title?: string }> = [];
    let lastIndex = 0;
    let match;
    let count = 1;

    while ((match = regex.exec(content)) !== null) {
      const matchIndex = match.index;
      
      // Push leading text part
      if (matchIndex > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, matchIndex)
        });
      }

      const language = match[1] ? match[1].toLowerCase() : "text";
      const codeContent = match[2];

      // Smart title extraction from first two lines of code comments
      let title = "";
      const lines = codeContent.trim().split("\n");
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        const secondLine = lines.length > 1 ? lines[1].trim() : "";
        
        const titleMatch = firstLine.match(/(?:title|name|subject|file)[:\-]\s*([^\n\*]+)/i) || 
                           secondLine.match(/(?:title|name|subject|file)[:\-]\s*([^\n\*]+)/i) ||
                           firstLine.match(/^#+\s*([^\n]+)/) ||
                           firstLine.match(/^\/\/\s*(?:title|file|name)[:\-]\s*([^\n]+)/i) ||
                           firstLine.match(/^<!--\s*(?:title|file|name)[:\-]\s*([^\n]+?)\s*-->/i);
                           
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].replace(/[#*_\-<>]/g, "").trim();
        }
      }

      if (!title) {
        // Fallback files named after the type of artifact
        if (language === "html") title = `interactive_sandbox_${count}.html`;
        else if (language === "svg") title = `vector_graphic_${count}.svg`;
        else if (language === "markdown" || language === "md") title = `training_blueprint_${count}.md`;
        else if (language === "json") title = `data_structure_${count}.json`;
        else if (language === "javascript" || language === "js") title = `script_${count}.js`;
        else if (language === "typescript" || language === "ts") title = `component_${count}.tsx`;
        else if (language === "css") title = `styles_${count}.css`;
        else title = `training_directive_${count}.txt`;
      }

      parts.push({
        type: "artifact",
        content: codeContent,
        language,
        title
      });

      count++;
      lastIndex = regex.lastIndex;
    }

    // Push trailing text part
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex)
      });
    }

    // Default return for standard simple text
    if (parts.length === 0) {
      return (
        <div className="text-slate-100 font-sans tracking-wide font-medium leading-relaxed break-words whitespace-pre-wrap">
          {formatMessageContent(content)}
        </div>
      );
    }

    return (
      <div className="space-y-3.5">
        {parts.map((part, pIdx) => {
          if (part.type === "text") {
            const trimmed = part.content.trim();
            if (!trimmed) return null;
            return (
              <div key={pIdx} className="text-slate-100 font-sans tracking-wide font-medium leading-relaxed break-words whitespace-pre-wrap">
                {formatMessageContent(part.content)}
              </div>
            );
          } else {
            const isWeb = part.language === "html" || part.language === "svg";
            const isDoc = part.language === "markdown" || part.language === "md" || part.language === "text";
            
            return (
              <div 
                key={pIdx}
                onClick={() => onOpenArtifact(part.title || "UA_Directive", part.content, part.language)}
                className="bg-[#0b101f] border-2 border-slate-800 hover:border-hero-gold p-4 rounded-xl flex items-center justify-between gap-4 transition-all duration-300 shadow-lg group cursor-pointer max-w-full my-3 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-fadeIn select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isWeb 
                      ? "bg-emerald-950/40 border-emerald-500/35 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black group-hover:border-black"
                      : isDoc 
                        ? "bg-blue-950/40 border-blue-500/35 text-blue-400 group-hover:bg-blue-500 group-hover:text-black group-hover:border-black"
                        : "bg-hero-gold/10 border-hero-gold/30 text-hero-gold group-hover:bg-hero-gold group-hover:text-black group-hover:border-black"
                  }`}>
                    {isWeb ? (
                      <Code2 className="w-5 h-5 animate-pulse" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="text-left min-w-0">
                    <h4 className="font-mono font-bold text-xs md:text-sm text-slate-100 group-hover:text-hero-gold truncate transition-colors tracking-wide">
                      {part.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <span>Live Preview Sandbox</span>
                      <span>•</span>
                      <span className="uppercase text-[9px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded font-bold tracking-wider">
                        {part.language}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-hero-dark group-hover:bg-hero-gold border border-slate-750 group-hover:border-black text-[10px] md:text-xs font-display font-black uppercase text-slate-300 group-hover:text-hero-dark flex items-center gap-1.5 transition-all flex-shrink-0 shadow active:translate-y-px"
                >
                  <Sparkles className="w-3.5 h-3.5 group-hover:animate-spin-slow" />
                  <span>View Artifact</span>
                </button>
              </div>
            );
          }
        })}
      </div>
    );
  };

  // Dynamic placeholder text selection
  const getPlaceholder = () => {
    if (activeAttack === "detroit_smash") {
      return "CONCENTRATING 100% OFA FORCE... DETROIT SMASH INBOUND!";
    }
    if (activeAttack === "united_states") {
      return "THE SYMBOL OF PEACE'S FINAL STRIKE... UNITED STATES OF SMASH!!";
    }
    return "Type your query, Young Midoriya... CLENCH YOUR FISTS!";
  };

  return (
    <div
      id="chat-area-container"
      className={`flex-1 flex flex-col h-full overflow-hidden relative bg-hero-dark transition-all duration-300 ${
        isDragging ? "ring-4 ring-hero-gold ring-inset bg-hero-dark/95" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop visual full screen HUD overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-hero-dark/95 backdrop-blur-md border-4 border-dashed border-hero-gold z-50 flex flex-col items-center justify-center p-6 text-center pointer-events-none"
          >
            <div className="absolute -inset-1 rounded bg-gradient-to-r from-hero-gold to-hero-crimson opacity-20 blur-xl animate-pulse" />
            <div className="relative animate-bounce mb-4 bg-slate-800 p-5 rounded-full border-3 border-hero-gold text-hero-gold shadow-[0_0_25px_rgba(245,158,11,0.55)]">
              <ImageIcon className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-display font-black text-white uppercase tracking-wider mb-2">
              "DROP IT HERE, YOUNG STUDENT!"
            </h3>
            <p className="text-slate-300 max-w-sm text-sm font-sans leading-relaxed">
              Release your image file to load it instantly into All Might's tactical training analysis!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic All Might Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: `url(${allMightBg})`,
          opacity: 0.18,
          filter: "grayscale(10%) contrast(110%)",
        }}
      />

      {/* Dynamic Halftone Comic Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(245,158,11,0.03)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none z-0" />

      {/* Header Panel */}
      <header className="relative z-10 px-4 py-3 bg-hero-slate/90 border-b-2 border-hero-gold/25 backdrop-blur-md flex flex-wrap gap-3 items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Responsive Hamburger Toggle for Sidebar on smaller screens */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md bg-hero-dark border border-slate-700 text-hero-gold hover:text-white hover:border-hero-gold transition-all lg:hidden focus:outline-none flex items-center justify-center shadow"
            aria-label="Toggle missions"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-2.5 h-2.5 rounded-full bg-hero-gold animate-ping hidden sm:block flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-1.5">
              Hero's Convo
              <span className="text-[10px] bg-hero-gold/15 border border-hero-gold/30 text-hero-gold px-1.5 py-0.5 rounded font-mono font-bold tracking-normal uppercase hidden xs:inline-block">PRO</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-mono truncate">
              Direct connection to the Symbol of Peace
            </p>
          </div>
        </div>

        {/* ChatGPT & Claude-style Header Control Rails */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Engine Gear selector (Dynamic model chooser equivalent to GPT-4 / Claude-Sonnet) */}
          <div className="flex items-center gap-1 bg-hero-dark/85 border border-slate-700/60 p-1 rounded-lg shadow-inner">
            <Sliders className="w-3.5 h-3.5 text-hero-gold ml-1.5 hidden xs:block" />
            <select
              value={selectedModel}
              onChange={(e) => onChangeModel(e.target.value as "ofa_100" | "ofa_50" | "ofa_120")}
              className="bg-transparent text-xs text-slate-100 font-mono font-bold focus:outline-none cursor-pointer pr-1 py-1 pl-1"
              title="Select Heroic Brain Intelligence (Compete with Claude 3.5 & GPT-4)"
            >
              <option value="ofa_100" className="bg-hero-dark text-slate-100">⚡ OFA 100% (Ultimate)</option>
              <option value="ofa_50" className="bg-hero-dark text-slate-100">🏎️ OFA 50% (Swift)</option>
              <option value="ofa_120" className="bg-hero-dark text-slate-100">🔥 OFA 120% (Plus Ultra)</option>
            </select>
          </div>

          {/* Settings button to customize System Instructions / Persona Guidelines */}
          <button
            onClick={() => setIsSystemInstructionsOpen(true)}
            className={`p-2 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow ${
              customInstructions.trim() 
                ? "bg-hero-crimson/15 border-hero-crimson/50 text-hero-crimson hover:bg-hero-crimson/25"
                : "bg-hero-dark border-slate-700/60 text-slate-300 hover:text-white hover:border-hero-gold"
            }`}
            title="Configure Custom Directives (System Prompts)"
          >
            <Settings className={`w-3.5 h-3.5 ${customInstructions.trim() ? "animate-spin text-hero-crimson" : ""}`} />
            <span className="hidden sm:inline">Directives</span>
          </button>

          {/* Export Chat Log */}
          <button
            onClick={handleExportChat}
            disabled={messages.length === 0}
            className={`p-2 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow ${
              messages.length === 0
                ? "opacity-40 cursor-not-allowed border-slate-800 text-slate-500 bg-hero-dark/30"
                : "bg-hero-dark border-slate-700/60 text-hero-gold hover:text-white hover:border-hero-gold"
            }`}
            title="Download conversation log (Markdown format)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Chat Messages Log */}
      <div
        id="messages-log"
        className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scroll bg-gradient-to-b from-transparent to-hero-dark/40"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-4"
            >
              <div className="relative mb-6">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-hero-gold to-hero-crimson opacity-50 blur-lg animate-pulse" />
                <img
                  src={allMightAvatar}
                  alt="All Might Huge Smile"
                  referrerPolicy="no-referrer"
                  className="relative w-32 h-32 rounded-full border-4 border-hero-gold shadow-[0_0_25px_rgba(245,158,11,0.6)] bg-hero-dark object-cover"
                />
              </div>

              <h2 className="font-display font-black text-2xl text-hero-gold mb-3 uppercase tracking-tight text-glow-gold">
                "I AM HERE!"
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Fear not, Young Midoriya! Our training mission has commenced. Ask me anything, clench your fists, and remember:{" "}
                <span className="text-hero-gold font-bold">A hero can always break through any obstacle!</span>
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="text-xs bg-hero-blue/20 text-blue-300 px-3 py-1.5 rounded-full border border-hero-blue/40 font-mono">
                  ⚡ 6a473d0d Agent Active
                </span>
                <span className="text-xs bg-hero-crimson/20 text-red-300 px-3 py-1.5 rounded-full border border-hero-crimson/40 font-mono">
                  🔥 Detroit Smash Tuned
                </span>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              return (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, x: isAssistant ? -20 : 20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className={`flex gap-4 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="flex-shrink-0">
                      <img
                        src={allMightAvatar}
                        alt="All Might"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border-2 border-hero-gold shadow bg-hero-slate object-cover"
                      />
                    </div>
                  )}

                  <div className={`max-w-[80%] md:max-w-[70%] flex flex-col`}>
                    {/* Speech Bubble Card Container */}
                    <div
                      className={`p-4 pr-12 rounded-2xl relative border-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group ${
                        isAssistant
                          ? "bg-gradient-to-b from-hero-slate to-hero-dark border-hero-gold text-slate-100 rounded-tl-none"
                          : "bg-gradient-to-b from-hero-blue-dark to-hero-blue border-hero-gold-bright text-white rounded-tr-none"
                      }`}
                    >
                      {/* Comic Stylized Corner Accents for Assistant */}
                      {isAssistant && (
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-3 border-l-3 border-hero-crimson" />
                      )}

                      {/* Copied visual feedback bubble */}
                      {copiedId === (msg.id || String(index)) && (
                        <div className="absolute -top-3.5 right-2 bg-green-600 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow border border-green-400 z-20 animate-bounce uppercase">
                          Copied!
                        </div>
                      )}

                      {/* Advanced Action Rails (Copy, Speak, Rate, Edit, Regenerate) */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        {/* Open as Document Artifact */}
                        <button
                          onClick={() => {
                            const lines = msg.content.trim().split("\n");
                            const titleLine = lines[0].replace(/[#*_\-]/g, "").trim();
                            const displayTitle = titleLine.slice(0, 40) || `Heroic Blueprint #${index + 1}`;
                            onOpenArtifact(displayTitle, msg.content);
                          }}
                          className="p-1 rounded bg-black/50 hover:bg-black/80 border border-slate-700/80 hover:border-hero-gold text-hero-gold hover:text-white transition-all flex items-center justify-center"
                          title="Open/Convert to Official Document"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Copy Action Button */}
                        <button
                          onClick={() => handleCopyMessage(msg.content, msg.id || String(index))}
                          className={`p-1 rounded bg-black/50 hover:bg-black/80 border border-slate-700/80 hover:border-hero-gold text-slate-300 hover:text-white transition-all flex items-center justify-center ${
                            copiedId === (msg.id || String(index)) ? "border-green-500 text-green-400 bg-green-950/40" : ""
                          }`}
                          title="Copy message text"
                        >
                          {copiedId === (msg.id || String(index)) ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Read Aloud Text-to-Speech (Assistant Only) */}
                        {isAssistant && (
                          <button
                            onClick={() => handleSpeakMessage(msg.content, msg.id || String(index))}
                            className={`p-1 rounded bg-black/50 hover:bg-black/80 border border-slate-700/80 hover:border-hero-gold transition-all flex items-center justify-center ${
                              speakingMessageId === (msg.id || String(index))
                                ? "border-hero-gold text-hero-gold animate-pulse bg-hero-gold/15"
                                : "text-slate-300 hover:text-white"
                            }`}
                            title={speakingMessageId === (msg.id || String(index)) ? "Stop Speak" : "Read Aloud"}
                          >
                            {speakingMessageId === (msg.id || String(index)) ? (
                              <VolumeX className="w-3.5 h-3.5" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Edit Message Button (User Only) */}
                        {!isAssistant && editingMessageIndex !== index && (
                          <button
                            onClick={() => {
                              setEditingMessageIndex(index);
                              setEditingText(msg.content);
                            }}
                            className="p-1 rounded bg-black/50 hover:bg-black/80 border border-slate-700/80 hover:border-hero-gold text-slate-300 hover:text-white transition-all flex items-center justify-center"
                            title="Edit message"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Thumbs Up Rating Feedback (Assistant Only) */}
                        {isAssistant && (
                          <button
                            onClick={() => onRateMessage(index, msg.rating === "thumbs_up" ? null : "thumbs_up")}
                            className={`p-1 rounded bg-black/50 hover:bg-black/80 border border-slate-700/80 hover:border-green-500 transition-all flex items-center justify-center ${
                              msg.rating === "thumbs_up" ? "text-green-400 border-green-500 bg-green-950/40" : "text-slate-300 hover:text-green-400"
                            }`}
                            title="Helpful / Great response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Thumbs Down Rating Feedback (Assistant Only) */}
                        {isAssistant && (
                          <button
                            onClick={() => onRateMessage(index, msg.rating === "thumbs_down" ? null : "thumbs_down")}
                            className={`p-1 rounded bg-black/50 hover:bg-black/80 border border-slate-700/80 hover:border-red-500 transition-all flex items-center justify-center ${
                              msg.rating === "thumbs_down" ? "text-red-400 border-red-500 bg-red-950/40" : "text-slate-300 hover:text-red-400"
                            }`}
                            title="Unhelpful / Needs improvement"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Regenerate AI Response (Assistant Only) */}
                        {isAssistant && (
                          <button
                            onClick={() => onRegenerateResponse(index)}
                            className="p-1 rounded bg-black/50 hover:bg-black/80 border border-slate-700/80 hover:border-hero-gold text-slate-300 hover:text-white transition-all flex items-center justify-center"
                            title="Regenerate this response"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Uploaded Photo if present */}
                      {msg.imageUrl && (
                        <div className="mb-3 overflow-hidden rounded-xl border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] max-w-sm bg-hero-dark relative group/image">
                          <img
                            src={msg.imageUrl}
                            alt="Student tactical attachment"
                            referrerPolicy="no-referrer"
                            className="w-full h-auto object-cover max-h-64 cursor-zoom-in hover:scale-[1.01] transition-transform duration-200"
                            onClick={() => {
                              // Open image in a new tab if clicked
                              const w = window.open();
                              if (w) {
                                w.document.write(`<img src="${msg.imageUrl}" style="max-width:100%; max-height:100vh; display:block; margin:auto; background:#111;"/>`);
                                w.document.body.style.background = "#111";
                              }
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-hero-blue border border-hero-gold text-hero-gold text-[8px] font-display font-black px-1.5 py-0.5 rounded shadow">
                            TACTICAL PHOTO
                          </div>
                        </div>
                      )}

                      {/* Rich Document & Audio Attachments if present */}
                      {msg.attachment && (
                        <div className="mb-3 max-w-sm rounded-xl border-3 border-black bg-slate-900 p-3.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left relative overflow-hidden group">
                          {/* Ambient background decoration */}
                          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-hero-gold/5 blur-lg group-hover:scale-125 transition-transform" />

                          {msg.attachment.type === "image" && (
                            <div className="overflow-hidden rounded-lg border-2 border-slate-800 bg-black relative">
                              <img
                                src={msg.attachment.url}
                                alt={msg.attachment.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-auto object-cover max-h-64 cursor-zoom-in hover:scale-[1.01] transition-all"
                                onClick={() => {
                                  const w = window.open();
                                  if (w) {
                                    w.document.write(`<img src="${msg.attachment?.url}" style="max-width:100%; max-height:100vh; display:block; margin:auto; background:#111;"/>`);
                                    w.document.body.style.background = "#111";
                                  }
                                }}
                              />
                            </div>
                          )}

                          {msg.attachment.type === "audio" && (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-hero-crimson/20 border border-hero-crimson/30 text-hero-crimson animate-pulse flex items-center justify-center flex-shrink-0">
                                  <Headphones className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-black text-hero-gold tracking-wide truncate uppercase">Audio Attachment</p>
                                  <p className="text-[10px] text-slate-400 truncate font-mono">{msg.attachment.name}</p>
                                </div>
                              </div>
                              <audio
                                src={msg.attachment.url}
                                controls
                                className="w-full h-8 mt-1 rounded bg-black border border-slate-800 text-hero-gold scale-95 focus:outline-none"
                              />
                            </div>
                          )}

                          {msg.attachment.type === "document" && (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 rounded-lg bg-hero-blue/20 border border-hero-blue/30 text-hero-blue flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-white truncate uppercase tracking-wider">{msg.attachment.name}</p>
                                  <p className="text-[9px] text-slate-400 font-mono truncate uppercase">{msg.attachment.mimeType || "Binary Document"}</p>
                                </div>
                              </div>
                              <a
                                href={msg.attachment.url}
                                download={msg.attachment.name}
                                className="p-2 rounded-lg bg-hero-gold text-hero-dark border-2 border-black hover:bg-hero-gold-bright transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs font-display font-black uppercase flex-shrink-0 flex items-center justify-center gap-1 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                title="Download Document"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-slate-950 border border-hero-gold/20 text-slate-400 text-[7px] font-mono px-1 py-0.5 rounded shadow uppercase">
                            {msg.attachment.type}
                          </div>
                        </div>
                      )}

                      {/* Sticker Image if present */}
                      {msg.stickerUrl && (
                        <div className="mb-3 overflow-hidden rounded-xl border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] max-w-xs bg-hero-dark relative group/sticker">
                          <img
                            src={msg.stickerUrl}
                            alt="Sticker"
                            referrerPolicy="no-referrer"
                            className="w-full h-auto object-cover max-h-48"
                          />
                          <div className="absolute top-1 right-1 bg-hero-gold text-hero-dark text-[8px] font-display font-black px-1 rounded shadow">
                            STICKER ACTIVE
                          </div>
                        </div>
                      )}

                      {/* Message Content or Edit Input Editor */}
                      {editingMessageIndex === index ? (
                        <div className="flex flex-col gap-2 mt-4">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full text-slate-100 bg-hero-dark border-2 border-hero-gold/45 focus:border-hero-gold rounded-lg p-2.5 text-xs font-sans outline-none min-h-[70px] custom-scroll shadow-inner"
                          />
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingMessageIndex(null)}
                              className="px-2 py-1 rounded bg-slate-850 border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onEditUserMessage(index, editingText);
                                setEditingMessageIndex(null);
                              }}
                              className="px-2.5 py-1 rounded bg-hero-gold text-[10px] font-mono font-black text-hero-dark hover:bg-hero-gold-bright transition-colors"
                            >
                              Save & Submit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          {parseAndRenderContent(msg.content, index)}
                          
                          {/* Rich Document conversion CTA for longer assistant responses that don't already have artifacts */}
                          {msg.content.length > 120 && !msg.content.includes("```") && (
                            <div className="mt-3.5 pt-2.5 border-t border-slate-700/40 flex justify-end">
                              <button
                                onClick={() => {
                                  const lines = msg.content.trim().split("\n");
                                  const titleLine = lines[0].replace(/[#*_\-]/g, "").trim();
                                  const displayTitle = titleLine.slice(0, 40) || `Hero Directive SOP-${index}`;
                                  onOpenArtifact(displayTitle, msg.content, "text");
                                }}
                                className="text-[10px] font-display font-black uppercase text-hero-gold hover:text-white bg-hero-gold/10 hover:bg-hero-gold/20 border border-hero-gold/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:translate-y-0.5 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-hero-gold animate-pulse" />
                                <span>Convert & Open as UA Document</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stamp-like Badge on Hero's Messages */}
                      {isAssistant && msg.isHeroic && (
                        <div className="absolute -bottom-3 -right-2 rotate-12 bg-hero-crimson text-white text-[9px] font-display font-black px-1.5 py-0.5 rounded border border-black shadow animate-bounce">
                          O.F.A POWER INJECTED
                        </div>
                      )}
                    </div>

                    {/* Timestamp / Sender identifier and status tags */}
                    <span
                      className={`text-[9px] font-mono text-slate-400 mt-1.5 px-1 flex flex-wrap items-center gap-1.5 ${
                        isAssistant ? "justify-start" : "justify-end"
                      }`}
                    >
                      <span className="font-bold">{isAssistant ? "ALL MIGHT" : "YOU"}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                      {msg.edited && (
                        <>
                          <span>•</span>
                          <span className="text-hero-gold font-bold italic tracking-wide uppercase text-[8px] bg-hero-gold/10 px-1 rounded border border-hero-gold/20">EDITED</span>
                        </>
                      )}
                      {isAssistant && msg.modelUsed && (
                        <>
                          <span>•</span>
                          <span className="text-blue-400 font-bold bg-blue-950/60 px-1 rounded uppercase tracking-wider text-[8px] border border-blue-900/40">
                            {msg.modelUsed === "ofa_100" ? "OFA 100%" : msg.modelUsed === "ofa_50" ? "OFA Swift" : "OFA 120%"}
                          </span>
                        </>
                      )}
                      {isAssistant && msg.rating && (
                        <>
                          <span>•</span>
                          <span className={`font-bold px-1 rounded uppercase tracking-wider text-[8px] border ${
                            msg.rating === "thumbs_up"
                              ? "text-green-400 bg-green-950/60 border-green-900/40"
                              : "text-red-400 bg-red-950/60 border-red-900/40"
                          }`}>
                            {msg.rating === "thumbs_up" ? "Helpful" : "Needs Grit"}
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  {!isAssistant && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hero-blue to-hero-crimson border-2 border-white flex items-center justify-center font-display font-extrabold text-white text-sm shadow">
                        YOUNG
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}

          {/* Assistant is generating response loader */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-4 justify-start w-full max-w-4xl"
            >
              <div className="flex-shrink-0">
                <img
                  src={allMightAvatar}
                  alt="All Might charging"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border-2 border-hero-gold animate-bounce bg-hero-slate object-cover shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                />
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                {/* Advanced Claude-Style Thinking Container */}
                <div className="rounded-2xl rounded-tl-none bg-[#0b101f]/95 border-2 border-slate-800 shadow-xl overflow-hidden flex flex-col">
                  
                  {/* Title & Interactive Toggle Bar */}
                  <div 
                    onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                    className="px-4 py-3 bg-[#0d1428] border-b border-slate-800/80 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-hero-gold/10 text-hero-gold flex items-center justify-center flex-shrink-0 border border-hero-gold/30">
                        <Cpu className="w-4 h-4 animate-spin-slow" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span>Thinking Process</span>
                          <span className="text-[9px] font-mono bg-hero-gold/10 text-hero-gold px-1.5 py-0.2 rounded font-bold uppercase tracking-normal">
                            Claude Schema
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {thinkingStep < THOUGHT_STEPS.length 
                            ? `Step ${thinkingStep + 1}/${THOUGHT_STEPS.length}: ${THOUGHT_STEPS[thinkingStep].text.slice(0, 45)}...`
                            : "Compiling Artifact..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-right select-none">
                        <span className="w-2 h-2 rounded-full bg-hero-gold animate-ping" />
                        <span className="font-mono text-xs font-black text-hero-gold">{sparkPower}%</span>
                      </div>
                      <button className="text-slate-400 hover:text-white p-0.5 transition-colors">
                        {isThinkingExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Progressive Core Power charging bar */}
                  <div className="h-1 w-full bg-slate-950 relative">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-hero-crimson via-hero-gold to-emerald-400 transition-all duration-300 shadow-[0_0_8px_#eab308]"
                      style={{ width: `${sparkPower}%` }}
                    />
                  </div>

                  {/* Expandable Panel */}
                  <AnimatePresence initial={false}>
                    {isThinkingExpanded ? (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden flex flex-col"
                      >
                        {/* Interactive filter and categorization controls */}
                        <div className="px-4 py-2 bg-[#090e1b] border-b border-slate-900/90 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                            <span className="text-[9px] font-display font-black text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
                            {(["all", "system", "parsing", "codegen", "quality"] as const).map(tab => (
                              <button
                                key={tab}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setThinkingLogFilter(tab);
                                }}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider transition-all select-none border cursor-pointer ${
                                  thinkingLogFilter === tab
                                    ? "bg-hero-gold text-hero-dark border-hero-gold shadow"
                                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                                }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>

                          <div className="hidden md:flex items-center gap-1.5 text-slate-500 font-mono text-[9px] uppercase">
                            <Terminal className="w-3 h-3" />
                            <span>COGNITIVE LOG STREAM</span>
                          </div>
                        </div>

                        {/* Scrolling Console log viewport */}
                        <div className="p-4 bg-[#070b14] max-h-56 overflow-y-auto custom-scroll font-mono text-[11px] leading-relaxed space-y-2 select-text border-b border-slate-900 text-left">
                          {thinkingLogs
                            .filter(log => thinkingLogFilter === "all" || log.category === thinkingLogFilter)
                            .map((log, lIdx) => {
                              const isActive = log.status === "active";
                              const isCompleted = log.status === "completed";
                              
                              return (
                                <div 
                                  key={lIdx} 
                                  className={`flex items-start gap-2.5 transition-colors duration-200 py-0.5 px-1.5 rounded ${
                                    isActive 
                                      ? "bg-hero-gold/5 text-hero-gold" 
                                      : isCompleted 
                                        ? "text-slate-300" 
                                        : "text-slate-600 select-none"
                                  }`}
                                >
                                  {/* Status Indicators */}
                                  <div className="mt-1 flex-shrink-0">
                                    {isCompleted ? (
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                                    ) : isActive ? (
                                      <div className="w-2 h-2 rounded-full bg-hero-gold animate-ping shadow-[0_0_8px_#eab308]" />
                                    ) : (
                                      <div className="w-2 h-2 rounded-full bg-slate-800" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <span className={`font-bold mr-1.5 uppercase text-[9px] ${
                                      log.category === "system" 
                                        ? "text-blue-400" 
                                        : log.category === "parsing" 
                                          ? "text-purple-400" 
                                          : log.category === "codegen" 
                                            ? "text-amber-400" 
                                            : "text-emerald-400"
                                    }`}>
                                      [{log.category}]
                                    </span>
                                    <span>{log.text}</span>
                                  </div>

                                  {isActive && (
                                    <span className="text-[8px] bg-hero-gold/10 border border-hero-gold/30 px-1 rounded font-bold animate-pulse text-hero-gold">
                                      ACTIVE
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                        </div>

                        {/* Interactive Motivational Tip Widget */}
                        <div className="p-3 bg-[#0a0f1d] border-t border-slate-900 flex items-center gap-3 select-none">
                          <div className="p-2 rounded-lg bg-hero-crimson/15 text-hero-crimson flex-shrink-0 border border-hero-crimson/30">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="text-[9px] font-display font-black uppercase text-hero-gold-bright tracking-widest">
                              Symbol of Peace Guidance:
                            </div>
                            <p className="text-[10px] text-slate-300 leading-tight italic truncate">
                              {thinkingStep < 3 
                                ? "“First, map the query target boundaries. A clean strategy ensures a stellar result! PLUS ULTRA!”"
                                : thinkingStep < 8 
                                  ? "“Now, we build the reactive components! Make it modular, resilient, and visually polished!”"
                                  : "“Perform final checks before deployment! The details are where actual craftsmanship resides!”"}
                            </p>
                          </div>
                        </div>

                      </motion.div>
                    ) : (
                      /* Minimized single-line status bar */
                      <div 
                        onClick={() => setIsThinkingExpanded(true)}
                        className="px-4 py-2 bg-[#080c18] hover:bg-slate-900/30 text-[10px] font-mono text-slate-300 flex items-center justify-between gap-3 select-none cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Activity className="w-3.5 h-3.5 text-hero-gold animate-pulse" />
                          <span>Active step: <strong className="text-hero-gold font-bold">{THOUGHT_STEPS[thinkingStep]?.text || "Processing..."}</strong></span>
                        </span>
                        <span className="text-slate-500 hover:text-slate-300 shrink-0">Click to expand details</span>
                      </div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form & Attack Modifiers Panel */}
      <footer className="relative z-10 p-4 bg-hero-slate/90 border-t-2 border-hero-gold/20 backdrop-blur-md">
        {/* Hidden File Input Picker */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,audio/*,application/pdf,text/*,.csv,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {/* Special Attack Toggle Rail */}
        <div className="flex items-center gap-2 mb-3 px-1 overflow-x-auto pb-1" id="attacks-panel">
          <span className="text-[10px] font-display font-black text-slate-400 uppercase tracking-widest mr-2 flex-shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-hero-gold" />
            Attack Modifiers:
          </span>

          <button
            type="button"
            onClick={() => triggerAttack("detroit_smash")}
            className={`px-3 py-1.5 rounded text-xs font-display font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 ${
              activeAttack === "detroit_smash"
                ? "bg-hero-crimson text-white border-white text-glow-crimson"
                : "bg-hero-dark border-hero-crimson text-hero-crimson hover:bg-hero-crimson/10"
            }`}
          >
            💥 Detroit Smash (100%)
          </button>

          <button
            type="button"
            disabled={oflCapacity < 50}
            onClick={() => triggerAttack("united_states")}
            className={`px-3 py-1.5 rounded text-xs font-display font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 ${
              oflCapacity < 50 ? "opacity-40 cursor-not-allowed border-slate-700 text-slate-500 bg-hero-dark shadow-none active:translate-none" : ""
            } ${
              activeAttack === "united_states"
                ? "bg-hero-gold text-hero-dark border-white text-glow-gold"
                : "bg-hero-dark border-hero-gold text-hero-gold hover:bg-hero-gold/10"
            }`}
            title={oflCapacity < 50 ? "Requires at least 50% OFA capacity!" : "Trigger ultimate visual strike"}
          >
            🔥 United States Of Smash
          </button>
        </div>

        {/* Selected Attachment Preview with remove button */}
        {attachedFile && (
          <div className="mb-2.5 p-2 bg-hero-dark border-2 border-hero-gold/30 rounded-xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              {attachedFile.type === "image" && attachedPreviewUrl ? (
                <img
                  src={attachedPreviewUrl}
                  alt="Upload preview"
                  className="w-12 h-12 rounded-lg object-cover border-2 border-hero-gold shadow"
                />
              ) : attachedFile.type === "audio" ? (
                <div className="w-12 h-12 rounded-lg bg-hero-crimson/25 border-2 border-hero-crimson flex items-center justify-center text-hero-crimson shadow animate-pulse">
                  <Headphones className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-hero-blue/25 border-2 border-hero-blue flex items-center justify-center text-hero-blue shadow">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-hero-gold tracking-wide uppercase">
                  {attachedFile.type === "image"
                    ? "Hero Photo Attached"
                    : attachedFile.type === "audio"
                    ? "Voice Entry/Audio Clip Attached"
                    : "Training Document Attached"}
                </span>
                <span className="text-[9px] text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs block">
                  {attachedFile.name} (Ready to send!)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedFile(null);
                setAttachedPreviewUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="p-1.5 rounded-lg bg-hero-crimson/20 border border-hero-crimson/40 text-hero-crimson hover:bg-hero-crimson hover:text-white transition-all shadow cursor-pointer"
              title="Remove attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Real-time drafting metrics & Voice Listening Status */}
        <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-slate-400 mb-2 px-1">
          <div>
            {isListening ? (
              <span className="flex items-center gap-1.5 text-hero-crimson font-black uppercase animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-hero-crimson animate-ping" />
                🎙️ One For All Voice Input Active... Speak now!
              </span>
            ) : (
              <span className="text-[9px] text-slate-500 hidden xs:inline-block">
                Press the Mic, drag image or type to draft your hero query
              </span>
            )}
          </div>
          {inputText.trim() && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <span>Words: <strong className="text-hero-gold">{inputText.trim().split(/\s+/).filter(Boolean).length}</strong></span>
              <span>•</span>
              <span>Characters: <strong className="text-hero-gold">{inputText.length}</strong></span>
              <span>•</span>
              <span>Est. Tokens: <strong className="text-hero-gold">{Math.ceil(inputText.length / 4)}</strong></span>
            </div>
          )}
        </div>

        {/* Text Input Layout */}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
          {/* Image Upload Input Picker Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-hero-slate hover:bg-slate-800 border-3 border-slate-800 hover:border-hero-gold text-slate-300 hover:text-hero-gold rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="Upload photo, audio, or document for training analysis"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={getPlaceholder()}
              className={`w-full bg-hero-dark text-slate-100 placeholder-slate-500 font-sans text-sm md:text-base rounded-xl py-3.5 pl-4 pr-20 border-3 outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                activeAttack === "detroit_smash"
                  ? "border-hero-crimson ring-2 ring-red-500/50"
                  : activeAttack === "united_states"
                  ? "border-hero-gold ring-2 ring-amber-500/50"
                  : "border-slate-800 focus:border-hero-gold focus:ring-2 focus:ring-amber-500/20"
              }`}
            />
            
            {/* Mic voice input button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all focus:outline-none flex items-center justify-center z-10 ${
                isListening
                  ? "bg-hero-crimson text-white animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)] border border-white/20"
                  : "bg-transparent text-slate-400 hover:text-hero-gold hover:bg-slate-800"
              }`}
              title={isListening ? "Listening... Click to stop voice input" : "Start Voice Input (Speech to Text)"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white animate-bounce" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Quick Indicator of current mode */}
            {activeAttack && (
              <span className="absolute right-12 top-1/2 -translate-y-1/2 flex h-2 w-2 z-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hero-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-hero-gold"></span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={(!inputText.trim() && !attachedFile) || isLoading}
            className={`py-3.5 px-6 rounded-xl font-display font-black text-sm uppercase tracking-wider flex items-center gap-2 border-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all select-none ${
              (!inputText.trim() && !attachedFile) || isLoading
                ? "bg-slate-800 text-slate-500 border-slate-900 cursor-not-allowed shadow-none active:translate-none"
                : "bg-hero-gold hover:bg-hero-gold-bright text-hero-dark border-black cursor-pointer animate-pulse"
            }`}
          >
            <span>SMASH!</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>

      {/* ChatGPT/Claude System Instructions (Directives) Modal Drawer */}
      <AnimatePresence>
        {isSystemInstructionsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 z-40 flex items-center justify-end backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ x: 50, scale: 0.95 }}
              animate={{ x: 0, scale: 1 }}
              exit={{ x: 50, scale: 0.95 }}
              className="bg-hero-slate border-3 border-hero-gold text-slate-100 rounded-2xl w-full max-w-md p-6 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4"
            >
              <button
                type="button"
                onClick={() => setIsSystemInstructionsOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-md bg-hero-dark border border-slate-700 text-slate-400 hover:text-white hover:border-hero-gold transition-colors"
                title="Close settings"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <h3 className="font-display font-extrabold text-base text-hero-gold uppercase tracking-wider flex items-center gap-2">
                  <Settings className="w-4 h-4 text-hero-gold animate-spin" />
                  Hero Guidelines Tuning
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Inject custom system prompt constraints to command All Might's logic & tone (ChatGPT & Claude equivalent).
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-display font-bold text-slate-300 uppercase tracking-wider">
                  Custom Student Directives:
                </label>
                <textarea
                  value={customInstructionsText}
                  onChange={(e) => setCustomInstructionsText(e.target.value)}
                  placeholder="e.g., 'Speak with extreme dramatic flavor', 'Structure your feedback using strict bullet points', 'Be a highly demanding mentor'..."
                  className="w-full bg-hero-dark text-slate-100 placeholder-slate-650 rounded-xl p-3 border-2 border-slate-800 focus:border-hero-gold outline-none text-xs min-h-[120px] custom-scroll"
                />
              </div>

              <div className="bg-hero-dark/65 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-hero-gold flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                  These system prompts are persistent and injected at the core of One For All's reasoning chain. All subsequent replies will adapt perfectly.
                </p>
              </div>

              <div className="flex items-center gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomInstructionsText("");
                    onSaveCustomInstructions("");
                    setIsSystemInstructionsOpen(false);
                  }}
                  className="px-3 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Reset Directives
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSaveCustomInstructions(customInstructionsText);
                    setIsSystemInstructionsOpen(false);
                  }}
                  className="px-4 py-2 bg-hero-gold hover:bg-hero-gold-bright border-2 border-black shadow-[2px_2px_0px_0px_#000] text-hero-dark text-xs font-display font-black uppercase tracking-wider rounded-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Apply & Synchronize
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
