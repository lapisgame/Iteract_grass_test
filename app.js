// Основное приложение - логика и управление состоянием
class GardenAssistantApp {
    constructor() {
        this.selectedPlant = null;
        this.currentParams = {
            soilMoisture: 50,
            sunlight: 6,
            pH: 6.5,
            airTemp: 20,
            soilTemp: 18,
            nitrogen: 80,
            phosphorus: 60,
            potassium: 90
        };
        this.analysisResults = null;
        this.customPlants = this.loadCustomPlants();
    }

    // Инициализация приложения
    initialize() {
        this.renderPlantCards();
        this.setupParameterSliders();
        this.setupEventListeners();
        this.checkApiKey();
        this.loadTheme();
        this.loadHistory();
    }

    // Отрисовка карточек растений
    renderPlantCards() {
        const container = document.getElementById('plantCards');
        const plants = getAllPlants();

        // Добавляем пользовательские растения
        const allPlants = [...plants, ...this.customPlants];

        container.innerHTML = allPlants.map(plant => `
            <div class="plant-card" data-plant-id="${plant.id}">
                <span class="plant-icon">${plant.icon}</span>
                <div class="plant-name">${plant.name}</div>
            </div>
        `).join('');

        // Обработчики клика на карточки
        container.querySelectorAll('.plant-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectPlant(card.dataset.plantId);
            });
        });
    }

    // Выбор растения
    selectPlant(plantId) {
        // Убираем выделение с других карточек
        document.querySelectorAll('.plant-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Выделяем выбранную карточку
        const selectedCard = document.querySelector(`[data-plant-id="${plantId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        // Загружаем данные растения
        this.selectedPlant = getPlantById(plantId) || this.customPlants.find(p => p.id === plantId);
        console.log('Выбрано растение:', this.selectedPlant);
    }

    // Настройка слайдеров параметров
    setupParameterSliders() {
        const sliders = [
            { id: 'soilMoisture', param: 'soilMoisture', unit: '%' },
            { id: 'sunlight', param: 'sunlight', unit: ' ч/день' },
            { id: 'pH', param: 'pH', unit: '' },
            { id: 'airTemp', param: 'airTemp', unit: '°C' },
            { id: 'soilTemp', param: 'soilTemp', unit: '°C' },
            { id: 'nitrogen', param: 'nitrogen', unit: ' мг/кг' },
            { id: 'phosphorus', param: 'phosphorus', unit: ' мг/кг' },
            { id: 'potassium', param: 'potassium', unit: ' мг/кг' }
        ];

        sliders.forEach(({ id, param, unit }) => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(`${id}Value`);

            if (slider && valueDisplay) {
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.currentParams[param] = value;
                    valueDisplay.textContent = value;
                });
            }
        });
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Кнопка анализа
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn?.addEventListener('click', () => this.analyzeConditions());

        // Форма добавления растения
        const toggleAddPlantBtn = document.getElementById('toggleAddPlantBtn');
        const addPlantForm = document.getElementById('addPlantForm');
        const newPlantForm = document.getElementById('newPlantForm');
        const cancelAddPlant = document.getElementById('cancelAddPlant');

        toggleAddPlantBtn?.addEventListener('click', () => {
            addPlantForm.style.display = addPlantForm.style.display === 'none' ? 'block' : 'none';
        });

        cancelAddPlant?.addEventListener('click', () => {
            addPlantForm.style.display = 'none';
        });

        newPlantForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCustomPlant();
        });

        // Выбор модели ИИ
        const modelSelect = document.getElementById('modelSelect');
        modelSelect?.addEventListener('change', (e) => {
            this.updateModelInfo(e.target.value);
        });

        // Форма настройки модели
        const modelSelectionForm = document.getElementById('modelSelectionForm');
        modelSelectionForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveModelSettings();
        });

        const closeModalBtn = document.getElementById('closeModalBtn');
        closeModalBtn?.addEventListener('click', () => {
            this.hideApiKeyModal();
        });

        // Кнопка смены модели
        const changeModelBtn = document.getElementById('changeModelBtn');
        changeModelBtn?.addEventListener('click', () => {
            this.showApiKeyModal();
        });

        // Кнопка переключения темы
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        themeToggleBtn?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Слайдер временной шкалы (ручной режим)
        const timelineSlider = document.getElementById('timelineSlider');
        timelineSlider?.addEventListener('input', (e) => {
            const day = parseInt(e.target.value);
            if (window.plantAnimator && this.selectedPlant && this.analysisResults) {
                window.plantAnimator.updatePlant(day, this.selectedPlant, this.analysisResults.score);

                // Обновляем отображение дня
                const dayDisplay = document.getElementById('currentDayDisplay');
                if (dayDisplay) {
                    dayDisplay.textContent = day;
                }
            }
        });

        // Кнопка перезапуска анимации
        const restartAnimationBtn = document.getElementById('restartAnimationBtn');
        restartAnimationBtn?.addEventListener('click', () => {
            if (window.plantAnimator) {
                window.plantAnimator.resumeAutoAnimation();
            }
        });

        // Экспорт
        const exportBtn = document.getElementById('exportBtn');
        exportBtn?.addEventListener('click', () => this.exportToPDF());

        const saveHistoryBtn = document.getElementById('saveHistoryBtn');
        saveHistoryBtn?.addEventListener('click', () => this.saveToHistory());

        // Инициализация выбора модели при загрузке
        this.initializeModelSelection();
    }

    // Инициализация выбора модели
    initializeModelSelection() {
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
            modelSelect.value = aiAnalyzer.selectedModel;
            this.updateModelInfo(aiAnalyzer.selectedModel);
        }

        // Загружаем API ключ (приоритет: config.js -> localStorage)
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            const currentKey = aiAnalyzer.getApiKey();
            if (currentKey) {
                apiKeyInput.value = currentKey;
            }
        }
    }

    // Обновление информации о модели
    updateModelInfo(modelId) {
        const model = aiAnalyzer.models[modelId];
        if (!model) return;

        const modelDescription = document.getElementById('modelDescription');
        const apiKeySection = document.getElementById('apiKeySection');
        const apiKeyLinks = document.getElementById('apiKeyLinks');
        const apiKeyInput = document.getElementById('apiKeyInput');

        if (modelDescription) {
            modelDescription.textContent = model.description;
        }

        // Показываем/скрываем секцию API ключа
        if (apiKeySection) {
            apiKeySection.style.display = model.requiresKey ? 'block' : 'none';
        }

        // Подставляем ключ из CONFIG или оставляем поле пустым
        if (apiKeyInput && model.requiresKey) {
            // Проверяем наличие ключа в config.js
            if (typeof CONFIG !== 'undefined' && CONFIG.apiKeys && CONFIG.apiKeys[modelId]) {
                apiKeyInput.value = CONFIG.apiKeys[modelId];
            } else {
                apiKeyInput.value = '';
            }
        }

        // Обновляем ссылки на получение API ключа
        if (apiKeyLinks && model.requiresKey) {
            const links = {
                gemini: 'https://aistudio.google.com/app/apikey',
                huggingface: 'https://huggingface.co/settings/tokens',
                cohere: 'https://dashboard.cohere.com/api-keys'
            };

            apiKeyLinks.innerHTML = links[modelId] ?
                `<a href="${links[modelId]}" target="_blank" class="btn btn-link">Получить бесплатный API ключ</a>` : '';
        }
    }

    // Сохранение настроек модели
    saveModelSettings() {
        const modelSelect = document.getElementById('modelSelect');
        const apiKeyInput = document.getElementById('apiKeyInput');

        const selectedModel = modelSelect.value;
        const apiKey = apiKeyInput.value.trim();

        // Сохраняем выбранную модель
        aiAnalyzer.saveSelectedModel(selectedModel);

        // Сохраняем API ключ если требуется
        const model = aiAnalyzer.models[selectedModel];
        if (model.requiresKey && apiKey) {
            aiAnalyzer.saveApiKey(apiKey);
        }

        this.hideApiKeyModal();
        alert(`Модель "${model.name}" успешно выбрана!`);
    }

    // Проверка API ключа
    checkApiKey() {
        // Всегда показываем модальное окно при первом запуске
        const hasSeenModal = localStorage.getItem('has_seen_model_modal');
        if (!hasSeenModal) {
            this.showApiKeyModal();
            localStorage.setItem('has_seen_model_modal', 'true');
        }
    }

    // Показать модальное окно для ввода API ключа
    showApiKeyModal() {
        const modal = document.getElementById('apiKeyModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    // Скрыть модальное окно
    hideApiKeyModal() {
        const modal = document.getElementById('apiKeyModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Анализ условий
    async analyzeConditions() {
        if (!this.selectedPlant) {
            alert('Пожалуйста, выберите растение');
            return;
        }

        if (!aiAnalyzer.hasApiKey()) {
            this.showApiKeyModal();
            return;
        }

        // Показываем секцию результатов
        const resultsSection = document.getElementById('resultsSection');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const analysisResults = document.getElementById('analysisResults');

        resultsSection.style.display = 'block';
        loadingIndicator.style.display = 'block';
        analysisResults.style.display = 'none';

        // Прокручиваем к результатам
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        try {
            // Выполняем анализ
            this.analysisResults = await aiAnalyzer.analyzeGrowingConditions(
                this.selectedPlant,
                this.currentParams,
                this.selectedPlant.optimal
            );

            // Скрываем загрузку и показываем результаты
            loadingIndicator.style.display = 'none';
            analysisResults.style.display = 'block';

            // Отображаем результаты
            this.displayResults();

            // Показываем визуализацию
            this.showVisualization();

        } catch (error) {
            console.error('Ошибка анализа:', error);
            loadingIndicator.style.display = 'none';

            // Показываем понятное сообщение пользователю
            const errorMessage = error.message || 'Неизвестная ошибка';
            const currentModel = aiAnalyzer.getCurrentModel();

            // Определяем альтернативную модель
            let alternativeModel = 'local';
            let alternativeModelName = 'Локальный анализ';

            // Если есть ключ Gemini, предлагаем его
            if (typeof CONFIG !== 'undefined' && CONFIG.apiKeys && CONFIG.apiKeys.gemini && CONFIG.apiKeys.gemini.trim() !== '') {
                alternativeModel = 'gemini';
                alternativeModelName = 'Google Gemini';
            } else if (typeof CONFIG !== 'undefined' && CONFIG.apiKeys && CONFIG.apiKeys.cohere && CONFIG.apiKeys.cohere.trim() !== '') {
                alternativeModel = 'cohere';
                alternativeModelName = 'Cohere';
            }

            if (confirm(`Ошибка при анализе с моделью "${currentModel.name}":\n${errorMessage}\n\nПереключиться на ${alternativeModelName}?`)) {
                // Переключаемся на альтернативную модель
                aiAnalyzer.saveSelectedModel(alternativeModel);

                // Повторяем анализ
                loadingIndicator.style.display = 'block';
                this.analyzeConditions();
            } else {
                alert('Вы можете сменить модель ИИ через кнопку 🤖 в шапке приложения.');
            }
        }
    }

    // Отображение результатов анализа
    displayResults() {
        if (!this.analysisResults) return;

        // Общая оценка
        const scoreValue = document.getElementById('scoreValue');
        const scoreDescription = document.getElementById('scoreDescription');
        const scoreCircle = document.getElementById('scoreCircle');

        if (scoreValue) scoreValue.textContent = this.analysisResults.score;

        if (scoreDescription && scoreCircle) {
            if (this.analysisResults.score >= 80) {
                scoreDescription.textContent = 'Отличные условия!';
                scoreCircle.style.color = '#10b981';
            } else if (this.analysisResults.score >= 60) {
                scoreDescription.textContent = 'Хорошие условия';
                scoreCircle.style.color = '#f59e0b';
            } else {
                scoreDescription.textContent = 'Требуется улучшение';
                scoreCircle.style.color = '#ef4444';
            }
        }

        // Рекомендации
        const recommendationsList = document.getElementById('recommendationsList');
        if (recommendationsList) {
            recommendationsList.innerHTML = this.analysisResults.recommendations.length > 0
                ? this.analysisResults.recommendations.map(rec => `
                    <div class="recommendation-item">${rec}</div>
                `).join('')
                : '<div class="recommendation-item">Все параметры в норме!</div>';
        }

        // Риски болезней
        const diseaseWarnings = document.getElementById('diseaseWarnings');
        if (diseaseWarnings) {
            diseaseWarnings.innerHTML = this.analysisResults.diseaseRisks.length > 0
                ? this.analysisResults.diseaseRisks.map(risk => `
                    <div class="warning-item">${risk}</div>
                `).join('')
                : '<div class="warning-item">Рисков не обнаружено</div>';
        }

        // ИИ советы
        const aiInsights = document.getElementById('aiInsights');
        if (aiInsights) {
            aiInsights.innerHTML = this.analysisResults.growthTips.length > 0
                ? this.analysisResults.growthTips.map(tip => `<p>${tip}</p>`).join('')
                : '<p>Продолжайте поддерживать текущие условия</p>';
        }
    }

    // Показать секцию визуализации
    showVisualization() {
        const visualizationSection = document.getElementById('visualizationSection');
        const exportSection = document.getElementById('exportSection');

        if (visualizationSection) {
            visualizationSection.style.display = 'block';
            visualizationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (exportSection) {
            exportSection.style.display = 'flex';
        }

        // Инициализируем 3D сцену если еще не инициализирована
        if (window.plantAnimator) {
            if (!window.plantAnimator.renderer) {
                console.log('Initializing 3D scene...');
                window.plantAnimator.initialize();
            }

            // Принудительный ресайз и рендер после показа секции
            setTimeout(() => {
                if (window.plantAnimator.renderer) {
                    window.plantAnimator.onWindowResize();
                    window.plantAnimator.renderer.render(window.plantAnimator.scene, window.plantAnimator.camera);

                    // Запускаем автоматическую анимацию роста
                    console.log('Starting growth animation...');
                    window.plantAnimator.startGrowthAnimation(this.selectedPlant, this.analysisResults.score);
                }
            }, 100);
        } else {
            console.error('plantAnimator not available');
        }
    }


    // Добавление пользовательского растения
    addCustomPlant() {
        const nameInput = document.getElementById('newPlantName');
        const iconInput = document.getElementById('newPlantIcon');

        const name = nameInput?.value.trim();
        const icon = iconInput?.value.trim();

        if (!name || !icon) {
            alert('Заполните все поля');
            return;
        }

        // Создаем новое растение с базовыми параметрами
        const newPlant = {
            id: `custom_${Date.now()}`,
            name: name,
            nameEn: name,
            icon: icon,
            optimal: {
                soilMoisture: { min: 50, max: 70, ideal: 60 },
                sunlight: { min: 5, max: 8, ideal: 6.5 },
                pH: { min: 6.0, max: 7.0, ideal: 6.5 },
                airTemp: { min: 18, max: 28, ideal: 23 },
                soilTemp: { min: 15, max: 25, ideal: 20 },
                nitrogen: { min: 60, max: 120, ideal: 90 },
                phosphorus: { min: 40, max: 80, ideal: 60 },
                potassium: { min: 60, max: 120, ideal: 90 }
            },
            growthStages: [
                { day: 0, description: 'Посадка', height: 10 },
                { day: 30, description: 'Рост', height: 30 },
                { day: 60, description: 'Развитие', height: 50 },
                { day: 90, description: 'Зрелость', height: 70 }
            ],
            diseases: []
        };

        this.customPlants.push(newPlant);
        this.saveCustomPlants();
        this.renderPlantCards();

        // Очищаем форму и скрываем
        nameInput.value = '';
        iconInput.value = '';
        document.getElementById('addPlantForm').style.display = 'none';

        alert(`Растение "${name}" успешно добавлено!`);
    }

    // Сохранение пользовательских растений
    saveCustomPlants() {
        localStorage.setItem('custom_plants', JSON.stringify(this.customPlants));
    }

    // Загрузка пользовательских растений
    loadCustomPlants() {
        const saved = localStorage.getItem('custom_plants');
        return saved ? JSON.parse(saved) : [];
    }

    // Экспорт в PDF
    exportToPDF() {
        if (!this.analysisResults || !this.selectedPlant) {
            alert('Сначала выполните анализ');
            return;
        }

        // Формируем текст для экспорта
        let content = `
=== ОТЧЕТ ОБ АНАЛИЗЕ УСЛОВИЙ ВЫРАЩИВАНИЯ ===

Растение: ${this.selectedPlant.name}
Дата анализа: ${new Date().toLocaleDateString('ru-RU')}

ОБЩАЯ ОЦЕНКА: ${this.analysisResults.score}/100

ТЕКУЩИЕ ПАРАМЕТРЫ:
- Влажность почвы: ${this.currentParams.soilMoisture}%
- Освещенность: ${this.currentParams.sunlight} ч/день
- pH почвы: ${this.currentParams.pH}
- Температура воздуха: ${this.currentParams.airTemp}°C
- Температура почвы: ${this.currentParams.soilTemp}°C
- Азот (N): ${this.currentParams.nitrogen} мг/кг
- Фосфор (P): ${this.currentParams.phosphorus} мг/кг
- Калий (K): ${this.currentParams.potassium} мг/кг

РЕКОМЕНДАЦИИ:
${this.analysisResults.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

РИСКИ БОЛЕЗНЕЙ:
${this.analysisResults.diseaseRisks.map((r, i) => `${i + 1}. ${r}`).join('\n')}

СОВЕТЫ ДЛЯ УЛУЧШЕНИЯ РОСТА:
${this.analysisResults.growthTips.map((t, i) => `${i + 1}. ${t}`).join('\n')}

---
Сгенерировано AI Garden Assistant
`;

        // Создаем Blob и скачиваем
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `garden-analysis-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Отчет успешно экспортирован!');
    }

    // Сохранение в историю
    saveToHistory() {
        if (!this.analysisResults || !this.selectedPlant) {
            alert('Сначала выполните анализ');
            return;
        }

        const history = this.loadHistory();
        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            plant: this.selectedPlant,
            params: { ...this.currentParams },
            results: this.analysisResults
        };

        history.unshift(entry);

        // Ограничиваем историю 10 записями
        if (history.length > 10) {
            history.pop();
        }

        localStorage.setItem('analysis_history', JSON.stringify(history));
        this.displayHistory(history);

        alert('Анализ сохранен в историю!');
    }

    // Загрузка истории
    loadHistory() {
        const saved = localStorage.getItem('analysis_history');
        const history = saved ? JSON.parse(saved) : [];

        if (history.length > 0) {
            this.displayHistory(history);
        }

        return history;
    }

    // Отображение истории
    displayHistory(history) {
        const historySection = document.getElementById('historySection');
        const historyList = document.getElementById('historyList');

        if (history.length === 0) {
            historySection.style.display = 'none';
            return;
        }

        historySection.style.display = 'block';
        historyList.innerHTML = history.map(entry => `
            <div class="history-item" data-entry-id="${entry.id}">
                <div class="history-date">${new Date(entry.date).toLocaleString('ru-RU')}</div>
                <div class="history-plant">${entry.plant.icon} ${entry.plant.name}</div>
                <div>Оценка: ${entry.results.score}/100</div>
            </div>
        `).join('');

        // Обработчики клика на записи истории
        historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const entryId = parseInt(item.dataset.entryId);
                this.loadHistoryEntry(entryId);
            });
        });
    }

    // Загрузка записи из истории
    loadHistoryEntry(entryId) {
        const history = this.loadHistory();
        const entry = history.find(e => e.id === entryId);

        if (!entry) return;

        // Восстанавливаем состояние
        this.selectedPlant = entry.plant;
        this.currentParams = entry.params;
        this.analysisResults = entry.results;

        // Обновляем интерфейс
        this.selectPlant(entry.plant.id);
        this.updateSliderValues();

        // Показываем результаты
        const resultsSection = document.getElementById('resultsSection');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const analysisResults = document.getElementById('analysisResults');

        resultsSection.style.display = 'block';
        loadingIndicator.style.display = 'none';
        analysisResults.style.display = 'block';

        this.displayResults();
        this.showVisualization();

        // Прокручиваем к результатам
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Обновление значений слайдеров
    updateSliderValues() {
        Object.keys(this.currentParams).forEach(param => {
            const slider = document.getElementById(param);
            const valueDisplay = document.getElementById(`${param}Value`);

            if (slider && valueDisplay) {
                slider.value = this.currentParams[param];
                valueDisplay.textContent = this.currentParams[param];
            }
        });
    }

    // Загрузка сохраненной темы
    loadTheme() {
        // Сначала проверяем localStorage (приоритет у выбора пользователя)
        let savedTheme = localStorage.getItem('theme');

        // Если не сохранена, проверяем config.js
        if (!savedTheme && typeof CONFIG !== 'undefined' && CONFIG.defaultTheme) {
            savedTheme = CONFIG.defaultTheme;
        }

        // Применяем тему (по умолчанию светлая)
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            this.updateThemeIcon(true);
        } else {
            document.body.classList.remove('dark-theme');
            this.updateThemeIcon(false);
        }
    }

    // Переключение темы
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateThemeIcon(isDark);
    }

    // Обновление иконки темы
    updateThemeIcon(isDark) {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = isDark ? '☀️' : '🌙';
        }
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const app = new GardenAssistantApp();
    app.initialize();

    // Делаем app глобальным для отладки
    window.gardenApp = app;
});
