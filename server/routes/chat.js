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

    // Check if Gemini API key exists
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      return res.json({ 
        response: "System Notice: I am disconnected from my AI Network. To enable real intelligent responses, please add your `GEMINI_API_KEY` to the Elite Clinic backend server `.env` file and restart." 
      });
    }

    // Use Google Gemini for real AI responses
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are a helpful, professional medical AI assistant named Elite Clinic AI. 
Provide accurate, general medical information and health advice. 
Always remind users to consult with human healthcare professionals for serious conditions. 
Be empathetic, exceptionally clear, and provide evidence-based information.
Do not provide definitive medical diagnoses or prescribe medications - refer to doctors for that.

User Query: ${query}`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();

    res.json({ response });

  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Error processing your query across the AI network. Please try again." });
  }
});

module.exports = router;
