
import { GoogleGenAI, Type } from "@google/genai";

const PROMPT_SYSTEM = `You are a world-class professional exam paper composer.
Your task is to take images of handwritten exam papers or notes and convert them into a clean, structured digital JSON format.

RULES:
1. Transcribe the handwriting exactly, fixing only obvious spelling errors.
2. Maintain professional institutional headers (School name, Subject, Total Marks, Time).
3. Identify Sections (e.g., Section A) and maintain Question numbering.
4. IMPORTANT FOR QUESTION NUMBERS: Extract ONLY the number or identifier for the 'number' field. DO NOT include prefixes like "Q", "Q.", "Quest", or "Question".
   - Example: If the paper says "Q1", the JSON should be "1".
5. IMPORTANT FOR MULTIPLE CHOICE / SUB-QUESTIONS: When a question has options, put ONLY the text of the option in the 'subQuestions' array. DO NOT include the label (like "a)" or "1.").
6. MATH NOTATION:
   - Use '^' for superscripts and '_' for subscripts.
   - MANDATORY: Use curly braces '{}' for ANY expression longer than one character or containing symbols.
   - Correct: x^2, H_2O, x^{n+1}, e^{i\pi} + 1 = 0, x^{2}+x-2=0.
   - Incorrect: x^n+1 (this would render only 'n' as superscript).
   - Ensure spaces are kept around operators like +, -, =, etc., unless they are inside braces.

Output MUST be a valid JSON object matching the provided schema.`;

const EXAM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'The main institutional header or title' },
    subject: { type: Type.STRING, description: 'The subject name' },
    totalMarks: { type: Type.STRING, description: 'Total marks value' },
    timeAllowed: { type: Type.STRING, description: 'Allowed time' },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Section title (e.g., SECTION A)' },
          instructions: { type: Type.STRING, description: 'Section instructions' },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                number: { type: Type.STRING, description: 'Numeric question number only' },
                text: { type: Type.STRING, description: 'Main question text with math notation' },
                marks: { type: Type.STRING, description: 'Marks assigned' },
                subQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['number', 'text']
            }
          }
        },
        required: ['title', 'questions']
      }
    }
  },
  required: ['title', 'subject', 'sections']
};

export const processHandwrittenImage = async (base64Images: string[]): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts = base64Images.map(img => ({
    inlineData: {
      data: img.split(',')[1],
      mimeType: 'image/jpeg'
    }
  }));

  parts.push({ text: "Transcribe this exam paper. Pay extremely close attention to math equations. Use ^{...} for any complex superscripts and _{...} for subscripts. Extract only numeric values for question numbers." } as any);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: parts as any },
      config: {
        systemInstruction: PROMPT_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: EXAM_SCHEMA as any,
      }
    });

    if (!response.text) {
      throw new Error("No content generated");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
