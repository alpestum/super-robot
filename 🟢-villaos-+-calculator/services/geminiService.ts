
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import { AIResponseCriteria, Villa } from "../types";

const API_KEY = process.env.API_KEY;

export const getFilteredCriteriaFromAI = async (userQuery: string): Promise<AIResponseCriteria> => {
  if (!API_KEY) {
    console.error("API_KEY for Gemini is not configured for AI Search.");
    throw new Error("AI search is currently unavailable. Administrator: Please configure the API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `You are an intelligent property search assistant for a platform listing villas FOR SALE. Analyze the following user description of a desired villa and extract relevant filtering criteria. Prices can range from 100,000s to several millions in USD.
User description: "${userQuery}"

Respond strictly in JSON format with the following possible keys:
- "priceMin": number (e.g., 500000 for $500k)
- "priceMax": number (e.g., 2000000 for $2M)
- "bedroomsMin": number (e.g., 3)
- "contractType": string (e.g., "Leasehold", "Freehold")
- "propertyType": string (e.g., "Off plan", "Ready villa")
- "locationKeywords": array of strings for district, district area, or general location characteristics (e.g., ["beachfront", "quiet neighborhood", "Ubud", "Pererenan"])
- "amenityKeywords": array of strings for desired features or amenities (e.g., ["private pool", "ocean view", "gym", "modern kitchen"])
- "descriptionKeywords": array of strings for general search terms in villa description, overall characteristics, or specific reference codes if provided by the user (e.g., ["contemporary architecture", "family home", "investment property", "newly renovated", "KES123"]).

If a specific criterion is not mentioned or cannot be reliably extracted, omit the key from the JSON or set its value to null.
Do not include any explanations, conversational text, or markdown formatting outside the main JSON object.
Example of a valid JSON response:
{
  "priceMax": 1500000,
  "bedroomsMin": 2,
  "contractType": "Leasehold",
  "locationKeywords": ["Seminyak"],
  "descriptionKeywords": ["good for investment", "rooftop terrace"]
}
Another example for a query "quiet 3 bedroom off-plan villa under 1M USD in Canggu with reference KES456":
{
  "priceMax": 1000000,
  "bedroomsMin": 3,
  "propertyType": "Off plan",
  "locationKeywords": ["quiet", "Canggu"],
  "descriptionKeywords": ["KES456"]
}
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json", 
            temperature: 0.2, 
        }
    });

    let jsonStr = response.text.trim();
    
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      // Ensure types are somewhat reasonable if AI returns numbers as strings for enum-like fields
      if (parsedData.contractType && typeof parsedData.contractType !== 'string') {
        parsedData.contractType = String(parsedData.contractType);
      }
      if (parsedData.propertyType && typeof parsedData.propertyType !== 'string') {
        parsedData.propertyType = String(parsedData.propertyType);
      }
      return parsedData as AIResponseCriteria;
    } catch (e) {
      console.error("Failed to parse JSON response from AI for criteria:", e, "Raw response:", jsonStr);
      throw new Error("AI could not understand the request or returned an invalid format for criteria. Try rephrasing your query.");
    }

  } catch (error) {
    console.error('Error calling Gemini API for criteria:', error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("AI search failed: Invalid API Key. Administrator: Please check the configuration.");
    }
    throw new Error('AI search request failed. Please try again later.');
  }
};


export const getInvestmentProfileSummary = async (villa: Villa): Promise<string> => {
  if (!API_KEY) {
    throw new Error("AI analysis is currently unavailable. Administrator: Please configure the API_KEY.");
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
You are an expert real estate investment analyst specializing in the Bali market.
Analyze the following villa profile and provide a concise, qualitative "Investment Profile" summary.
Focus on the villa's strengths, weaknesses, and overall investment potential.
The summary should be easy to read for a potential buyer. Use Markdown for formatting (e.g. **bold text** for emphasis).
Do not just repeat the raw data; interpret it.

Villa Data:
- Name/Reference: ${villa.name} / ${villa.id}
- Price (USD): ${villa.price.toLocaleString()}
- Location: ${villa.district}, ${villa.districtArea}
- Property Type: ${villa.propertyType}
- Contract Type: ${villa.contractType}
- Bedrooms: ${villa.bedrooms}
- Building Size: ${villa.buildingSizeM2 ? `${villa.buildingSizeM2} m²` : 'N/A'}
- Land Size: ${villa.landSizeM2 ? `${villa.landSizeM2} m²` : 'N/A'}
- Stated ROI: ${villa.percentROI ? `${(villa.percentROI > 1 ? villa.percentROI : villa.percentROI * 100).toFixed(1)}%` : 'N/A'}
- Leasehold Length: ${villa.contractType === 'Leasehold' ? `${villa.leaseholdYears || 'N/A'} years` : 'N/A'}
- Description: ${villa.additionalDetails}

Example of a good summary:
"**A strong candidate for rental investment**, this modern villa in the high-demand area of Pererenan boasts an attractive ROI. Its contemporary architecture and private pool are highly sought-after features. The leasehold term is standard for the area, offering solid long-term value. While the price is slightly above the district average, its unique features and strong rental potential justify the premium."

Your summary for the provided villa:
`;

  try {
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: prompt,
        config: {
            temperature: 0.5,
        }
    });

    return response.text;

  } catch (error) {
     console.error('Error calling Gemini API for investment summary:', error);
     if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("AI analysis failed: Invalid API Key. Administrator: Please check the configuration.");
    }
    throw new Error('AI analysis request failed. Please try again later.');
  }
};
