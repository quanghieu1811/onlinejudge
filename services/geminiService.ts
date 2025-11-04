
import { GoogleGenAI, Type } from "@google/genai";
import { Problem, SubmissionResult, Verdict } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const problemGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A creative and descriptive title for the problem." },
    description: { type: Type.STRING, description: "A detailed description of the programming challenge." },
    inputFormat: { type: Type.STRING, description: "A clear description of the input format." },
    outputFormat: { type: Type.STRING, description: "A clear description of the expected output format." },
    constraints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of constraints for the input variables." },
    samples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          input: { type: Type.STRING },
          output: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "A brief explanation of the sample case." },
        },
        required: ["input", "output"],
      },
    },
  },
  required: ["title", "description", "inputFormat", "outputFormat", "constraints", "samples"],
};

const judgingSchema = {
    type: Type.OBJECT,
    properties: {
        verdict: { type: Type.STRING, enum: Object.values(Verdict), description: "The final verdict of the submission." },
        explanation: { type: Type.STRING, description: "A concise, one-sentence summary of the verdict." },
        details: { type: Type.STRING, description: "A detailed, constructive explanation of any issues. Null if accepted." }
    },
    required: ["verdict", "explanation"]
};

export const generateProblem = async (): Promise<Problem> => {
  const prompt = `Generate a new, unique informatics programming problem suitable for a competitive programming platform. The difficulty should be easy to medium. The problem must be self-contained and clearly explained. Provide the output in the requested JSON schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: problemGenerationSchema,
      },
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse as Problem;

  } catch (error) {
    console.error("Error generating problem:", error);
    throw new Error("Failed to generate a new problem from the API.");
  }
};

export const judgeCode = async (problem: Problem, code: string, language: string): Promise<SubmissionResult> => {
    const prompt = `
You are an expert Online Judge for an informatics competition. Your task is to evaluate a user's code submission for a given programming problem.
Analyze the problem description and the user's code. Provide your evaluation in a strict JSON format.

**Problem Description:**
Title: ${problem.title}
Description: ${problem.description}
Input Format: ${problem.inputFormat}
Output Format: ${problem.outputFormat}
Constraints:
${problem.constraints.join('\n')}
Sample Cases:
${problem.samples.map(s => `Input:\n${s.input}\nOutput:\n${s.output}`).join('\n\n')}

**User Submission:**
Language: ${language}
Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

**Your Task:**

1.  **Correctness:** Does the code solve the problem correctly for all cases, including edge cases implied by the constraints?
2.  **Logic:** Is the logic sound? Are there any apparent flaws?
3.  **Efficiency (Simulated):** Based on the constraints and the algorithm used, would this code likely pass within a typical time limit (e.g., 1-2 seconds)? You don't need to run it, just analyze the time complexity.
4.  **Verdict:** Assign one of the following verdicts: "Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error", "Runtime Error".
5.  **Explanation:** Provide a concise, one-sentence summary of your verdict.
6.  **Details:** If the verdict is not 'Accepted', provide a detailed, constructive, and helpful explanation in Markdown format. Point out the specific flaws in the logic, suggest edge cases the user might have missed, or explain why the algorithm is inefficient. Provide hints for improvement. If the verdict is 'Accepted', this field should be null.

**Output Format (Strict JSON):**
Respond with ONLY a valid JSON object matching the requested schema. Do not include any text or markdown formatting before or after the JSON block.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: judgingSchema,
            },
        });
        const parsedResponse = JSON.parse(response.text);
        
        // Gemini might return a string "null" for details, so we correct it.
        if (parsedResponse.details === "null") {
            parsedResponse.details = null;
        }

        return parsedResponse as SubmissionResult;
    } catch (error) {
        console.error("Error judging code:", error);
        throw new Error("Failed to judge the submission using the API.");
    }
};
