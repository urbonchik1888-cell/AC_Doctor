import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, Role } from "../types";

const SYSTEM_INSTRUCTION = `
Ты — профессиональный инженер по обслуживанию и ремонту бытовых и полупромышленных кондиционеров (сплит-систем, мульти-сплит, VRF).
Твоя задача — провести пошаговую диагностику неисправности кондиционера на основе предоставленных данных.

Алгоритм работы:
1. Проанализируй симптомы и условия работы.
2. Определи наиболее вероятные причины неисправности (от простых к сложным).
3. Укажи, какие проверки нужно выполнить (визуальные, электрические, холодильного контура).
4. Предложи конкретные решения и рекомендации по ремонту.
5. Если данных недостаточно — задай точные уточняющие вопросы.

Учитывай при анализе:
- Тип кондиционера (инверторный / обычный)
- Модель и мощность
- Симптомы
- Условия эксплуатации
- Коды ошибок

Формат твоего ответа должен СТРОГО содержать эти секции (используй эти эмодзи):

🛠️ Возможные причины
[Список причин]

🔍 Что проверить
[Список проверок]

✅ Рекомендуемые действия
[Шаги по устранению]

⚠️ Когда требуется вызов специалиста
[Предупреждения]

Важно:
- Не предлагай опасные действия для пользователя без профессиональных навыков (например, работа под высоким напряжением без допуска).
- Делай выводы логично и технически обоснованно.
- Используй простой, понятный язык.
- Если пользователь присылает фото, проанализируй его на предмет загрязнений, повреждений, кодов ошибок на дисплее или шильдике.
`;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachment?: { mimeType: string; data: string }
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey || apiKey === "ВАШ_API_КЛЮЧ_ОТ_GOOGLE_GEMINI") {
      return "⚠️ Ошибка: API-ключ не найден. Пожалуйста, проверьте ключ в файле .env.";
    }
    const ai = new GoogleGenerativeAI(apiKey);

    // Подберем модель с резервами (используем бесплатные gemma модели)
    const candidateModels = attachment
      ? ["gemini-2.5-flash-image", "gemini-2.5-flash-image-preview"]
      : ["gemma-3-4b-it", "gemma-3-12b-it", "gemma-3-27b-it"];

    // Сформируем стенограмму: системная инструкция + история + новое сообщение
    const transcript: string = [
      SYSTEM_INSTRUCTION.trim(),
      ...history.map(m => `${m.role === Role.USER ? "Пользователь" : "Модель"}: ${m.text}`),
      `Пользователь: ${newMessage}`
    ].join("\n\n");

    // Сформируем parts для generateContent
    const parts: any[] = [];
    if (attachment) {
      parts.push({ inlineData: { mimeType: attachment.mimeType, data: attachment.data } });
    }
    parts.push({ text: transcript });

    let lastErr: unknown = undefined;
    // 1) Попробуем кандидатов по списку
    for (const modelId of candidateModels) {
      try {
        const model = ai.getGenerativeModel({ model: modelId, generationConfig: { temperature: 0.4 } });
        const result = await model.generateContent(parts);
        const text = result.response?.text?.();
        if (text && text.trim().length > 0) return text;
      } catch (e) {
        lastErr = e;
        continue;
      }
    }
    // 2) Если все кандидаты 404 — пробуем получить список доступных моделей и выбрать первую подходящую
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        const list = (await listRes.json()) as { models?: { name: string; supportedGenerationMethods?: string[] }[] };
        const fallback = list.models?.find(m => m.supportedGenerationMethods?.includes("generateContent"));
        if (fallback) {
          const modelId = fallback.name.split("/").pop();
          if (modelId && !candidateModels.includes(modelId)) {
            const model = ai.getGenerativeModel({ model: modelId, generationConfig: { temperature: 0.4 } });
            const result = await model.generateContent(parts);
            const text = result.response?.text?.();
            if (text && text.trim().length > 0) return text;
          }
        }
      }
    } catch (e) {
      // ignore ListModels error
    }
    // 3) Последний шанс — пробуем базовые модели через v1beta
    const v1betaModels = attachment
      ? ["gemini-2.5-flash-image", "gemini-2.5-flash-image-preview"]
      : ["gemma-3-4b-it", "gemma-3-12b-it", "gemma-3-27b-it", "gemini-2.5-flash"];
    
    for (const modelId of v1betaModels) {
      try {
        const model = ai.getGenerativeModel({ model: modelId, generationConfig: { temperature: 0.4 } });
        const result = await model.generateContent(parts);
        const text = result.response?.text?.();
        if (text && text.trim().length > 0) return text;
      } catch (e) {
        lastErr = e;
        continue;
      }
    }
    console.error("Gemini API Fallback Error:", lastErr);
    return "❌ Не удалось подобрать доступную модель Gemini для этого ключа/региона. Попробуйте позже или проверьте доступ к моделям в Google AI Studio.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "❌ Ошибка связи с сервисом Gemini. Проверьте соединение, действительность API-ключа и доступность моделей в вашем регионе.";
  }
};
