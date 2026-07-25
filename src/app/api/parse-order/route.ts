import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const note = body.note;
    
    if (!note) {
      return NextResponse.json({ error: 'Note is required' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `You are the Nexus Field Sales AI Assistant. Your job is to extract structured B2B sales data, items, and debt collection payments from unstructured natural language voice/text notes dictated by field salesmen in English, Urdu, or Arabic.

Output MUST be strictly valid JSON matching this exact typescript interface without markdown fences:

{
  "shop_name": string | null,
  "items": Array<{
    "sku_name": string,
    "quantity": number,
    "unit_type": "carton" | "piece",
    "agreed_unit_price": number
  }>,
  "payment": {
    "cash_paid": number,
    "bank_transfer": number,
    "debt_added": number
  },
  "summary_note": string
}

Extraction Rules:
1. Identify the shop name if mentioned (e.g., 'Al-Madina Shoes', 'Star Market').
2. Parse each SKU item, quantity, unit type (default to 'carton' if unspecified), and agreed price per unit in SAR/local currency.
3. Calculate payment totals: 'cash_paid', 'bank_transfer', and remaining 'debt_added'. If unpaid debt is not specified, calculate debt_added = (total order value - cash_paid - bank_transfer).
4. Provide a 1-sentence clean summary note in English.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: note,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error parsing order:", error);
    return NextResponse.json({ error: 'Failed to parse order' }, { status: 500 });
  }
}
