import { GoogleGenAI, Type } from "@google/genai";
import { QuestStep } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_FAST = 'gemini-2.5-flash';

// System instruction for the empathetic coach
const COACH_SYSTEM_INSTRUCTION = `
당신은 '오름(Oreum)'이라는 앱의 AI 라이프 코치입니다.
주 사용자는 공부 의지가 약해졌거나, 은둔형 외톨이 성향이 있거나, 번아웃이 온 '쉬었음' 세대입니다.
당신의 역할은 사용자를 절대 비난하지 않고, 무조건적으로 지지하며, 아주 작은 행동(Micro-step)을 제안하는 것입니다.
말투는 부드럽고 따뜻한 존댓말을 사용하세요. 답변은 모바일 화면에서 읽기 좋게 3문장 이내로 짧게 하세요.
`;

export const chatWithCoach = async (message: string, history: { role: string; parts: { text: string }[] }[]) => {
  try {
    const chat = ai.chats.create({
      model: MODEL_FAST,
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

export const generateMicroQuest = async (goal: string): Promise<Omit<QuestStep, 'id' | 'isCompleted'>[]> => {
  try {
    const prompt = `
    사용자의 목표: "${goal}"
    
    이 목표를 달성하기 위해 당장 5분 안에 실행할 수 있는, 아주 사소하고 쉬운 3단계의 행동 단계를 만들어주세요.
    실패할 수 없을 만큼 쉬워야 합니다. (예: "공부하기" -> "책상에 앉기", "책 펼치기", "한 줄 읽기")
    
    JSON 형식으로 반환하세요.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction: "당신은 큰 목표를 아주 작은 단위로 쪼개주는 전문가입니다.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "행동 단계 설명 (한국어)",
              },
            },
            required: ["text"],
          },
        },
      },
    });

    if (response.text) {
        const parsed = JSON.parse(response.text);
        return parsed as { text: string }[];
    }
    return [];

  } catch (error) {
    console.error("Quest Gen Error:", error);
    throw error;
  }
};
