import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Model will be initialized dynamically to support Vercel serverless runtime
function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment variables");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
}

const SYSTEM_PROMPT = `
You are an AI assistant for a logistics company. Your task is to extract structured delivery information from text, image, or audio descriptions provided by merchants.
Extract the following fields and return ONLY a valid JSON object:
{
  "customer_name": string or literal null,
  "customer_phone": string or literal null,
  "delivery_address": string or literal null,
  "pincode": string or literal null,
  "product_name": string or literal null,
  "is_cod": boolean,
  "cod_amount": number or literal null,
  "weight_kg": number or literal null (default to 1)
}
IMPORTANT: If a field is missing, you MUST return the literal value null, NOT the string "null". Do not make up fake names or phones if they are missing in the prompt.
If COD is mentioned, is_cod is true and extract the amount. Otherwise false and null.
`;

export async function parseDeliveryDetails(text: string, merchantProducts: string = "") {
  try {
    const model = getModel();
    const promptWithProducts = SYSTEM_PROMPT + `\n\nMerchant's Saved Products Catalog:\n${merchantProducts}\nIf the item matches one of these products, use its weight.`;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptWithProducts + "\n\n" + text }] }],
    });
    const responseText = result.response.text();
    return responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error("Gemini API Error (Text):", error);
    throw new Error("Failed to parse text via Gemini API.");
  }
}

export async function parseImageDetails(base64Image: string, merchantProducts: string = "") {
  try {
    const model = getModel();
    const promptWithProducts = SYSTEM_PROMPT + `\n\nMerchant's Saved Products Catalog:\n${merchantProducts}\nIf the item matches one of these products, use its weight.`;
    const result = await model.generateContent({
      contents: [
        { 
          role: "user", 
          parts: [
            { text: promptWithProducts + "\n\nExtract the delivery details from this screenshot." },
            { 
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ]
    });
    const responseText = result.response.text();
    return responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error("Gemini API Error (Image):", error);
    throw new Error("Failed to parse image via Gemini API.");
  }
}

export async function parseAudioDetails(audioFilePath: string, merchantProducts: string = "") {
  try {
    const model = getModel();
    // Read the audio file directly as base64
    const audioData = fs.readFileSync(audioFilePath).toString("base64");
    const promptWithProducts = SYSTEM_PROMPT + `\n\nMerchant's Saved Products Catalog:\n${merchantProducts}\nIf the item matches one of these products, use its weight.`;
    
    // Gemini 1.5 can process audio directly without needing Whisper!
    const result = await model.generateContent({
      contents: [
        { 
          role: "user", 
          parts: [
            { text: promptWithProducts + "\n\nListen to this voice note and extract the delivery details." },
            { 
              inlineData: {
                mimeType: "audio/ogg", // WhatsApp saves voice notes in ogg format
                data: audioData
              }
            }
          ]
        }
      ]
    });
    
    const responseText = result.response.text();
    return responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error("Gemini API Error (Audio):", error);
    throw new Error("Failed to parse audio via Gemini API.");
  }
}
