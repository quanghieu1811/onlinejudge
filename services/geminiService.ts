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
    title: { type: Type.STRING, description: "Một tiêu đề sáng tạo và mô tả cho bài toán, bằng Tiếng Việt." },
    description: { type: Type.STRING, description: "Mô tả chi tiết về thử thách lập trình, bằng Tiếng Việt." },
    inputFormat: { type: Type.STRING, description: "Mô tả rõ ràng về định dạng đầu vào (Input), bằng Tiếng Việt." },
    outputFormat: { type: Type.STRING, description: "Mô tả rõ ràng về định dạng đầu ra (Output), bằng Tiếng Việt." },
    constraints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các ràng buộc cho các biến đầu vào, bằng Tiếng Việt." },
    samples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          input: { type: Type.STRING },
          output: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "Giải thích ngắn gọn cho trường hợp mẫu, bằng Tiếng Việt." },
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
        verdict: { type: Type.STRING, enum: Object.values(Verdict), description: "Kết quả cuối cùng của bài nộp." },
        explanation: { type: Type.STRING, description: "Một câu tóm tắt ngắn gọn về kết quả." },
        details: { type: Type.STRING, description: "Giải thích chi tiết, mang tính xây dựng về bất kỳ vấn đề nào. Để null nếu 'Accepted'." }
    },
    required: ["verdict", "explanation"]
};

export const generateProblem = async (): Promise<Problem> => {
  const prompt = `Hãy tạo một bài toán lập trình tin học mới, độc đáo, bằng **Tiếng Việt**, phù hợp với một nền tảng lập trình thi đấu. Độ khó nên ở mức dễ đến trung bình. Bài toán phải được giải thích rõ ràng và đầy đủ. Cung cấp output theo schema JSON được yêu cầu.`;

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
    return { ...parsedResponse, id: `problem_${Date.now()}` } as Problem;

  } catch (error) {
    console.error("Error generating problem:", error);
    throw new Error("Failed to generate a new problem from the API.");
  }
};

export const judgeCode = async (problem: Problem, code: string, language: string): Promise<SubmissionResult> => {
    const prompt = `
Bạn là một Giám khảo Online chuyên nghiệp cho một cuộc thi tin học. Nhiệm vụ của bạn là đánh giá bài nộp của thí sinh cho một bài toán lập trình cho trước.
Phân tích mô tả bài toán và code của thí sinh. Cung cấp đánh giá của bạn dưới dạng JSON nghiêm ngặt.

**Mô tả bài toán:**
Tiêu đề: ${problem.title}
Mô tả: ${problem.description}
Định dạng Input: ${problem.inputFormat}
Định dạng Output: ${problem.outputFormat}
Ràng buộc:
${problem.constraints.join('\n')}
Test mẫu:
${problem.samples.map(s => `Input:\n${s.input}\nOutput:\n${s.output}`).join('\n\n')}

**Bài nộp của thí sinh:**
Ngôn ngữ: ${language}
Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

**Nhiệm vụ của bạn:**

1.  **Tính đúng đắn:** Code có giải quyết đúng bài toán cho tất cả các trường hợp, bao gồm cả các trường hợp biên (edge cases) được ngụ ý bởi các ràng buộc không?
2.  **Logic:** Logic có hợp lý không? Có lỗ hổng rõ ràng nào không?
3.  **Hiệu quả (Mô phỏng):** Dựa trên các ràng buộc và thuật toán được sử dụng, code này có khả năng vượt qua giới hạn thời gian thông thường (ví dụ: 1-2 giây) không? Bạn không cần chạy nó, chỉ cần phân tích độ phức tạp thời gian.
4.  **Kết quả (Verdict):** Gán một trong các kết quả sau: "Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error", "RuntimeError".
5.  **Giải thích (Explanation):** Cung cấp một câu tóm tắt ngắn gọn về kết quả của bạn.
6.  **Chi tiết (Details):** Nếu kết quả không phải là 'Accepted', hãy cung cấp một lời giải thích chi tiết, mang tính xây dựng và hữu ích ở định dạng Markdown. Chỉ ra những sai sót cụ thể trong logic, đề xuất các trường hợp biên mà người dùng có thể đã bỏ lỡ, hoặc giải thích tại sao thuật toán không hiệu quả. Cung cấp gợi ý để cải thiện. Nếu kết quả là 'Accepted', trường này phải là null.

**Định dạng Output (JSON nghiêm ngặt):**
Chỉ trả lời bằng một đối tượng JSON hợp lệ khớp với schema được yêu cầu. Không bao gồm bất kỳ văn bản hoặc định dạng markdown nào trước hoặc sau khối JSON.
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
        
        if (parsedResponse.details === "null") {
            parsedResponse.details = null;
        }

        return parsedResponse as SubmissionResult;
    } catch (error) {
        console.error("Error judging code:", error);
        throw new Error("Failed to judge the submission using the API.");
    }
};
