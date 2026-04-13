require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = mongoose.connection.collection('users');
  
  console.log("📊 Current Indexes:");
  const indexes = await User.getIndexes();
  console.log(JSON.stringify(indexes, null, 2));
  
  console.log("\n📋 Users in DB:");
  const users = await User.find({}).toArray();
  users.forEach(u => console.log(`- ${u.email} (${u.name})`));
  
  console.log(`\nTotal users: ${users.length}`);
  
  // Drop ALL indexes except _id
  console.log("\n🔧 Dropping all indexes...");
  try {
    await User.dropIndexes();
    console.log("✅ All indexes dropped");
  } catch (e) {
    console.log("⚠️  Error dropping indexes:", e.message);
  }
  
  process.exit(0);
}).catch(err => {
  console.error("DB Error:", err);
  process.exit(1);
});
