const router = require('express').Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// @route   POST api/chat/medical
// @desc    Get real medical AI response using Gemini
// @access  Private
router.post('/medical', auth, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Query cannot be empty" });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    
    // Diagnostic: Check for standard API key format
    if (geminiKey && !geminiKey.startsWith('AIza')) {
      return res.json({ 
        response: "⚠️ SYSTEM NOTICE: The current Gemini API Key format appears to be a temporary token rather than a permanent API Key. Please ensure your key in .env starts with 'AIzaSy' otherwise medical queries will fail." 
      });
    }

    if (!geminiKey) {
      return res.json({ 
        response: "System Notice: I am disconnected from my AI Network. To enable real intelligent responses, please add your `GEMINI_API_KEY` to the Elite Clinic backend server `.env` file and restart." 
      });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    
    // Fallback logic: Try 1.5-flash first, then regular Pro
    const tryModels = ["gemini-1.5-flash", "gemini-pro"];
    let responseText = "";
    let lastError = null;

    for (const modelName of tryModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(`System Prompt: You are Elite Clinic AI. Use professional medical tone. Remind users to consult doctors.
        User Query: ${query}`);
        responseText = result.response.text();
        if (responseText) break; 
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed, trying next...`);
        continue;
      }
    }

    if (!responseText && lastError) throw lastError;

    res.json({ response: responseText });

  } catch (err) {
    console.error("Chat Error:", err);
    
    // Specific check for expired/invalid keys to guide the user
    if (err.message?.includes('expired') || err.message?.includes('API_KEY_INVALID') || err.status === 400) {
      return res.json({ 
        response: "❌ YOUR API KEY HAS EXPIRED: The provided Gemini key is no longer valid. Please visit https://aistudio.google.com/app/apikey to generate a new key and update your .env file." 
      });
    }

    res.status(500).json({ error: "Error processing your query across the AI network. If this persists, please verify your API key in the server logs." });
  }
});

module.exports = router;
