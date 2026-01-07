# AC Doctor AI

Приложение для диагностики кондиционеров с использованием искусственного интеллекта.

## Возможности

- Текстовая диагностика неисправностей кондиционеров
- Анализ изображений для визуальной диагностики
- Пошаговые рекомендации по ремонту
- Профессиональные советы от AI-инженера

## Технологии

- React 18
- TypeScript
- Vite
- Google Gemini AI
- Tailwind CSS

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/urbonchik1888-cell/AC_Doctor.git
cd AC_Doctor
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` и добавьте API ключ:
```
VITE_API_KEY=ваш_api_ключ_от_google_gemini
```

4. Запустите приложение:
```bash
npm run dev
```

5. Откройте в браузере: http://localhost:5173

## Получение API ключа

1. Перейдите в [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Создайте новый API ключ
3. Добавьте его в файл `.env`

## Структура проекта

- `App.tsx` - основной компонент приложения
- `services/geminiService.ts` - сервис для работы с Gemini API
- `components/` - компоненты интерфейса
- `types.ts` - TypeScript типы