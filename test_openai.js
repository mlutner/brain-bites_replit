import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API connection...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with valid JSON."
        },
        {
          role: "user",
          content: "Generate a simple flashcard about photosynthesis. Return JSON with this format: {\"flashcards\": [{\"question\": \"string\", \"answer\": \"string\", \"difficulty\": \"easy\"}]}"
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    console.log('API Response received');
    console.log('Content:', response.choices[0].message.content);
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    console.log('Parsed result:', result);
    
  } catch (error) {
    console.error('OpenAI API test failed:', error);
  }
}

testOpenAI();