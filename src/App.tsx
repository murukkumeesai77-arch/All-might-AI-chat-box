import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { SpecialEffectOverlay } from "./components/SpecialEffectOverlay";
import { Session, Message } from "./types";
import { ShieldAlert, Info, HelpCircle } from "lucide-react";

import allMightBg from "./assets/images/all_might_bg_1783057030750.jpg";
import allMightAvatar from "./assets/images/all_might_avatar_1783057045442.jpg";

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [oflCapacity, setOflCapacity] = useState<number>(85);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [effectType, setEffectType] = useState<"plus_ultra" | "detroit_smash" | "united_states" | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Initialize sessions from local storage or generate default matching user credentials
  useEffect(() => {
    const savedSessions = localStorage.getItem("all_might_chat_sessions");
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      } catch (err) {
        console.error("Error reading saved sessions", err);
      }
    }

    // Default Fallback Session - matches user's exact Lyzr details
    const defaultSession: Session = {
      id: "6a473d0dbf06a85a06e4f461-6gcgwzc8",
      name: "UA Academy Intro Mission",
      messages: [
        {
          id: "welcome-msg",
          role: "assistant",
          content: "HA HA HA HA! Fear not, young student! Why? **BECAUSE I AM HERE!** Welcome to Hero's Convo! Together, we shall train, chat, and break through any boundaries. Tell me, what challenges are you facing today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isHeroic: true,
        }
      ],
      createdAt: new Date().toLocaleTimeString(),
    };

    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
  }, []);

  // Sync sessions to localStorage
  const saveSessions = (updatedSessions: Session[]) => {
    setSessions(updatedSessions);
    localStorage.setItem("all_might_chat_sessions", JSON.stringify(updatedSessions));
  };

  // Create new training session/chat mission
  const handleCreateSession = () => {
    // Generate an ID prefixed with agent_id to support standard backend session tracking structure
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const newSessionId = `6a473d0dbf06a85a06e4f461-${randomSuffix}`;

    const newSession: Session = {
      id: newSessionId,
      name: `Training Mission #${sessions.length + 1}`,
      messages: [
        {
          id: `welcome-${randomSuffix}`,
          role: "assistant",
          content: "A fresh task has appeared, Young Hero! Clench your fists, find your courage, and let's go beyond! **What shall we discuss?**",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isHeroic: true,
        }
      ],
      createdAt: new Date().toLocaleTimeString(),
    };

    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newSessionId);
  };

  // Delete a mission
  const handleDeleteSession = (idToDelete: string) => {
    if (sessions.length <= 1) return;
    const filtered = sessions.filter((s) => s.id !== idToDelete);
    saveSessions(filtered);
    if (activeSessionId === idToDelete) {
      setActiveSessionId(filtered[0].id);
    }
  };

  // Increase power level via Cheer action
  const handleCheer = () => {
    setEffectType("plus_ultra");
    setOflCapacity((prev) => Math.min(100, prev + 25));
  };

  // State for Advanced LLM options (ChatGPT/Claude Competitor features)
  const [selectedModel, setSelectedModel] = useState<"ofa_100" | "ofa_50" | "ofa_120">(() => {
    return (localStorage.getItem("all_might_selected_model") as "ofa_100" | "ofa_50" | "ofa_120") || "ofa_100";
  });
  const [customInstructions, setCustomInstructions] = useState<string>(() => {
    return localStorage.getItem("all_might_custom_instructions") || "";
  });

  const handleSaveCustomInstructions = (instructions: string) => {
    setCustomInstructions(instructions);
    localStorage.setItem("all_might_custom_instructions", instructions);
  };

  const handleChangeModel = (model: "ofa_100" | "ofa_50" | "ofa_120") => {
    setSelectedModel(model);
    localStorage.setItem("all_might_selected_model", model);
  };

  // Common fetch utility for LLM interaction (supports selected model & custom system prompts)
  const handleFetchBotReply = async (
    userPrompt: string,
    currentHistory: Message[],
    image: { data: string; mimeType: string } | null = null,
    attachment: { data: string; mimeType: string; name: string; type: "image" | "audio" | "document" } | null = null
  ) => {
    setIsLoading(true);
    try {
      console.log(`Querying LLM with model: ${selectedModel} & custom directives: "${customInstructions}"`);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userPrompt,
          session_id: activeSessionId,
          model: selectedModel,
          custom_instructions: customInstructions,
          image,
          attachment,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error code: ${response.status}`);
      }

      const data = await response.json();
      const replyText =
        data.response ||
        data.text ||
        data.message ||
        data.reply ||
        (data.data && data.data.response) ||
        JSON.stringify(data);

      const botMessageObj: Message = {
        id: `bot-msg-${Date.now()}`,
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHeroic: false,
        modelUsed: selectedModel, // Stamp with the active brain engine
      };

      const finalMessages = [...currentHistory, botMessageObj];
      const finalSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, messages: finalMessages } : s
      );
      saveSessions(finalSessions);
    } catch (error: any) {
      console.error("Failed to fetch reply:", error);

      const errorReply: Message = {
        id: `error-msg-${Date.now()}`,
        role: "assistant",
        content: `We encountered an energy disruption in the air pressure! (System Error: ${error.message}). But fear not, young pupil! A hero never surrenders to bad networks. Try submitting your query again, and let's stand proud!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHeroic: false,
        modelUsed: selectedModel,
      };

      const finalMessages = [...currentHistory, errorReply];
      const finalSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, messages: finalMessages } : s
      );
      saveSessions(finalSessions);
    } finally {
      setIsLoading(false);
    }
  };

  // Process message submission
  const handleSendMessage = useCallback(
    async (
      text: string,
      specialAttack: "plus_ultra" | "detroit_smash" | "united_states" | null = null,
      image: { data: string; mimeType: string } | null = null,
      attachment: { data: string; mimeType: string; name: string; type: "image" | "audio" | "document" } | null = null
    ) => {
      if ((!text.trim() && !image && !attachment) || isLoading) return;

      const activeSession = sessions.find((s) => s.id === activeSessionId);
      if (!activeSession) return;

      let finalUserMessage = text;
      let powerReduction = 5;

      // Adjust message prefix and capacity based on special anime attack
      if (specialAttack === "detroit_smash") {
        finalUserMessage = `💥 [DETROIT SMASH! 100%] 💥 ${text}`;
        setEffectType("detroit_smash");
        powerReduction = 20;
      } else if (specialAttack === "united_states") {
        finalUserMessage = `🔥 [UNITED STATES OF SMASH!!!] 🔥 ${text}`;
        setEffectType("united_states");
        powerReduction = 45;
      }

      // If no text but image/attachment is uploaded, provide a default helpful search query
      let activeAttachment = attachment;
      if (!activeAttachment && image && image.data) {
        activeAttachment = {
          data: image.data,
          mimeType: image.mimeType || "image/png",
          name: "photo.png",
          type: "image",
        };
      }

      if (!finalUserMessage.trim() && activeAttachment) {
        if (activeAttachment.type === "image") {
          finalUserMessage = "What's in this hero photo? Help me analyze it!";
        } else if (activeAttachment.type === "audio") {
          finalUserMessage = "Listen to this audio file! Can you analyze it?";
        } else {
          finalUserMessage = `Can you analyze the contents of this document: "${activeAttachment.name}"?`;
        }
      }

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let imageUrl: string | undefined = undefined;
      if (activeAttachment && activeAttachment.type === "image") {
        imageUrl = `data:${activeAttachment.mimeType};base64,${activeAttachment.data}`;
      }

      let messageAttachment = undefined;
      if (activeAttachment) {
        messageAttachment = {
          url: `data:${activeAttachment.mimeType};base64,${activeAttachment.data}`,
          name: activeAttachment.name,
          mimeType: activeAttachment.mimeType,
          type: activeAttachment.type,
        };
      }

      const userMessageObj: Message = {
        id: `user-msg-${Date.now()}`,
        role: "user",
        content: finalUserMessage,
        timestamp,
        imageUrl,
        attachment: messageAttachment,
      };

      // Add user message immediately to layout
      const updatedMessages = [...activeSession.messages, userMessageObj];
      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, messages: updatedMessages } : s
      );
      saveSessions(updatedSessions);
      setIsLoading(true);

      // Reduce One For All power level based on action
      setOflCapacity((prev) => Math.max(5, prev - powerReduction));

      // Trigger API reply using common method
      await handleFetchBotReply(finalUserMessage, updatedMessages, image, attachment);
    },
    [sessions, activeSessionId, isLoading, selectedModel, customInstructions]
  );

  // Sticker trigger handler
  const handleTriggerSticker = async (messageText: string, stickerUrl: string) => {
    if (isLoading) return;

    const activeSession = sessions.find((s) => s.id === activeSessionId);
    if (!activeSession) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create sticker message from User
    const userMessageObj: Message = {
      id: `user-sticker-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp,
      stickerUrl,
    };

    const updatedMessages = [...activeSession.messages, userMessageObj];
    const updatedSessions = sessions.map((s) =>
      s.id === activeSessionId ? { ...s, messages: updatedMessages } : s
    );
    saveSessions(updatedSessions);
    setIsLoading(true);

    // Boost OFA slightly and show a beautiful action spark
    setEffectType("plus_ultra");
    setOflCapacity((prev) => Math.min(100, prev + 15));

    await handleFetchBotReply(`[STICKER_EVENT]: Student shared a heroic Midoriya and All Might Sticker: "${messageText}". Reply heroically as All Might praising our team spirit!`, updatedMessages);
  };

  // Edit User Message (ChatGPT/Claude style: replace message content, mark as edited, drop subsequent messages and re-submit)
  const handleEditUserMessage = async (index: number, newText: string) => {
    if (!currentSession || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const editedUserMsg: Message = {
      ...currentSession.messages[index],
      content: newText,
      edited: true,
      timestamp,
    };

    const updatedMessages = [...currentSession.messages.slice(0, index), editedUserMsg];
    const updatedSessions = sessions.map((s) =>
      s.id === activeSessionId ? { ...s, messages: updatedMessages } : s
    );
    saveSessions(updatedSessions);

    await handleFetchBotReply(newText, updatedMessages);
  };

  // Regenerate Response (ChatGPT/Claude style: find preceding user query, clear active and subsequent assistant lines, request fresh reply)
  const handleRegenerateResponse = async (index: number) => {
    if (!currentSession || isLoading) return;

    let userPromptText = "";
    let historyToKeep: Message[] = [];

    // Find the closest preceding user message to regenerate from
    for (let i = index - 1; i >= 0; i--) {
      if (currentSession.messages[i].role === "user") {
        userPromptText = currentSession.messages[i].content;
        historyToKeep = currentSession.messages.slice(0, i + 1);
        break;
      }
    }

    if (!userPromptText) {
      userPromptText = "Tell me something heroic and motivational, All Might!";
      historyToKeep = currentSession.messages.slice(0, index);
    }

    const updatedSessions = sessions.map((s) =>
      s.id === activeSessionId ? { ...s, messages: historyToKeep } : s
    );
    saveSessions(updatedSessions);

    await handleFetchBotReply(userPromptText, historyToKeep);
  };

  // Rate Message (Thumbs Up / Down feedback flag)
  const handleRateMessage = (index: number, rating: "thumbs_up" | "thumbs_down" | null) => {
    if (!currentSession) return;

    const updatedMessages = currentSession.messages.map((m, idx) =>
      idx === index ? { ...m, rating } : m
    );
    const updatedSessions = sessions.map((s) =>
      s.id === activeSessionId ? { ...s, messages: updatedMessages } : s
    );
    saveSessions(updatedSessions);
  };

  const currentSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div id="app-root" className="flex flex-col lg:flex-row h-screen overflow-hidden bg-hero-dark text-slate-100 font-sans relative">
      {/* Absolute Header Overlay with beautiful status alert */}
      <div className="absolute top-2 right-4 z-20 hidden md:flex items-center gap-1.5 bg-hero-slate/80 text-[10px] font-mono text-hero-gold px-2.5 py-1 rounded-full border border-hero-gold/40 shadow">
        <ShieldAlert className="w-3 h-3 text-hero-crimson" />
        <span>Connected to Lyzr Model Agent</span>
      </div>

      {/* Special Full-screen Anime Battle Effects */}
      <SpecialEffectOverlay effectType={effectType} onClose={() => setEffectType(null)} />

      {/* Mobile Drawer Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 z-20 backdrop-blur-sm lg:hidden cursor-pointer transition-opacity duration-300"
        />
      )}

      {/* Left Sidebar Pane */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setIsSidebarOpen(false); // Auto-close on mobile/tablet when switching mission
        }}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        allMightAvatar={allMightAvatar}
        oflCapacity={oflCapacity}
        onCheer={handleCheer}
        onTriggerSticker={(messageText, stickerUrl) => {
          handleTriggerSticker(messageText, stickerUrl);
          setIsSidebarOpen(false); // Auto-close on mobile/tablet after selecting a sticker
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Canvas */}
      <main id="chat-canvas" className="flex-1 flex flex-col h-full relative overflow-hidden">
        <ChatArea
          messages={currentSession ? currentSession.messages : []}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          allMightAvatar={allMightAvatar}
          allMightBg={allMightBg}
          oflCapacity={oflCapacity}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onRegenerateResponse={handleRegenerateResponse}
          onEditUserMessage={handleEditUserMessage}
          onRateMessage={handleRateMessage}
          selectedModel={selectedModel}
          onChangeModel={handleChangeModel}
          customInstructions={customInstructions}
          onSaveCustomInstructions={handleSaveCustomInstructions}
        />
      </main>
    </div>
  );
}
