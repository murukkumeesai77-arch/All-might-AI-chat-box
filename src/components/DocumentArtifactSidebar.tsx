import React, { useState, useEffect } from "react";
import { 
  X, Download, FileText, Edit, Save, Eye, Printer, Copy, Check, FileCode, Sparkles, Code2, Play, RefreshCw
} from "lucide-react";
import { motion } from "motion/react";

interface DocumentArtifactSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: { title: string; content: string; language?: string } | null;
  onSaveDocument?: (updatedContent: string) => void;
}

export const DocumentArtifactSidebar: React.FC<DocumentArtifactSidebarProps> = ({
  isOpen,
  onClose,
  documentData,
  onSaveDocument,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [docContent, setDocContent] = useState<string>("");
  const [docTitle, setDocTitle] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [detectedLang, setDetectedLang] = useState<string>("text");
  const [iframeKey, setIframeKey] = useState<number>(0); // For reloading the live preview sandbox
  const [popupError, setPopupError] = useState<string | null>(null);

  // Auto-clear popup error after 5 seconds
  useEffect(() => {
    if (popupError) {
      const timer = setTimeout(() => {
        setPopupError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [popupError]);

  // Auto-detect the code block's language
  const detectLanguage = (title: string, content: string): string => {
    const lowerTitle = title.toLowerCase();
    const trimmed = content.trim();
    if (lowerTitle.endsWith(".html") || trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
      return "html";
    }
    if (lowerTitle.endsWith(".svg") || (trimmed.startsWith("<svg") && trimmed.endsWith("</svg>"))) {
      return "svg";
    }
    if (lowerTitle.endsWith(".md") || trimmed.startsWith("# ") || trimmed.includes("**") || trimmed.includes("###")) {
      return "markdown";
    }
    if (lowerTitle.endsWith(".json") || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      return "json";
    }
    if (lowerTitle.endsWith(".js") || lowerTitle.endsWith(".jsx")) {
      return "javascript";
    }
    if (lowerTitle.endsWith(".ts") || lowerTitle.endsWith(".tsx")) {
      return "typescript";
    }
    if (lowerTitle.endsWith(".css")) {
      return "css";
    }
    return "text";
  };

  useEffect(() => {
    if (documentData) {
      setDocContent(documentData.content);
      const cleanTitle = documentData.title
        .replace(/[^\w\s\.-]/gi, "")
        .trim() || "UA_Heroic_Directive";
      setDocTitle(cleanTitle);
      
      const lang = documentData.language || detectLanguage(cleanTitle, documentData.content);
      setDetectedLang(lang);
      
      // Default to "code" if it's purely javascript/typescript/json, otherwise "preview"
      if (["javascript", "typescript", "json", "css"].includes(lang)) {
        setActiveTab("code");
      } else {
        setActiveTab("preview");
      }
    }
  }, [documentData]);

  if (!isOpen || !documentData) return null;

  // 1. Copy raw content
  const handleCopy = () => {
    navigator.clipboard.writeText(docContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 2. Download as Markdown (.md)
  const handleDownloadMarkdown = () => {
    let finalMd = docContent;
    if (detectedLang !== "markdown") {
      const mdHeader = `# 🌟 UA HIGH ACADEMY: HEROIC BLUEPRINT 🌟\n`;
      const mdSub = `*Official Training Directive | Generated: ${new Date().toLocaleDateString()}*\n\n`;
      const mdFooter = `\n\n---\n*“Go Beyond! PLUS ULTRA!” — Toshinori Yagi (All Might)*\n`;
      finalMd = `${mdHeader}${mdSub}## ${docTitle}\n\n\`\`\`${detectedLang}\n${docContent}\n\`\`\`${mdFooter}`;
    }
    
    const blob = new Blob([finalMd], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${docTitle.toLowerCase().replace(/\s+/g, "_")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Download as Text (.txt)
  const handleDownloadText = () => {
    const divider = "========================================================\n";
    const header = `${divider}🌟 UA HIGH ACADEMY: OFFICIAL HEROIC BLUEPRINT & DIRECTIVE 🌟\n${divider}`;
    const sub = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n`;
    const footer = `\n\n${divider}Keep Training! Go Beyond! PLUS ULTRA!\n- Toshinori Yagi (All Might)\n${divider}`;
    
    const cleanBody = docContent.replace(/\*\*([\s\S]*?)\*\*/g, "$1");
    const finalTxt = `${header}${sub}TITLE: ${docTitle}\n\n${cleanBody}${footer}`;
    
    const blob = new Blob([finalTxt], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${docTitle.toLowerCase().replace(/\s+/g, "_")}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Download as Word Document (.doc)
  const handleDownloadWord = () => {
    const formattedParagraphs = docContent
      .split("\n\n")
      .map(p => {
        const boldified = p.replace(/\*\*([\s\S]*?)\*\*/g, "<strong>$1</strong>");
        return `<p style="margin-bottom: 12pt; text-align: justify; line-height: 1.5; font-size: 11pt; font-family: 'Arial', sans-serif; color: #222222;">${boldified}</p>`;
      })
      .join("");

    const htmlDoc = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <style>
          @page {
            size: 8.5in 11in;
            margin: 1.0in 1.0in 1.0in 1.0in;
          }
          body {
            font-family: 'Arial', sans-serif;
            color: #222222;
          }
          .header-table {
            width: 100%;
            border-bottom: 3px double #D92323;
            margin-bottom: 24pt;
            padding-bottom: 12pt;
          }
          .title-text {
            font-size: 18pt;
            font-weight: bold;
            color: #D92323;
            font-family: 'Arial Black', sans-serif;
            text-transform: uppercase;
          }
          .meta-text {
            font-size: 9pt;
            color: #555555;
            font-family: 'Courier New', monospace;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <div class="title-text">🌟 UA HIGH ACADEMY: HERO DIRECTIVE</div>
              <div class="meta-text">SERIAL REFERENCE: SOP-${Date.now().toString().slice(-6)} | DATE: ${new Date().toLocaleDateString()}</div>
            </td>
          </tr>
        </table>
        
        <h2 style="font-size: 15pt; color: #0F172A; font-family: 'Arial', sans-serif; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 16px;">
          SUBJECT: ${docTitle.toUpperCase()}
        </h2>

        <div>
          ${formattedParagraphs}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + htmlDoc], { type: "application/msword;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${docTitle.toLowerCase().replace(/\s+/g, "_")}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. High-fidelity Vector PDF (Using a beautiful dedicated printable document window)
  const handlePrintPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setPopupError("Please allow popups in your browser to generate and print your document! Alternatively, copy the raw code or download the Word document.");
      return;
    }

    const formattedParagraphs = docContent
      .split("\n\n")
      .map(p => {
        const boldified = p.replace(/\*\*([\s\S]*?)\*\*/g, "<strong style='color:#0F172A; font-weight:800;'>$1</strong>");
        return `<p style="margin-bottom: 14px; text-align: justify; line-height: 1.6; font-size: 15px; color: #1E293B;">${boldified}</p>`;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Document - ${docTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;900&family=Inter:wght@400;500;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background-color: #ffffff;
            color: #1e293b;
            margin: 0;
            padding: 40px;
          }
          .document-container {
            max-width: 800px;
            margin: 0 auto;
            border: 4px solid #000;
            padding: 40px;
            background-color: #fff;
            position: relative;
            box-shadow: 8px 8px 0px #000;
          }
          .gold-rim {
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            bottom: 5px;
            border: 1px solid #eab308;
            pointer-events: none;
          }
          .letterhead {
            border-bottom: 4px solid #ef4444;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .lh-left h1 {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 900;
            font-size: 26px;
            color: #ef4444;
            margin: 0;
            text-transform: uppercase;
          }
          .lh-right {
            text-align: right;
            font-family: monospace;
            font-size: 10px;
            color: #64748b;
          }
          .subject-line {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 900;
            font-size: 18px;
            color: #0f172a;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 24px;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="document-container">
          <div class="gold-rim"></div>
          <div class="letterhead">
            <div class="lh-left">
              <h1>🌟 UA HIGH ACADEMY</h1>
            </div>
            <div class="lh-right">
              <div>DATE: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div class="subject-line">
            SUBJECT: ${docTitle}
          </div>
          <div class="doc-content">
            ${formattedParagraphs}
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSave = () => {
    if (onSaveDocument) {
      onSaveDocument(docContent);
    }
    setIsEditing(false);
    setIframeKey(prev => prev + 1); // Trigger refresh of iframe previews
  };

  // Helper to render beautiful line numbers for code blocks
  const renderCodeWithLineNumbers = () => {
    const lines = docContent.split("\n");
    return (
      <div className="flex-1 font-mono text-xs md:text-sm bg-[#090d16] text-slate-300 overflow-auto p-4 rounded-xl border border-slate-800 shadow-inner custom-scroll select-text h-full flex">
        {/* Line Numbers */}
        <div className="text-slate-600 text-right pr-4 border-r border-slate-800/80 mr-4 select-none min-w-[2.5rem]">
          {lines.map((_, i) => (
            <div key={i} className="leading-relaxed py-0.5">{i + 1}</div>
          ))}
        </div>
        {/* Raw Code lines */}
        <div className="flex-1 overflow-x-auto whitespace-pre leading-relaxed py-0.5">
          {lines.map((line, i) => (
            <div key={i} className="hover:bg-slate-900/40 rounded px-1 transition-colors">{line || " "}</div>
          ))}
        </div>
      </div>
    );
  };

  // Rendering beautiful markdown parsing inline
  const renderMarkdownPreview = () => {
    const paragraphs = docContent.split("\n\n");
    return (
      <div className="space-y-4 font-sans text-slate-800 leading-relaxed text-sm md:text-base">
        {paragraphs.map((para, paraIdx) => {
          const trimmed = para.trim();
          if (trimmed.startsWith("# ")) {
            return (
              <h1 key={paraIdx} className="font-display font-black text-xl md:text-2xl text-slate-950 border-b-2 border-slate-300 pb-1 mt-6">
                {trimmed.replace("# ", "")}
              </h1>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h2 key={paraIdx} className="font-display font-black text-lg md:text-xl text-slate-900 border-b border-slate-200 pb-1 mt-4">
                {trimmed.replace("## ", "")}
              </h2>
            );
          }
          if (trimmed.startsWith("### ")) {
            return (
              <h3 key={paraIdx} className="font-display font-extrabold text-base text-slate-900 mt-3">
                {trimmed.replace("### ", "")}
              </h3>
            );
          }
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            const listItems = trimmed.split(/\n[-*]\s+/);
            return (
              <ul key={paraIdx} className="list-disc list-inside space-y-1.5 pl-4">
                {listItems.map((item, itemIdx) => {
                  const cleanedItem = item.replace(/^[-*]\s+/, "");
                  if (!cleanedItem.trim()) return null;
                  return (
                    <li key={itemIdx}>
                      {cleanedItem.split(/\*\*([\s\S]*?)\*\*/g).map((part, partIdx) => {
                        if (partIdx % 2 === 1) return <strong key={partIdx} className="font-bold text-slate-950">{part}</strong>;
                        return part;
                      })}
                    </li>
                  );
                })}
              </ul>
            );
          }
          
          // Regular paragraph parsing bold highlights
          const parts = para.split(/\*\*([\s\S]*?)\*\*/g);
          return (
            <p key={paraIdx} className="text-justify leading-relaxed">
              {parts.map((part, partIdx) => {
                if (partIdx % 2 === 1) {
                  return (
                    <strong key={partIdx} className="text-slate-950 font-black">
                      {part}
                    </strong>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 24, stiffness: 150 }}
      className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[720px] h-full bg-[#0a0f1d] border-l-4 border-hero-gold z-40 flex flex-col shadow-[-15px_0px_40px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      {/* Sidebar Header Panel */}
      <div className="p-4 bg-slate-900/95 border-b-2 border-hero-gold/30 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-hero-gold/15 border border-hero-gold/50 rounded-lg text-hero-gold flex items-center justify-center animate-pulse">
            {detectedLang === "html" || detectedLang === "svg" ? (
              <Code2 className="w-5 h-5" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-display font-black text-xs md:text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Claude Artifact Workspace</span>
              <span className="text-[9px] bg-hero-crimson/20 border border-hero-crimson/50 text-hero-crimson px-1.5 py-0.5 rounded font-mono font-bold tracking-normal uppercase">
                {detectedLang}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Dual Preview & Interactive Sandbox Compiler</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-hero-dark border border-slate-700 text-slate-400 hover:text-white hover:border-hero-gold transition-all cursor-pointer"
          title="Close Workspace"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Claude-style dual tabs selection bar */}
      <div className="px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 flex-shrink-0 select-none">
        {/* Dual Mode Tabs Selection (Preview & Code) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setActiveTab("preview"); setIsEditing(false); }}
            className={`px-4 py-3 font-display font-black uppercase text-xs tracking-wider flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === "preview" 
                ? "text-hero-gold border-hero-gold bg-slate-900/20" 
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-3 font-display font-black uppercase text-xs tracking-wider flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === "code" 
                ? "text-hero-gold border-hero-gold bg-slate-900/20" 
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
        </div>

        {/* Live Reload and Action triggers */}
        <div className="flex items-center gap-1">
          {activeTab === "preview" && (detectedLang === "html" || detectedLang === "svg") && (
            <button
              onClick={() => setIframeKey(k => k + 1)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all mr-1.5"
              title="Force Refresh Live Preview Sandbox"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            </button>
          )}

          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 border border-black text-xs font-display font-black uppercase text-white flex items-center gap-1 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              title="Save document changes"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Code</span>
            </button>
          ) : (
            <button
              onClick={() => { setIsEditing(true); setActiveTab("code"); }}
              className="px-3 py-1.5 rounded-lg bg-hero-dark hover:bg-slate-800 border border-slate-750 text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-all"
              title="Modify Code/Content Directly"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Code</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Title Input Area */}
      <div className="px-5 py-3 bg-[#0d1324] border-b border-slate-800 flex items-center gap-3">
        <label className="text-[9px] font-display font-black text-hero-gold uppercase tracking-widest flex-shrink-0 select-none">
          Artifact Name:
        </label>
        <input
          type="text"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          className="flex-1 text-xs font-mono font-bold text-slate-200 bg-transparent border-b border-dashed border-slate-700/80 focus:border-hero-gold outline-none pb-0.5"
          placeholder="blueprint_artifact.html"
        />
      </div>

      {/* Popups Blocked Alert/Warning Banner */}
      {popupError && (
        <div className="px-5 py-2.5 bg-hero-crimson/15 border-b border-hero-crimson/35 flex items-center justify-between gap-3 text-xs text-red-200 font-medium select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-hero-crimson animate-ping shrink-0" />
            <p className="leading-normal">{popupError}</p>
          </div>
          <button 
            onClick={() => setPopupError(null)} 
            className="text-[10px] font-bold uppercase text-hero-crimson hover:text-white underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sandbox Workspace Body Panel */}
      <div className="flex-1 overflow-y-auto p-5 custom-scroll bg-slate-950 flex flex-col h-full">
        {isEditing ? (
          /* High contrast interactive source code editor tab */
          <div className="flex-1 flex flex-col h-full">
            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="flex-1 w-full bg-[#070b14] text-emerald-400 border-2 border-hero-gold/40 focus:border-hero-gold rounded-xl p-4 font-mono text-xs md:text-sm outline-none resize-none custom-scroll shadow-inner leading-relaxed min-h-[400px]"
              placeholder="Paste or write your HTML/CSS/JS/Markdown code content here..."
            />
            <p className="text-[10px] text-slate-500 font-mono mt-2 text-right">
              * Interactive changes instantly update the live sandbox "Preview" tab.
            </p>
          </div>
        ) : activeTab === "code" ? (
          /* Beautiful monospaced line-numbered static viewer */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {renderCodeWithLineNumbers()}
          </div>
        ) : (
          /* Tab Preview Area */
          <div className="flex-1 flex flex-col h-full">
            {/* HTML sandboxed live preview render */}
            {detectedLang === "html" ? (
              <div className="flex-1 flex flex-col h-full bg-white rounded-xl border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
                <div className="bg-slate-100 px-4 py-2 border-b-2 border-black flex items-center justify-between text-xs font-mono text-slate-600 select-none">
                  <span className="flex items-center gap-1.5">
                    <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    Interactive Sandboxed Environment
                  </span>
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300">
                    all-might-iframe
                  </span>
                </div>
                <iframe
                  key={iframeKey}
                  title="Claude Live Sandbox"
                  srcDoc={docContent}
                  sandbox="allow-scripts"
                  className="w-full flex-1 border-none bg-white"
                />
              </div>
            ) : detectedLang === "svg" ? (
              /* High contrast vector rendering canvas with checkered alpha background */
              <div className="flex-1 flex flex-col h-full rounded-xl border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative bg-white">
                <div className="bg-slate-100 px-4 py-2 border-b-2 border-black flex items-center justify-between text-xs font-mono text-slate-600 select-none">
                  <span>Rendered SVG Canvas</span>
                  <span className="text-[9px] bg-slate-200 px-1 py-0.5 rounded border border-slate-300">
                    VECTOR
                  </span>
                </div>
                <div 
                  className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: docContent }}
                />
              </div>
            ) : detectedLang === "markdown" ? (
              /* Render visual Markdown compiled page */
              <div className="relative bg-white p-6 md:p-8 rounded-xl border-3 border-black text-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left min-h-[450px]">
                {renderMarkdownPreview()}
              </div>
            ) : (
              /* Fallback to UA High School official document paper-sheet */
              <div className="relative bg-amber-50/98 p-6 md:p-8 rounded-xl border-3 border-black text-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left min-h-[450px] font-sans selection:bg-hero-gold selection:text-hero-dark animate-fadeIn">
                <div className="border-b-4 border-hero-crimson pb-3 mb-5 flex justify-between items-end select-none">
                  <div>
                    <h1 className="font-display font-black text-sm md:text-base text-hero-crimson uppercase tracking-tighter flex items-center gap-1">
                      🌟 UA HIGH ACADEMY
                    </h1>
                    <p className="text-[9px] text-hero-gold-bright font-black uppercase tracking-widest">
                      OFFICIAL HEROIC TRAINING SYSTEM REPORT
                    </p>
                  </div>
                  <div className="text-right font-mono text-[8px] text-slate-500">
                    <div>REF: SOP-${Date.now().toString().slice(-6)}</div>
                    <div>DATE: {new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                <h2 className="font-display font-black text-xs md:text-sm text-slate-950 uppercase border-b-2 border-slate-300 pb-1.5 mb-4 tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-hero-gold" />
                  <span>SUBJECT: {docTitle}</span>
                </h2>

                <div className="space-y-3 font-sans font-medium text-xs md:text-sm text-slate-800 leading-relaxed max-w-full overflow-hidden break-words">
                  {docContent.split("\n\n").map((para, paraIdx) => {
                    const parts = para.split(/\*\*([\s\S]*?)\*\*/g);
                    return (
                      <p key={paraIdx} className="text-justify">
                        {parts.map((part, partIdx) => {
                          if (partIdx % 2 === 1) {
                            return <strong key={partIdx} className="text-slate-950 font-black">{part}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
                </div>

                <div className="border-t-2 border-dashed border-slate-300 pt-5 mt-10 flex justify-between items-center flex-wrap gap-4 select-none">
                  <div>
                    <div className="w-32 border-b border-slate-800 mb-1"></div>
                    <div className="text-[10px] text-slate-950 font-black uppercase">Yagi Toshinori</div>
                    <div className="text-[8px] text-slate-500 font-mono">Symbol of Peace, All Might</div>
                  </div>
                  <div className="border-4 border-double border-hero-crimson text-hero-crimson font-display font-black text-[9px] px-2 py-1 rotate-[-4deg] rounded shadow-sm">
                    🔥 PLUS ULTRA APPROVED
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom control toolbelt (Download, Print, Copy) */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
            isCopied 
              ? "bg-green-950/45 border-green-500 text-green-400"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{isCopied ? "Copied raw content!" : "Copy Raw Content"}</span>
        </button>

        {/* Exports Dropdown list */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadWord}
            className="p-2 rounded-lg bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Export standard Word .doc"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">MS Word</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="p-2 rounded-lg bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Print or export sharp PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">PDF document</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="p-2 rounded-lg bg-hero-gold/10 hover:bg-hero-gold border border-hero-gold/30 text-hero-gold hover:text-hero-dark transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Download formatted Markdown .md"
          >
            <FileCode className="w-4 h-4" />
            <span className="hidden sm:inline">Markdown</span>
          </button>

          <button
            onClick={handleDownloadText}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Download Plain Text .txt"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Raw TXT</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
