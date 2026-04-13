const router = require('express').Router();
const auth = require('../middleware/auth');

// @route   POST api/chat/medical
// @desc    Get medical AI response to patient queries
// @access  Private
router.post('/medical', auth, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Query cannot be empty" });
    }

    // Check if OpenAI API key exists
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      // Fallback: Return helpful medical information
      const response = getLocalMedicalResponse(query);
      return res.json({ response });
    }

    // Use OpenAI for real AI responses
    const fetch = (await import('node-fetch')).default;
    
    const medicalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful medical AI assistant. Provide accurate, general medical information and health advice. 
Always remind users to consult with healthcare professionals for serious conditions. 
Be empathetic, clear, and provide evidence-based information.
Do not provide diagnoses or prescribe medications - refer to healthcare professionals for that.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await medicalResponse.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const response = data.choices[0].message.content;
    res.json({ response });

  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Error processing your query. Please try again." });
  }
});

// Local medical response (fallback when no API key)
function getLocalMedicalResponse(query) {
  const lowerQuery = query.toLowerCase();

  const responses = {
    'cold|flu|cough|fever': `Common cold and flu are viral infections. Here's what you should do:
• Rest and stay hydrated
• Use over-the-counter pain relievers (follow package directions)
• Gargle with salt water for sore throat
• Use honey to soothe cough
• Seek medical help if fever persists or symptoms worsen

Please consult a doctor if symptoms don't improve in 10 days.`,

    'headache|migraine': `For headaches and migraines:
• Rest in a quiet, dark room
• Apply a cold or warm compress
• Stay hydrated
• Over-the-counter pain relievers may help
• Track triggers to identify patterns

Seek medical attention if headaches are severe, frequent, or accompanied by other symptoms.`,

    'blood pressure|hypertension': `Managing blood pressure:
• Reduce salt intake
• Exercise regularly (150 min/week)
• Reduce stress
• Limit alcohol consumption
• Maintain healthy weight
• Take prescribed medications as directed

Regular monitoring is important. Consult your doctor for personalized advice.`,

    'diabetes|blood sugar': `Diabetes management tips:
• Monitor blood sugar levels regularly
• Eat balanced meals with controlled portions
• Limit sugary drinks and foods
• Exercise daily
• Take medications as prescribed
• Get regular health checkups

Always follow your doctor's treatment plan.`,

    'weight loss|diet': `Healthy weight loss approach:
• Create a calorie deficit (500 cal/day for 1 lb/week loss)
• Eat protein-rich foods
• Include more vegetables and fiber
• Drink plenty of water
• Exercise regularly
• Avoid crash diets

Consult a nutritionist for personalized advice.`,

    'sleep|insomnia': `Improving sleep quality:
• Maintain consistent sleep schedule
• Create a dark, cool bedroom
• Avoid screens 1 hour before bed
• Limit caffeine after 2 PM
• Try relaxation techniques
• Exercise regularly

If insomnia persists, consult a sleep specialist.`,

    'anxiety|stress|depression': `Mental health support:
• Practice deep breathing exercises
• Meditation or mindfulness
• Regular exercise
• Talk to friends or family
• Limit caffeine and alcohol
• Maintain routine

Professional help is important. Consult a mental health professional.`,

    'skin|acne|rash': `For skin issues:
• Keep skin clean and moisturized
• Avoid squeezing or picking
• Use non-comedogenic products
• Stay hydrated
• Wear sunscreen
• Consider dermatologist visit

Some skin conditions need professional evaluation.`
  };

  for (const [key, response] of Object.entries(responses)) {
    const keywords = key.split('|');
    if (keywords.some(k => lowerQuery.includes(k))) {
      return response;
    }
  }

  // Default response
  return `I can help with general medical information about common health topics. Here are some areas I can assist with:
• Common illnesses (cold, flu, cough)
• Chronic conditions (diabetes, hypertension)
• Lifestyle advice (diet, exercise, sleep)
• Mental health tips (stress, anxiety)
• General wellness questions

For serious symptoms or emergencies, please contact a healthcare professional immediately. 🏥

What health topic can I help you with?`;
}

module.exports = router;
