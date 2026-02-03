// ========================================
// КОНФИГУРАЦИЯ API КЛЮЧЕЙ
// ========================================
//
// Этот файл содержит API ключи для различных моделей ИИ.
// При переносе проекта просто скопируйте этот файл вместе с остальными файлами.
//
// ВАЖНО: Не публикуйте этот файл в общедоступных репозиториях!
// Добавьте его в .gitignore если используете Git.
//
// ========================================

const CONFIG = {
    // API ключи для разных моделей
    apiKeys: {
        // Google Gemini API Key
        // Получить можно здесь: https://aistudio.google.com/app/apikey
        gemini: 'AIzaSyBPwVqsZhgpXWGK4VCq_SCdXBz6ukDhy9c',

        // Hugging Face API Token
        // Получить можно здесь: https://huggingface.co/settings/tokens
        huggingface: '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',

        // Cohere API Key
        // Получить можно здесь: https://dashboard.cohere.com/api-keys
        cohere: 'lJbBhBcXMVYDSlMJokOxyCFLjcFDaEUwebeFHfk9'
    },

    // Выбранная модель по умолчанию
    // Возможные значения: 'local', 'gemini', 'huggingface', 'cohere'
    defaultModel: 'gemini',

    // Тема по умолчанию
    // Возможные значения: 'light', 'dark'
    defaultTheme: 'light'
};

// Проверяем, что CONFIG доступен глобально
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
