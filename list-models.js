const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const fs = require('fs');

async function listAllModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("No API Key found!");
    return;
  }

  const endpoints = ['v1', 'v1beta'];
  let output = '';
  
  for (const v of endpoints) {
    output += `--- Listing Models for API Version ${v} ---\n`;
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`);
      const data = await resp.json();
      if (data.models) {
        data.models.forEach(m => {
          output += `- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})\n`;
        });
      } else {
        output += `No models found or error for ${v}: ${JSON.stringify(data)}\n`;
      }
    } catch (e) {
      output += `Error for ${v}: ${e.message}\n`;
    }
    output += '\n';
  }
  fs.writeFileSync('models_list.txt', output);
  console.log('Results written to models_list.txt');
}

listAllModels();
