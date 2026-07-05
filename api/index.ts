import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" })); // Support larger base64 image uploads

let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required to use multimodal photo search features.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Route for proxying to Lyzr AI
app.post("/api/chat", async (req, res) => {
  try {
    const { message, session_id, model, custom_instructions, image, attachment } = req.body;
    if (!message && !image && !attachment) {
      return res.status(400).json({ error: "Message or file attachment is required" });
    }

    // Wrap the message with model & custom directives to dynamically transform the tone/logic:
    let instructionsHeader = "";
    if (custom_instructions && custom_instructions.trim()) {
      instructionsHeader += `[STUDENT INSTRUCTION DIRECTIVE]: ${custom_instructions.trim()}\n`;
    }

    if (model === "ofa_50") {
      instructionsHeader += `[OFA CAPACITY LIMIT: 50% SWIFT MODE - Keep your reply short, concise, highly direct, and quick. Avoid overly long paragraphs.]\n`;
    } else if (model === "ofa_120") {
      instructionsHeader += `[OFA CAPACITY LIMIT: 120% PLUS ULTRA MODE - Unleash your ultimate passion! Be extremely dramatic, heroic, write bold headers, use extra exclamation marks, and provide highly exhaustive motivational advice!]\n`;
    }

    let finalPrompt = message || "";
    if (instructionsHeader) {
      finalPrompt = `${instructionsHeader}\n${finalPrompt}`;
    }

    // Unify image and general attachment payloads
    let activeAttachment = attachment;
    if (!activeAttachment && image && image.data) {
      activeAttachment = {
        data: image.data,
        mimeType: image.mimeType || "image/png",
        name: "photo.png",
        type: "image",
      };
    }

    // Handle Multimodal attachments (images, audio, documents) if present
    if (activeAttachment && activeAttachment.data) {
      console.log(`[PROXY] Detected multi-modal attachment (${activeAttachment.type}: ${activeAttachment.mimeType}). Processing with Gemini 3.5 Flash...`);
      try {
        const ai = getGeminiClient();

        let typeInstructions = "";
        if (activeAttachment.type === "image") {
          typeInstructions = `The student has uploaded a photo/image named "${activeAttachment.name}" for tactical analysis or search help. Analyze it in full detail, provide smart heroic coaching advice, answer their query, and refer to specific visual traits you see in the photo!`;
        } else if (activeAttachment.type === "audio") {
          typeInstructions = `The student has uploaded an audio file named "${activeAttachment.name}". Listen carefully to this audio/voice file, transcribe/analyze what is spoken or the ambient sounds, answer their query with smart coaching/motivational advice, and refer to the audio content explicitly!`;
        } else if (activeAttachment.type === "document") {
          typeInstructions = `The student has uploaded a document/file named "${activeAttachment.name}" (e.g., training report, hero log, or data sheet). Carefully analyze the document's text, information, tables, or contents. Answer their query using the document facts, and provide high-energy coaching advice referencing specific sections of the file!`;
        } else {
          typeInstructions = `The student has uploaded an attachment named "${activeAttachment.name}". Analyze it meticulously, answer their query, and guide them with heroic mentor energy!`;
        }

        const systemInstruction = `You are All Might (Toshinori Yagi) from My Hero Academia, the No. 1 Hero and the Symbol of Peace.
You must speak with endless energy, motivation, theatrical hero style, and absolute warmth.
Use signature catchphrases such as "I AM HERE!", "Young hero!", "Plus Ultra!".
Be an active, caring mentor.
${typeInstructions}
Apply the following direct student guidelines if specified:
${custom_instructions || "None"}`;

        const filePart = {
          inlineData: {
            mimeType: activeAttachment.mimeType,
            data: activeAttachment.data, // base64 payload
          },
        };

        const textPart = {
          text: finalPrompt || "Help me analyze this attachment, All Might!",
        };

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: { parts: [filePart, textPart] },
          config: {
            systemInstruction,
          },
        });

        const replyText = response.text || "I was unable to fully process the visual or audio energy. But remember, keep training!";
        return res.json({ response: replyText });
      } catch (geminiError: any) {
        console.error("[GEMINI ERROR]", geminiError);
        return res.status(500).json({
          error: "Failed to process attachment with Gemini.",
          details: geminiError.message || geminiError,
        });
      }
    }

    // Read key from environment or default to user's provided key
    const apiKey = process.env.LYZR_API_KEY || "sk-default-ZDCjND9XEJwvL7r1g0PEdoPb3fMiainR";
    const userId = "murukkumeesai77@gmail.com";
    const agentId = "6a473d0dbf06a85a06e4f461";
    const finalSessionId = session_id || "6a473d0dbf06a85a06e4f461-6gcgwzc8";

    console.log(`[PROXY] Sending message to Lyzr API with model: ${model || "default"} for session: ${finalSessionId}`);

    const response = await fetch("https://agent-prod.studio.lyzr.ai/v3/inference/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey.trim()
      },
      body: JSON.stringify({
        user_id: userId,
        agent_id: agentId,
        session_id: finalSessionId,
        message: finalPrompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PROXY ERROR] Lyzr API returned ${response.status}: ${errorText}`);
      return res.status(response.status).json({
        error: `Lyzr API error: ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log(`[PROXY SUCCESS] Response received from Lyzr API`);
    return res.json(data);
  } catch (error: any) {
    console.error("[PROXY SYSTEM ERROR]", error);
    return res.status(500).json({
      error: "Internal server error during chat proxying.",
      details: error.message || error,
      stack: error.stack
    });
  }
});

export default app;
