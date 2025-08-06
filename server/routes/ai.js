const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Initialize Gemini AI
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Analyze code with Gemini AI
router.post("/analyze-code", authMiddleware, async (req, res) => {
  try {
    const { fileContent, fileName } = req.body;

    if (!fileContent) {
      return res.status(400).json({ message: "File content is required" });
    }

    if (!process.env.GEMINI_API_KEY || !genAI) {
      return res.status(500).json({ message: "Gemini API key not configured" });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a GitHub code analyzer. Help a developer understand and improve this file: "${fileName}". 

Provide:

1. What does this code do? (simple terms)
2. Key functions/classes and what they do
3. Is this code clean and maintainable?
4. Any bugs, smells, or bad practices?
5. Suggestions for improvement
6. Libraries or frameworks used

Only respond with concise, helpful bullet points.

Code:
\`\`\`
${fileContent}
\`\`\``;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    res.json({
      analysis,
      fileName,
      timestamp: new Date().toISOString(),
      model: "gemini-1.5-flash",
    });
  } catch (error) {
    console.error("Gemini AI analysis error:", error);
    res.status(500).json({
      message: "Failed to analyze code with AI",
      error: error.message,
    });
  }
});

// Get AI model status
router.get("/status", authMiddleware, (req, res) => {
  res.json({
    aiEnabled: !!genAI,
    model: "gemini-1.5-flash",
    provider: "Google Gemini",
  });
});

module.exports = router;
