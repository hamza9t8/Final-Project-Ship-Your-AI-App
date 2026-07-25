# Nexus: B2B Field Sales & Khata App 🚚💼

## 🔗 Live Application
**Live URL:** [Insert your Vercel URL here, e.g., https://nexus-pwa.vercel.app]

---

## 🎯 The Problem & The Solution
**The Problem:** Field salesmen, van distributors, and wholesale reps in emerging markets face a chaotic daily reality. They operate in areas with spotty internet, haggle over 1-to-1 custom pricing with every shop, and manage complex mixed payments (cash + bank transfer + *Khata*/debt) on the fly. Standard corporate CRM apps fail because they require constant cloud connections and rigid pricing tiers.

**The Solution:** Nexus is a True Offline-First Progressive Web App (PWA) built specifically for the field. It acts as a mobile catalog, a smart ledger, and an AI assistant. It allows salesmen to take orders, negotiate prices, instantly calculate outstanding debt, and send WhatsApp receipts—all with zero internet connection. 

---

## 🚀 Features List
*   **True Offline-First Architecture:** Powered by `Dexie.js` (IndexedDB). The app runs at full speed in "Airplane Mode."
*   **1-to-1 Pricing Memory:** The app dynamically remembers the exact custom price negotiated with a specific shop on the last visit, preventing margin leakage and haggling.
*   **Smart Multi-Tender Settlement:** A 3-way split checkout that instantly calculates the remaining *Khata* (Debt) when a shop pays partial cash/bank transfer.
*   **Live Van Inventory:** Deducts stock instantly upon order confirmation so the salesman always knows what's left in the truck.
*   **WhatsApp Instant Invoicing:** Generates a text-based invoice and opens a WhatsApp deep link directly to the shop owner with one tap.
*   **HTML5 Camera Integration:** Instantly capture and store photos of Bank Transfer receipts during checkout.

---

## 🧠 The AI Feature: Voice-to-JSON Order Parser
Field salesmen often have their hands full. Nexus includes a **"Quick AI Order"** feature that allows salesmen to type or dictate natural language notes (e.g., *"Sold 5 cartons of Shoe-X at 100 SAR, he paid 200 cash, put the rest on his Khata"*). 

The app sends this raw note to the **Google Gemini API**, which parses it into a structured JSON order and auto-fills the Smart Cart and Settlement fields.

### AI System Prompt Used:
```text
You are the Nexus Field Sales AI Assistant. Your job is to extract structured B2B sales data, items, and debt collection payments from unstructured natural language voice/text notes dictated by field salesmen.

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
1. Identify the shop name if mentioned.
2. Parse each SKU item, quantity, unit type, and agreed price.
3. Calculate payment totals: 'cash_paid', 'bank_transfer', and remaining 'debt_added'. If unpaid debt is not specified, calculate debt_added = (total order value - cash_paid - bank_transfer).
4. Provide a 1-sentence clean summary note in English.
```
