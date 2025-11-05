import { GoogleGenAI, Type } from "@google/genai";
import { Problem, SubmissionResult, Verdict, Difficulty, TestCase } from "../types";

// Fix: Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const judgeSchema = {
    type: Type.OBJECT,
    properties: {
        verdict: { 
            type: Type.STRING,
            enum: [
                Verdict.Accepted,
                Verdict.WrongAnswer,
                Verdict.TimeLimitExceeded,
                Verdict.CompilationError,
                Verdict.RuntimeError,
            ],
            description: "The verdict of the submission."
        },
        explanation: { 
            type: Type.STRING,
            description: "A brief, user-friendly explanation for the verdict."
        },
        details: { 
            type: Type.STRING,
            description: "Detailed information. For 'Wrong Answer', include input, expected output, and actual output. For errors, include compiler or runtime messages."
        },
    },
    required: ["verdict", "explanation"],
};

const problemGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A creative and descriptive title for the programming problem."
        },
        description: {
            type: Type.STRING,
            description: "A detailed description of the problem in Markdown format. Include a clear problem statement, input/output format, constraints, and at least one example."
        },
        difficulty: {
            type: Type.STRING,
            enum: ["Easy", "Medium", "Hard"],
        },
        testCases: {
            type: Type.ARRAY,
            description: "An array of at least 4 test cases.",
            items: {
                type: Type.OBJECT,
                properties: {
                    input: {
                        type: Type.STRING,
                        description: "The input for the test case, formatted as a string. Newlines should be represented as '\\n'."
                    },
                    output: {
                        type: Type.STRING,
                        description: "The expected output for the test case, formatted as a string."
                    },
                    isPublic: {
                        type: Type.BOOLEAN,
                        description: "Set to true for the first 1 or 2 test cases to serve as public samples, and false for the rest (hidden test cases)."
                    }
                },
                required: ["input", "output", "isPublic"]
            }
        }
    },
    required: ["title", "description", "difficulty", "testCases"]
};

export const generateProblem = async (topic: string, difficulty: Difficulty): Promise<Omit<Problem, 'id'>> => {
    try {
        const prompt = `Generate a new, unique programming problem for an informatics competition.

**Topic:** ${topic}
**Difficulty:** ${difficulty}

**Instructions:**
1.  **Title:** Create a compelling title.
2.  **Description:** Write a clear problem statement in **Markdown**. It must include:
    -   An engaging story or context.
    -   A formal definition of the task.
    -   Specifications for the input format.
    -   Specifications for the output format.
    -   Any constraints on the input values (e.g., number of elements, value ranges).
    -   At least one clear example with input and corresponding output.
3.  **Difficulty:** The problem's logic and required algorithms should match the requested difficulty level.
4.  **Test Cases:** Provide at least 4 diverse test cases.
    -   The first 1 or 2 test cases should be marked as **public** (\`isPublic: true\`) and should match the examples in the description.
    -   The remaining test cases must be **hidden** (\`isPublic: false\`) and should cover edge cases, large inputs, and general cases.

Your entire response must be a single JSON object that conforms to the provided schema. Do not add any text before or after the JSON object.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: problemGenerationSchema,
                temperature: 0.8, // Higher temperature for more creative problems
            },
        });

        const jsonString = response.text.trim();
        const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
        const result = JSON.parse(cleanedJsonString);
        
        // Add IDs to the test cases
        const resultWithTestIds = {
            ...result,
            testCases: result.testCases.map((tc: Omit<TestCase, 'id'>) => ({
                ...tc,
                id: `tc-${Date.now()}-${Math.random()}`
            }))
        };

        return resultWithTestIds;

    } catch (error) {
        console.error("Error generating problem with Gemini API:", error);
        throw new Error("Failed to generate a new problem. The AI model might be unavailable or the request failed.");
    }
};


export const judgeCode = async (
  problem: Problem,
  code: string,
  language: string
): Promise<SubmissionResult> => {
  try {
    const testCasesString = problem.testCases
      .map(
        (tc, i) =>
          `Test Case ${i + 1} (${tc.isPublic ? 'Public' : 'Hidden'}):\nInput:\n${tc.input}\nExpected Output:\n${
            tc.output
          }`
      )
      .join("\n\n");

    const prompt = `You are an expert programming judge. Evaluate the following code submission against the provided problem description and test cases. Your goal is to determine if the code is correct and efficient.

**Problem Description:**
${problem.description}

**Programming Language:**
${language}

**User's Code:**
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

**Test Cases:**
There are ${problem.testCases.length} test cases in total.
${testCasesString}

**Instructions:**
1.  Compile and run the code against each test case, including both public and hidden ones.
2.  Check if the actual output exactly matches the expected output for all test cases.
3.  Evaluate for common errors: compilation errors, runtime errors (e.g., segmentation fault, index out of bounds), or time limit exceeded (assume an infinite loop or highly inefficient algorithm).
4.  Provide your response in a structured JSON format. Do not add any text before or after the JSON object.

**JSON Response Format:**
-   **verdict**: One of "Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error", or "Runtime Error".
-   **explanation**: A concise, one-sentence explanation for the verdict. For example, "The code failed on hidden test case #3" or "The code produced the correct output for all test cases."
-   **details**:
    -   If "Wrong Answer", provide the input, expected output, and the actual output for the first failed test case. **Do not reveal details for hidden test cases.** Simply state "Failed on a hidden test case."
    -   If "Compilation Error" or "RuntimeError", provide the specific error message.
    -   If "Accepted", this can be an empty string.
`;

    // Fix: Use the correct method to generate content with a JSON response schema.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: judgeSchema,
        temperature: 0.1, // Lower temperature for more deterministic judging
      },
    });

    // Fix: Access the response text correctly and parse it as JSON.
    const jsonString = response.text.trim();
    const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
    const result = JSON.parse(cleanedJsonString);

    if (result.verdict && result.explanation) {
        return result as SubmissionResult;
    } else {
        console.error("Invalid JSON structure from Gemini:", result);
        throw new Error("Received an invalid response structure from the judge.");
    }

  } catch (error) {
    console.error("Error judging code with Gemini API:", error);
    return {
      verdict: Verdict.RuntimeError,
      explanation: "An error occurred during the judging process.",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
};