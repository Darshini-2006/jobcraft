const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

async function testKey() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    console.log("Testing API Key with gemini-1.5-flash...");
    const result = await model.generateContent("Hello! Are you working?");
    const response = await result.response;
    const text = response.text();
    console.log("Response:", text);
    console.log("✅ API Key is VALID for gemini-1.5-flash");
  } catch (error) {
    console.error("❌ gemini-1.5-flash Failed:", error.message);
  }

  try {
    const model2 = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("Testing API Key with gemini-2.0-flash...");
    const result2 = await model2.generateContent("Hello! Are you working?");
    const response2 = await result2.response;
    const text2 = response2.text();
    console.log("Response:", text2);
    console.log("✅ API Key is VALID for gemini-2.0-flash");
  } catch (error) {
    console.error("❌ gemini-2.0-flash Failed:", error.message);
  }
}

testKey();
