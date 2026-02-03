// Модуль для работы с различными AI API
class AIAnalyzer {
    constructor() {
        this.selectedModel = this.loadSelectedModel();
        this.apiKey = this.loadApiKey();

        // Конфигурация моделей
        this.models = {
            gemini: {
                name: 'Google Gemini Pro',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
                requiresKey: true,
                available: true,
                description: 'Мощная модель от Google (может быть недоступна в некоторых странах)'
            },
            huggingface: {
                name: 'Hugging Face (Mistral)',
                endpoint: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
                requiresKey: true,
                available: true,
                description: 'Временно недоступна (API изменён)'
            },
            cohere: {
                name: 'Cohere Command',
                endpoint: 'https://api.cohere.ai/v1/generate',
                requiresKey: true,
                available: true,
                description: 'Бесплатный тариф, доступна везде'
            },
            local: {
                name: 'Локальная ML модель',
                endpoint: 'http://localhost:8001/analyze',
                requiresKey: false,
                available: true,
                description: 'Использует обученные ML модели на вашем компьютере (XGBoost + Random Forest)'
            }
        };
    }

    // Загрузка API ключа из config.js или localStorage
    loadApiKey() {
        // Пробуем загрузить из config.js
        if (typeof CONFIG !== 'undefined' && CONFIG.apiKeys) {
            const modelKey = CONFIG.apiKeys[this.selectedModel || 'local'];
            if (modelKey) return modelKey;
        }
        // Если не найден, загружаем из localStorage
        return localStorage.getItem('ai_api_key') || null;
    }

    // Загрузка выбранной модели
    loadSelectedModel() {
        // Сначала проверяем localStorage (приоритет у выбора пользователя)
        const savedModel = localStorage.getItem('selected_ai_model');
        if (savedModel) return savedModel;

        // Затем проверяем config.js
        if (typeof CONFIG !== 'undefined' && CONFIG.defaultModel) {
            return CONFIG.defaultModel;
        }

        return 'local';
    }

    // Сохранение выбранной модели
    saveSelectedModel(modelId) {
        localStorage.setItem('selected_ai_model', modelId);
        this.selectedModel = modelId;
    }

    // Сохранение API ключа в localStorage
    saveApiKey(apiKey) {
        localStorage.setItem('ai_api_key', apiKey);
        this.apiKey = apiKey;
    }

    // Получить API ключ для текущей модели
    getApiKey() {
        // Сначала проверяем config.js
        if (typeof CONFIG !== 'undefined' && CONFIG.apiKeys && CONFIG.apiKeys[this.selectedModel]) {
            const configKey = CONFIG.apiKeys[this.selectedModel];
            if (configKey && configKey.trim() !== '') {
                return configKey;
            }
        }

        // Если не найден в config.js, возвращаем из this.apiKey (который загружен из localStorage)
        return this.apiKey;
    }

    // Проверка наличия API ключа
    hasApiKey() {
        const model = this.models[this.selectedModel];
        if (!model.requiresKey) return true;

        const key = this.getApiKey();
        return key !== null && key !== '';
    }

    // Удаление API ключа
    clearApiKey() {
        localStorage.removeItem('ai_api_key');
        this.apiKey = null;
    }

    // Получить информацию о текущей модели
    getCurrentModel() {
        return this.models[this.selectedModel];
    }

    // Анализ условий выращивания с использованием ИИ
    async analyzeGrowingConditions(plantData, currentParams, optimalParams) {
        // Локальная модель не требует API ключа
        if (this.selectedModel !== 'local' && !this.hasApiKey()) {
            throw new Error('API ключ не установлен');
        }

        // Выбираем метод в зависимости от модели
        try {
            let aiResponse = '';

            switch (this.selectedModel) {
                case 'local':
                    return await this.callLocalML(plantData, currentParams);
                case 'gemini':
                    const promptGemini = this.buildAnalysisPrompt(plantData, currentParams, optimalParams);
                    aiResponse = await this.callGemini(promptGemini);
                    break;
                case 'huggingface':
                    const promptHF = this.buildAnalysisPrompt(plantData, currentParams, optimalParams);
                    aiResponse = await this.callHuggingFace(promptHF);
                    break;
                case 'cohere':
                    const promptCohere = this.buildAnalysisPrompt(plantData, currentParams, optimalParams);
                    aiResponse = await this.callCohere(promptCohere);
                    break;
                default:
                    return this.fallbackAnalysis(currentParams, optimalParams);
            }

            // Парсим ответ ИИ и возвращаем структурированные данные
            return this.parseAIResponse(aiResponse, currentParams, optimalParams);

        } catch (error) {
            console.error('Ошибка при обращении к AI API:', error);
            // Возвращаем базовый анализ в случае ошибки
            return this.fallbackAnalysis(currentParams, optimalParams);
        }
    }

