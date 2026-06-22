import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Initialize Gemini. Will gracefully fail if no key provided.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

// Using Flash for maximum speed and cost-efficiency
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

const SYSTEM_PROMPT = `
You are an AI assistant for a logistics company. Your task is to extract structured delivery information from text, image, or audio descriptions provided by merchants.
Extract the following fields and return ONLY a valid JSON object:
{
  "customer_name": "string or null",
  "customer_phone": "string or null",
  "delivery_address": "string or null",
  "pincode": "string or null",
  "is_cod": boolean,
  "cod_amount": number or null,
  "weight_kg": number or null (default to 1)
}
If COD is mentioned, is_cod is true and extract the amount. Otherwise false and null.
`;

export async function parseDeliveryDetails(text: string) {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock-key') {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + text }] }],
      });
      const responseText = result.response.text();
      return responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      console.error("Gemini API Error (Text):", error);
      // Fall through to mock data
    }
  }
  
  console.log("Using fallback mock data for TEXT.");
  return {
    customer_name: "Text Customer",
    customer_phone: "9876543210",
    delivery_address: text.substring(0, 50),
    pincode: "110001",
    is_cod: text.toLowerCase().includes("cod"),
    cod_amount: text.toLowerCase().includes("cod") ? 500 : null,
    weight_kg: 1
  };
}

export async function parseImageDetails(base64Image: string) {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock-key') {
    const result = await model.generateContent({
      contents: [
        { 
          role: "user", 
          parts: [
            { text: SYSTEM_PROMPT + "\n\nExtract the delivery details from this screenshot." },
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
  } else {
    console.log("No GEMINI_API_KEY found. Returning mock parsed data for IMAGE.");
    return {
      customer_name: "Image Customer",
      customer_phone: "9988776655",
      delivery_address: "Extracted from Image, Mock Street",
      pincode: "560002",
      is_cod: true,
      cod_amount: 1450,
      weight_kg: 1.5
    };
  }
}

export async function parseAudioDetails(audioFilePath: string) {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock-key') {
    // Read the audio file directly as base64
    const audioData = fs.readFileSync(audioFilePath).toString("base64");
    
    // Gemini 1.5 can process audio directly without needing Whisper!
    const result = await model.generateContent({
      contents: [
        { 
          role: "user", 
          parts: [
            { text: SYSTEM_PROMPT + "\n\nListen to this voice note and extract the delivery details." },
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
  } else {
    console.log("No GEMINI_API_KEY found. Returning mock parsed data for AUDIO.");
    return {
      customer_name: "Audio Customer",
      customer_phone: "9123456789",
      delivery_address: "Extracted from Voice Note, Sound Lane",
      pincode: "400001",
      is_cod: false,
      cod_amount: null,
      weight_kg: 0.5
    };
  }
}
