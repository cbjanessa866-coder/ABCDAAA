
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PhotoAnalysis, LiveCompositionAdvice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePhoto = async (imageBase64: string): Promise<PhotoAnalysis> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          text: `你现在是一名享誉国际的摄影评论家和艺术指导。请跳过任何技术参数（如快门、光圈）的推测，直接从摄影美学角度对这张照片进行深度点评。

请从以下三个维度给出极具洞察力的评语：
1. 艺术表现：色彩关系、光影质感或画面节奏。
2. 画面构图：视觉平衡感、线条走向或主次关系。
3. 氛围意境：照片传达的情绪、故事感或独特视角。

请以 JSON 格式返回：
- score: 综合美学评分 (1-100)
- composition: 构图风格总结（4字以内）
- explanation: 整体印象概括（一句话）
- critique: 包含 artistic, technical, emotional 三方面的专业评语。
- proTip: 针对性的进阶改进建议。`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          composition: { type: Type.STRING },
          explanation: { type: Type.STRING },
          critique: {
            type: Type.OBJECT,
            properties: {
              artistic: { type: Type.STRING },
              technical: { type: Type.STRING },
              emotional: { type: Type.STRING },
            },
            required: ["artistic", "technical", "emotional"],
          },
          proTip: { type: Type.STRING },
        },
        required: ["score", "composition", "explanation", "critique", "proTip"],
      },
    },
  });

  const text = response.text || "{}";
  return JSON.parse(text) as PhotoAnalysis;
};

export const analyzeLiveFrame = async (imageBase64: string): Promise<LiveCompositionAdvice> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          text: "分析此相机画面。识别画面中最适合作为摄影主体的对象。返回主体的中心坐标 x,y (0-100) 和建议的构图框大小 width,height (0-100)。并给出一条极其简短的中文理由（15字以内），说明该构图的优势。直接返回 JSON。",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
          width: { type: Type.NUMBER },
          height: { type: Type.NUMBER },
          reason: { type: Type.STRING },
          subjectLabel: { type: Type.STRING },
        },
        required: ["x", "y", "width", "height", "reason", "subjectLabel"],
      },
    },
  });

  const data = JSON.parse(response.text || "{}");
  return data as LiveCompositionAdvice;
};
