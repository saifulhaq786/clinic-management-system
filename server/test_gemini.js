require('dotenv').config();
const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
