import { GoogleGenAI } from "@google/genai";
import { ProcessingOptions } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generate3DView = async (
  imageBase64: string,
  mimeType: string,
  options: ProcessingOptions
): Promise<string> => {
  try {
    const stylePrompt = options.style === 'isometric' 
      ? "isometric 3D view, 45-degree angle" 
      : "direct top-down 3D view with depth";

    const colorPrompt = options.colorScheme === 'vibrant'
      ? "Use distinct, high-contrast colors for different zones (e.g., Green for Golf/Yoga, Blue for WC, Orange for Lounge)."
      : options.colorScheme === 'pastel'
      ? "Use soft, pleasing pastel colors to distinguish zones (Soft Sage for Golf, Pale Blue for WC, Cream for Lounge)."
      : "Use a clean blueprint style with blue walls and white floors, but highlight functional areas in subtle distinct colors.";

    const prompt = `
      Transform this 2D architectural floor plan into a ${stylePrompt}.
      
      Requirements:
      1. Extrude the walls to show 3D depth.
      2. Render the floor materials clearly (wood, tile, carpet).
      3. ${colorPrompt}
      4. Maintain the exact layout and proportions of the original image.
      5. The goal is to make it easy to visually distinguish between the functional areas: Golf Practice, Yoga Studio, WC/Lockers, and Lounge/Reception.
      6. High quality, photorealistic architectural rendering.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    // Check for inline data (image) in response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    
    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
      return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data received from Gemini.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
