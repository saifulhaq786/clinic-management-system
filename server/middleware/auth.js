const jwt = require('jsonwebtoken');

// Use same secret as auth routes
const SECRET = process.env.JWT_SECRET || "elite_clinic_super_secret_key_2026";

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Extract and forcefully clean the token of any accidental quotes or spaces
  let extractedToken = authHeader.split(' ')[1];
  extractedToken = extractedToken.replace(/['"]+/g, '').trim();

  if (!extractedToken || extractedToken === "null" || extractedToken === "undefined") {
    return res.status(401).json({ message: "Dead token" });
  }

  try {
    const decoded = jwt.verify(extractedToken, SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    // This will now print exactly what garbage the frontend is trying to send
    console.log("❌ Auth Error:", err.message, "| Received:", extractedToken.substring(0, 20) + "...");
    res.status(401).json({ message: "Token Verification Failed" });
  }
};