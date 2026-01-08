// Тестовый скрипт для проверки доступных моделей
const apiKey = 'AIzaSyDwBVvQsyrQrVOmYv3YJAYtg7iv7VRIk3o';

async function checkModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    console.log('Доступные модели:');
    data.models?.forEach(model => {
      console.log(`- ${model.name}`);
      console.log(`  Методы: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
    });
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

// Проверим в браузере через консоль
console.log('Откройте браузер и выполните:');
console.log(`fetch('https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}').then(r => r.json()).then(console.log)`);
