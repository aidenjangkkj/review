// reply-gemini.js
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

// Google Generative AI 클라이언트 초기화
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * 고객 이름(name)과 리뷰(text)를 합쳐
 * "감정 분석과 문제점을 고려해서" 답장을 생성합니다.
 */
async function generateReplyWithGemini(name, text) {
  // 프롬프트 조합
  const userPrompt = `고객이름: ${name} 리뷰내용:${text} 가게이름: ${process.env.BAEMIN_STORE_NAME} 해당 리뷰에 답장을 해줘 리뷰의 감정과 문제점을 고려해서 답장 작성해줘`;

  // Gemini 모델 호출 (gemini-2.0-flash 사용)
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: userPrompt,
  });

  // 반환된 텍스트 정리
  return response.text?.trim() || '';
}

module.exports = { generateReplyWithGemini };
