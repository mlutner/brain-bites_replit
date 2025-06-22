import { openaiClient, OPENAI_CONFIG } from '../utils/openai-client';

interface GeneratedItem {
  question: string;
  answer: string;
  [key: string]: any; // Allow other properties like options, explanation for quizzes
}

interface ValidationResult {
  item: GeneratedItem;
  isPotentiallyHallucinated: boolean;
  reasoning: string;
  error?: string;
}

export async function checkGeneratedContent(
  sourceText: string,
  generatedItems: GeneratedItem[]
): Promise<ValidationResult[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key is not configured for ValidationService.");
    // Return items as not validated, with an error message
    return generatedItems.map(item => ({
      item,
      isPotentiallyHallucinated: false, // Default to false as we can't check
      reasoning: "Validation skipped: OpenAI API key not configured.",
    }));
  }

  const validationResults: ValidationResult[] = [];
  const maxConcurrentRequests = 5; // Limit concurrent requests to OpenAI
  let currentProcessing = 0;

  console.log(`Starting hallucination check for ${generatedItems.length} items.`);

  const itemsToProcess = [...generatedItems];

  // Process items in batches to avoid overwhelming the API or local resources
  while (itemsToProcess.length > 0) {
    const batch = itemsToProcess.splice(0, maxConcurrentRequests);
    currentProcessing += batch.length;
    console.log(`Processing batch of ${batch.length} items. Total processed: ${currentProcessing}/${generatedItems.length}`);

    const batchPromises = batch.map(async (item) => {
      const prompt = `
        You are a meticulous fact-checking AI. Your task is to determine if the provided Question and Answer are factually supported by the Source Text.
        The Question and Answer should be directly derivable from the Source Text. Do not make assumptions or infer information not explicitly present.

        Source Text:
        ---
        ${sourceText.substring(0, 7500)}
        ---
        End of Source Text.

        Question: "${item.question}"
        Answer: "${item.answer}"

        Based *only* on the Source Text provided:
        1. Is the Question answerable using *only* the Source Text?
        2. Is the Answer provided factually correct and directly supported by the Source Text?

        If both are true, the content is likely NOT a hallucination.
        If the Question cannot be answered from the Source Text, or if the Answer is incorrect or not supported by the Source Text, it IS potentially a hallucination.

        Provide your response in a JSON object with this exact format:
        {
          "isPotentiallyHallucinated": boolean, // true if potentially hallucinated, false otherwise
          "reasoning": "A brief explanation for your decision. If potentially hallucinated, specify why (e.g., 'Answer not found in text', 'Question refers to concepts outside the text', 'Answer contradicts text')."
        }
      `;

      try {
        const response = await openaiClient.chat.completions.create({
          model: OPENAI_CONFIG.model, // Or a model specifically chosen for this task
          messages: [
            {
              role: "system",
              content: "You are a fact-checking AI. Respond with JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1, // Low temperature for more deterministic validation
        });

        const content = response.choices[0].message.content;
        if (content) {
          const parsedResponse = JSON.parse(content);
          return {
            item,
            isPotentiallyHallucinated: parsedResponse.isPotentiallyHallucinated || false,
            reasoning: parsedResponse.reasoning || "No reasoning provided.",
          };
        } else {
          return {
            item,
            isPotentiallyHallucinated: false,
            reasoning: "Validation failed: Empty response from AI.",
            error: "Empty response",
          };
        }
      } catch (error: any) {
        console.error("Error during OpenAI call in ValidationService:", error.message);
        return {
          item,
          isPotentiallyHallucinated: false, // Default to false on error to avoid false positives
          reasoning: "Validation failed due to an API or parsing error.",
          error: error.message,
        };
      }
    });

    const results = await Promise.all(batchPromises);
    validationResults.push(...results);
  }

  console.log(`Hallucination check completed for ${generatedItems.length} items.`);
  return validationResults;
}