    // Вызов локального ML backend
    async callLocalML(plantData, currentParams) {
        try {
            const response = await fetch('http://localhost:8001/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plantName: plantData.name,
                    soilMoisture: currentParams.soilMoisture,
                    sunlight: currentParams.sunlight,
                    pH: currentParams.pH,
                    airTemp: currentParams.airTemp,
                    soilTemp: currentParams.soilTemp,
                    nitrogen: currentParams.nitrogen,
                    phosphorus: currentParams.phosphorus,
                    potassium: currentParams.potassium
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Backend недоступен`);
            }

            const data = await response.json();

            return {
                score: data.score,
                recommendations: data.recommendations,
                diseaseRisks: data.diseaseRisks,
                growthTips: data.growthTips,
                rawAIResponse: `Локальная ML модель (${data.modelStatus})`
            };

        } catch (error) {
            console.error('Ошибка локального ML:', error);
            throw new Error('Локальный ML backend недоступен. Убедитесь, что сервер запущен (python backend/server.py)');
        }
    }

    // Вызов Google Gemini API
    async callGemini(prompt) {
        const apiKey = this.getApiKey();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
    }

    // Вызов Hugging Face API
    async callHuggingFace(prompt) {
        const apiKey = this.getApiKey();
        const response = await fetch(this.models.huggingface.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 512,
                    temperature: 0.7,
                    top_p: 0.95,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            let errorMsg = 'Unknown error';
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorData.message || `HTTP ${response.status}`;
            } catch (e) {
                errorMsg = `HTTP ${response.status}`;
            }

            if (response.status === 410) {
                throw new Error(`Модель больше не доступна. Попробуйте другую модель или локальный анализ.`);
            }
            if (response.status === 403) {
                throw new Error(`Ваш токен Hugging Face не имеет достаточных прав для нового API. Попробуйте Google Gemini или Cohere.`);
            }
            throw new Error(`HuggingFace API Error: ${errorMsg}`);
        }

        const data = await response.json();
        return data[0]?.generated_text || data.generated_text || '';
    }

    // Вызов Cohere API
    async callCohere(prompt) {
        const apiKey = this.getApiKey();
        const response = await fetch(this.models.cohere.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 512,
                temperature: 0.7,
                k: 0,
                stop_sequences: [],
                return_likelihoods: 'NONE'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cohere API Error: ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.generations[0]?.text || '';
    }

    // Построение промпта для ИИ
    buildAnalysisPrompt(plantData, currentParams, optimalParams) {
        return `
Ты эксперт по агрономии и садоводству. Проанализируй условия выращивания для растения "${plantData.name}".

ОПТИМАЛЬНЫЕ ПАРАМЕТРЫ:
- Влажность почвы: ${optimalParams.soilMoisture.min}-${optimalParams.soilMoisture.max}% (идеально: ${optimalParams.soilMoisture.ideal}%)
- Освещенность: ${optimalParams.sunlight.min}-${optimalParams.sunlight.max} ч/день (идеально: ${optimalParams.sunlight.ideal} ч/день)
- pH почвы: ${optimalParams.pH.min}-${optimalParams.pH.max} (идеально: ${optimalParams.pH.ideal})
- Температура воздуха: ${optimalParams.airTemp.min}-${optimalParams.airTemp.max}°C (идеально: ${optimalParams.airTemp.ideal}°C)
- Температура почвы: ${optimalParams.soilTemp.min}-${optimalParams.soilTemp.max}°C (идеально: ${optimalParams.soilTemp.ideal}°C)
- Азот (N): ${optimalParams.nitrogen.min}-${optimalParams.nitrogen.max} мг/кг (идеально: ${optimalParams.nitrogen.ideal} мг/кг)
- Фосфор (P): ${optimalParams.phosphorus.min}-${optimalParams.phosphorus.max} мг/кг (идеально: ${optimalParams.phosphorus.ideal} мг/кг)
- Калий (K): ${optimalParams.potassium.min}-${optimalParams.potassium.max} мг/кг (идеально: ${optimalParams.potassium.ideal} мг/кг)

ТЕКУЩИЕ ПАРАМЕТРЫ:
- Влажность почвы: ${currentParams.soilMoisture}%
- Освещенность: ${currentParams.sunlight} ч/день
- pH почвы: ${currentParams.pH}
- Температура воздуха: ${currentParams.airTemp}°C
- Температура почвы: ${currentParams.soilTemp}°C
- Азот (N): ${currentParams.nitrogen} мг/кг
- Фосфор (P): ${currentParams.phosphorus} мг/кг
- Калий (K): ${currentParams.potassium} мг/кг

Проанализируй и предоставь:
1. КОНКРЕТНЫЕ РЕКОМЕНДАЦИИ (3-5 пунктов) - что именно нужно изменить и на сколько
2. РИСКИ БОЛЕЗНЕЙ (2-3 пункта) - какие заболевания могут возникнуть при текущих условиях
3. СОВЕТЫ ДЛЯ РОСТА (2-3 пункта) - практические советы для улучшения цветения/урожая

Формат ответа:
РЕКОМЕНДАЦИИ:
- [конкретная рекомендация с числами]

РИСКИ:
- [описание риска и условий]

СОВЕТЫ:
- [практический совет]

ИДЕАЛЬНЫЙ ПАРАМЕТРЫ:
- [список идеальных значений параметров]

Будь конкретным и давай измеримые рекомендации.
`;
    }

    // Парсинг ответа от ИИ
    parseAIResponse(aiResponse, currentParams, optimalParams) {
        const result = {
            score: 0,
            recommendations: [],
            diseaseRisks: [],
            growthTips: [],
            rawAIResponse: aiResponse
        };

        // Извлекаем рекомендации
        const recsMatch = aiResponse.match(/РЕКОМЕНДАЦИИ:?\s*([\s\S]*?)(?=РИСКИ:|$)/i);
        if (recsMatch) {
            const recs = recsMatch[1].trim().split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.trim().substring(1).trim());
            result.recommendations = recs;
        }

        // Извлекаем риски болезней
        const risksMatch = aiResponse.match(/РИСКИ:?\s*([\s\S]*?)(?=СОВЕТЫ:|$)/i);
        if (risksMatch) {
            const risks = risksMatch[1].trim().split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.trim().substring(1).trim());
            result.diseaseRisks = risks;
        }

        // Извлекаем советы
        const tipsMatch = aiResponse.match(/СОВЕТЫ:?\s*([\s\S]*?)$/i);
        if (tipsMatch) {
            const tips = tipsMatch[1].trim().split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.trim().substring(1).trim());
            result.growthTips = tips;
        }

        // Вычисляем общий балл
        result.score = this.calculateScore(currentParams, optimalParams);

        return result;
    }

    // Вычисление общего балла соответствия условий
    calculateScore(currentParams, optimalParams) {
        const parameters = [
            'soilMoisture', 'sunlight', 'pH',
            'airTemp', 'soilTemp',
            'nitrogen', 'phosphorus', 'potassium'
        ];

        let totalScore = 0;
        let paramCount = parameters.length;

        parameters.forEach(param => {
            const current = currentParams[param];
            const optimal = optimalParams[param];

            // Проверяем, находится ли значение в оптимальном диапазоне
            if (current >= optimal.min && current <= optimal.max) {
                // Если в диапазоне, вычисляем близость к идеалу
                const range = optimal.max - optimal.min;
                const deviation = Math.abs(current - optimal.ideal);
                const score = Math.max(0, 100 - (deviation / range * 100));
                totalScore += score;
            } else {
                // Если вне диапазона, штрафуем пропорционально отклонению
                const deviation = current < optimal.min ?
                    (optimal.min - current) : (current - optimal.max);
                const range = optimal.max - optimal.min;
                const penalty = Math.min(100, (deviation / range) * 50);
                totalScore += Math.max(0, 100 - penalty);
            }
        });

        return Math.round(totalScore / paramCount);
    }

    // Резервный анализ без ИИ (на случай ошибки API)
    fallbackAnalysis(currentParams, optimalParams) {
        const result = {
            score: this.calculateScore(currentParams, optimalParams),
            recommendations: [],
            diseaseRisks: [],
            growthTips: []
        };

        // Базовые рекомендации на основе сравнения параметров
        const checkParam = (param, name, unit) => {
            const current = currentParams[param];
            const optimal = optimalParams[param];

            if (current < optimal.min) {
                const diff = Math.round((optimal.ideal - current) * 10) / 10;
                result.recommendations.push(
                    `Увеличьте ${name} на ${diff}${unit} (текущее: ${current}${unit}, оптимально: ${optimal.ideal}${unit})`
                );
            } else if (current > optimal.max) {
                const diff = Math.round((current - optimal.ideal) * 10) / 10;
                result.recommendations.push(
                    `Снизьте ${name} на ${diff}${unit} (текущее: ${current}${unit}, оптимально: ${optimal.ideal}${unit})`
                );
            }
        };

        checkParam('soilMoisture', 'влажность почвы', '%');
        checkParam('sunlight', 'освещенность', ' ч/день');
        checkParam('pH', 'pH почвы', '');
        checkParam('airTemp', 'температуру воздуха', '°C');
        checkParam('nitrogen', 'содержание азота', ' мг/кг');

        // Базовые риски
        if (currentParams.soilMoisture > 80 && currentParams.airTemp < 18) {
            result.diseaseRisks.push('Риск грибковых заболеваний из-за высокой влажности и низкой температуры');
        }
        if (currentParams.pH > 7.5 || currentParams.pH < 5.5) {
            result.diseaseRisks.push('Неоптимальный pH может привести к дефициту питательных веществ');
        }

        // Базовые советы
        result.growthTips.push('Регулярно проверяйте состояние растений');
        result.growthTips.push('Обеспечьте хорошую циркуляцию воздуха');

        result.rawAIResponse = 'Базовый анализ (ИИ недоступен)';

        return result;
    }
}

// Создаем глобальный экземпляр анализатора
const aiAnalyzer = new AIAnalyzer();
