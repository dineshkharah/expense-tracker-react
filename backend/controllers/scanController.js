const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require("../middleware/asyncHandler");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// Prompt for Gemini
const PROMPT = `You are a receipt/bill parser. Look at the image and extract the transaction details.

Return ONLY a raw JSON object (no markdown, no code fences, no explanation) with exactly these keys:
{
  "amount": number or null,        
  "source": string or null,     
  "category": string or null,  
  "type": "expense" or "income",   
  "date": string or null          
}

Rules:
- If a value is not clearly visible, use null for that field (do not guess wildly).
- "amount" must be the final/grand total, as a plain number (e.g. 249.50).
- "category" should be a single lowercase word or short phrase.
- Default "type" to "expense" unless the document clearly indicates income.
- Dates on the bill are in day-first format (DD/MM/YYYY or DD-MM-YYYY), as is standard in India. For example 09/05/2026 means 9 May 2026, NOT 5 September. Convert the date to "YYYY-MM-DD" output format accordingly.`;

const scanBill = asyncHandler(async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: "Scanning is not configured" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const model = genAI.getGenerativeModel({ model: MODEL });

  const result = await model.generateContent([
    PROMPT,
    {
      inlineData: {
        mimeType: req.file.mimetype,
        data: req.file.buffer.toString("base64"),
      },
    },
  ]);

  let text = result.response.text().trim();

  // Strip markdown code fences if Gemini wrapped the JSON in them
  text = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Gemini response:", text);
    return res
      .status(502)
      .json({ message: "Could not read the bill, please try again" });
  }

  // Sanitize / normalize the fields before sending back
  const amount =
    parsed.amount !== null && parsed.amount !== undefined
      ? parseFloat(parsed.amount)
      : null;

  const data = {
    amount: Number.isFinite(amount) ? amount : null,
    source: typeof parsed.source === "string" ? parsed.source.trim() : null,
    category:
      typeof parsed.category === "string"
        ? parsed.category.trim().toLowerCase()
        : null,
    type: parsed.type === "income" ? "income" : "expense",
    date: typeof parsed.date === "string" ? parsed.date : null,
  };

  res.status(200).json(data);
});

module.exports = { scanBill };
