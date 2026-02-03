// База данных растений с оптимальными параметрами выращивания
const plantsDatabase = {
    rose: {
        id: 'rose',
        name: 'Роза',
        nameEn: 'Rose',
        icon: '🌹',
        optimal: {
            soilMoisture: { min: 60, max: 75, ideal: 68 }, // Влажность почвы (%)
            sunlight: { min: 6, max: 8, ideal: 7 }, // Часов солнца в день
            pH: { min: 6.0, max: 6.5, ideal: 6.3 }, // Кислотность почвы
            airTemp: { min: 15, max: 28, ideal: 22 }, // Температура воздуха (°C)
            soilTemp: { min: 15, max: 24, ideal: 20 }, // Температура почвы (°C)
            nitrogen: { min: 50, max: 100, ideal: 75 }, // Азот (N)
            phosphorus: { min: 40, max: 80, ideal: 60 }, // Фосфор (P)
            potassium: { min: 50, max: 100, ideal: 75 } // Калий (K)
        },
        growthStages: [
            { day: 0, description: 'Посадка', height: 10 },
            { day: 30, description: 'Начальный рост', height: 30 },
            { day: 60, description: 'Формирование бутонов', height: 50 },
            { day: 90, description: 'Цветение', height: 70 }
        ],
        diseases: [
            { name: 'Мучнистая роса', conditions: 'высокая влажность + низкая температура' },
            { name: 'Черная пятнистость', conditions: 'повышенная влажность + плохая циркуляция воздуха' }
        ]
    },
    petunia: {
        id: 'petunia',
        name: 'Петуния',
        nameEn: 'Petunia',
        icon: '🌺',
        optimal: {
            soilMoisture: { min: 50, max: 70, ideal: 60 },
            sunlight: { min: 5, max: 7, ideal: 6 },
            pH: { min: 5.5, max: 6.5, ideal: 6.0 },
            airTemp: { min: 18, max: 30, ideal: 24 },
            soilTemp: { min: 16, max: 26, ideal: 21 },
            nitrogen: { min: 60, max: 120, ideal: 90 },
            phosphorus: { min: 50, max: 90, ideal: 70 },
            potassium: { min: 60, max: 110, ideal: 85 }
        },
        growthStages: [
            { day: 0, description: 'Посадка', height: 8 },
            { day: 20, description: 'Развитие листьев', height: 20 },
            { day: 40, description: 'Формирование бутонов', height: 35 },
            { day: 60, description: 'Обильное цветение', height: 45 }
        ],
        diseases: [
            { name: 'Серая гниль', conditions: 'избыточная влажность + прохлада' },
            { name: 'Хлороз', conditions: 'высокий pH + недостаток железа' }
        ]
    },
    // tomato: {
    //     id: 'tomato',
    //     name: 'Помидор',
    //     nameEn: 'Tomato',
    //     icon: '🍅',
    //     optimal: {
    //         soilMoisture: { min: 65, max: 85, ideal: 75 },
    //         sunlight: { min: 6, max: 10, ideal: 8 },
    //         pH: { min: 6.0, max: 7.0, ideal: 6.5 },
    //         airTemp: { min: 18, max: 28, ideal: 23 },
    //         soilTemp: { min: 15, max: 28, ideal: 22 },
    //         nitrogen: { min: 80, max: 150, ideal: 115 },
    //         phosphorus: { min: 60, max: 100, ideal: 80 },
    //         potassium: { min: 90, max: 160, ideal: 125 }
    //     },
    //     growthStages: [
    //         { day: 0, description: 'Посадка рассады', height: 15 },
    //         { day: 30, description: 'Вегетативный рост', height: 45 },
    //         { day: 60, description: 'Цветение и завязь', height: 80 },
    //         { day: 90, description: 'Созревание плодов', height: 100 }
    //     ],
    //     diseases: [
    //         { name: 'Фитофтороз', conditions: 'высокая влажность + низкая температура' },
    //         { name: 'Вершинная гниль', conditions: 'недостаток кальция + нерегулярный полив' }
    //     ]
    // },
    // cucumber: {
    //     id: 'cucumber',
    //     name: 'Огурец',
    //     nameEn: 'Cucumber',
    //     icon: '🥒',
    //     optimal: {
    //         soilMoisture: { min: 70, max: 90, ideal: 80 },
    //         sunlight: { min: 5, max: 8, ideal: 6.5 },
    //         pH: { min: 6.0, max: 7.0, ideal: 6.5 },
    //         airTemp: { min: 20, max: 30, ideal: 25 },
    //         soilTemp: { min: 18, max: 28, ideal: 23 },
    //         nitrogen: { min: 100, max: 180, ideal: 140 },
    //         phosphorus: { min: 50, max: 90, ideal: 70 },
    //         potassium: { min: 80, max: 150, ideal: 115 }
    //     },
    //     growthStages: [
    //         { day: 0, description: 'Посадка семян', height: 5 },
    //         { day: 20, description: 'Развитие плетей', height: 40 },
    //         { day: 40, description: 'Цветение', height: 70 },
    //         { day: 60, description: 'Плодоношение', height: 90 }
    //     ],
    //     diseases: [
    //         { name: 'Мучнистая роса', conditions: 'перепады температуры + высокая влажность' },
    //         { name: 'Корневая гниль', conditions: 'переувлажнение + низкая температура почвы' }
    //     ]
    // },
    tulip: {
        id: 'tulip',
        name: 'Тюльпан',
        nameEn: 'Tulip',
        icon: '🌷',
        optimal: {
            soilMoisture: { min: 50, max: 70, ideal: 60 },
            sunlight: { min: 5, max: 7, ideal: 6 },
            pH: { min: 6.5, max: 7.5, ideal: 7.0 },
            airTemp: { min: 10, max: 20, ideal: 15 },
            soilTemp: { min: 8, max: 18, ideal: 13 },
            nitrogen: { min: 40, max: 80, ideal: 60 },
            phosphorus: { min: 50, max: 100, ideal: 75 },
            potassium: { min: 60, max: 110, ideal: 85 }
        },
        growthStages: [
            { day: 0, description: 'Посадка луковицы', height: 5 },
            { day: 30, description: 'Прорастание', height: 15 },
            { day: 60, description: 'Рост стебля', height: 35 },
            { day: 90, description: 'Цветение', height: 50 }
        ],
        diseases: [
            { name: 'Серая гниль', conditions: 'избыточная влажность + прохладная погода' },
            { name: 'Фузариоз', conditions: 'высокая температура почвы + переувлажнение' }
        ]
    },
    // strawberry: {
    //     id: 'strawberry',
    //     name: 'Клубника',
    //     nameEn: 'Strawberry',
    //     icon: '🍓',
    //     optimal: {
    //         soilMoisture: { min: 60, max: 80, ideal: 70 },
    //         sunlight: { min: 6, max: 10, ideal: 8 },
    //         pH: { min: 5.5, max: 6.5, ideal: 6.0 },
    //         airTemp: { min: 15, max: 26, ideal: 20 },
    //         soilTemp: { min: 12, max: 24, ideal: 18 },
    //         nitrogen: { min: 60, max: 100, ideal: 80 },
    //         phosphorus: { min: 50, max: 90, ideal: 70 },
    //         potassium: { min: 70, max: 120, ideal: 95 }
    //     },
    //     growthStages: [
    //         { day: 0, description: 'Посадка рассады', height: 10 },
    //         { day: 30, description: 'Развитие листьев', height: 20 },
    //         { day: 60, description: 'Цветение', height: 25 },
    //         { day: 90, description: 'Плодоношение', height: 30 }
    //     ],
    //     diseases: [
    //         { name: 'Серая гниль', conditions: 'высокая влажность + застой воздуха' },
    //         { name: 'Мучнистая роса', conditions: 'резкие перепады температуры' }
    //     ]
    // },
    lavender: {
        id: 'lavender',
        name: 'Лаванда',
        nameEn: 'Lavender',
        icon: '💜',
        optimal: {
            soilMoisture: { min: 30, max: 50, ideal: 40 },
            sunlight: { min: 6, max: 10, ideal: 8 },
            pH: { min: 6.5, max: 8.0, ideal: 7.2 },
            airTemp: { min: 15, max: 30, ideal: 22 },
            soilTemp: { min: 13, max: 26, ideal: 19 },
            nitrogen: { min: 30, max: 60, ideal: 45 },
            phosphorus: { min: 40, max: 70, ideal: 55 },
            potassium: { min: 50, max: 90, ideal: 70 }
        },
        growthStages: [
            { day: 0, description: 'Посадка', height: 8 },
            { day: 30, description: 'Укоренение', height: 20 },
            { day: 60, description: 'Развитие куста', height: 40 },
            { day: 90, description: 'Цветение', height: 60 }
        ],
        diseases: [
            { name: 'Корневая гниль', conditions: 'избыточная влажность' },
            { name: 'Серая плесень', conditions: 'высокая влажность + плохая вентиляция' }
        ]
    },
    dahlia: {
        id: 'dahlia',
        name: 'Георгина',
        nameEn: 'Dahlia',
        icon: '🌸',
        optimal: {
            soilMoisture: { min: 60, max: 75, ideal: 68 },
            sunlight: { min: 6, max: 8, ideal: 7 },
            pH: { min: 6.5, max: 7.5, ideal: 7.0 },
            airTemp: { min: 18, max: 28, ideal: 23 },
            soilTemp: { min: 16, max: 25, ideal: 20 },
            nitrogen: { min: 70, max: 130, ideal: 100 },
            phosphorus: { min: 60, max: 100, ideal: 80 },
            potassium: { min: 70, max: 120, ideal: 95 }
        },
        growthStages: [
            { day: 0, description: 'Посадка клубней', height: 5 },
            { day: 30, description: 'Рост стебля', height: 35 },
            { day: 60, description: 'Формирование бутонов', height: 70 },
            { day: 90, description: 'Обильное цветение', height: 100 }
        ],
        diseases: [
            { name: 'Мучнистая роса', conditions: 'высокая влажность + плохая циркуляция' },
            { name: 'Серая гниль', conditions: 'переувлажнение + низкая температура' }
        ]
    },
    aster: {
        id: 'aster',
        name: 'Астра',
        nameEn: 'Aster',
        icon: '✨',
        optimal: {
            soilMoisture: { min: 55, max: 70, ideal: 63 },
            sunlight: { min: 5, max: 7, ideal: 6 },
            pH: { min: 6.0, max: 7.5, ideal: 6.8 },
            airTemp: { min: 15, max: 25, ideal: 20 },
            soilTemp: { min: 14, max: 23, ideal: 18 },
            nitrogen: { min: 60, max: 110, ideal: 85 },
            phosphorus: { min: 50, max: 90, ideal: 70 },
            potassium: { min: 60, max: 100, ideal: 80 }
        },
        growthStages: [
            { day: 0, description: 'Посадка семян', height: 5 },
            { day: 25, description: 'Рост розетки', height: 20 },
            { day: 50, description: 'Вытягивание стебля', height: 40 },
            { day: 75, description: 'Цветение', height: 60 }
        ],
        diseases: [
            { name: 'Фузариоз', conditions: 'повышенная влажность + тепло' },
            { name: 'Мучнистая роса', conditions: 'перепады температуры' }
        ]
    },
    marigold: {
        id: 'marigold',
        name: 'Бархатцы',
        nameEn: 'Marigold',
        icon: '🧡',
        optimal: {
            soilMoisture: { min: 50, max: 65, ideal: 58 },
            sunlight: { min: 6, max: 10, ideal: 8 },
            pH: { min: 6.0, max: 7.5, ideal: 6.8 },
            airTemp: { min: 18, max: 30, ideal: 24 },
            soilTemp: { min: 15, max: 28, ideal: 22 },
            nitrogen: { min: 50, max: 90, ideal: 70 },
            phosphorus: { min: 60, max: 100, ideal: 80 },
            potassium: { min: 60, max: 110, ideal: 85 }
        },
        growthStages: [
            { day: 0, description: 'Посадка', height: 5 },
            { day: 20, description: 'Развитие листьев', height: 15 },
            { day: 40, description: 'Бутонизация', height: 30 },
            { day: 60, description: 'Цветение', height: 45 }
        ],
        diseases: [
            { name: 'Серая гниль', conditions: 'избыточная влажность' },
            { name: 'Паутинный клещ', conditions: 'жаркая сухая погода' }
        ]
    },
    zinnia: {
        id: 'zinnia',
        name: 'Цинния',
        nameEn: 'Zinnia',
        icon: '🌼',
        optimal: {
            soilMoisture: { min: 55, max: 70, ideal: 63 },
            sunlight: { min: 6, max: 10, ideal: 8 },
            pH: { min: 5.5, max: 7.5, ideal: 6.5 },
            airTemp: { min: 20, max: 32, ideal: 26 },
            soilTemp: { min: 18, max: 30, ideal: 24 },
            nitrogen: { min: 70, max: 120, ideal: 95 },
            phosphorus: { min: 60, max: 100, ideal: 80 },
            potassium: { min: 70, max: 110, ideal: 90 }
        },
        growthStages: [
            { day: 0, description: 'Посадка', height: 5 },
            { day: 25, description: 'Рост стебля', height: 25 },
            { day: 50, description: 'Формирование бутонов', height: 50 },
            { day: 75, description: 'Цветение', height: 75 }
        ],
        diseases: [
            { name: 'Мучнистая роса', conditions: 'высокая влажность' },
            { name: 'Пятнистость листьев', conditions: 'переувлажнение' }
        ]
    },
    cosmos: {
        id: 'cosmos',
        name: 'Космея',
        nameEn: 'Cosmos',
        icon: '🌺',
        optimal: {
            soilMoisture: { min: 45, max: 60, ideal: 53 },
            sunlight: { min: 6, max: 10, ideal: 8 },
            pH: { min: 6.0, max: 8.0, ideal: 7.0 },
            airTemp: { min: 15, max: 28, ideal: 22 },
            soilTemp: { min: 14, max: 26, ideal: 20 },
            nitrogen: { min: 40, max: 80, ideal: 60 },
            phosphorus: { min: 50, max: 90, ideal: 70 },
            potassium: { min: 50, max: 90, ideal: 70 }
        },
        growthStages: [
            { day: 0, description: 'Посадка', height: 5 },
            { day: 30, description: 'Рост', height: 40 },
            { day: 60, description: 'Бутонизация', height: 80 },
            { day: 90, description: 'Цветение', height: 120 }
        ],
        diseases: [
            { name: 'Мучнистая роса', conditions: 'влажность + плохая вентиляция' },
            { name: 'Фузариоз', conditions: 'переувлажнение почвы' }
        ]
    },
    gladiolus: {
        id: 'gladiolus',
        name: 'Гладиолус',
        nameEn: 'Gladiolus',
        icon: '⚔️',
        optimal: {
            soilMoisture: { min: 60, max: 75, ideal: 68 },
            sunlight: { min: 6, max: 9, ideal: 7.5 },
            pH: { min: 6.5, max: 7.0, ideal: 6.8 },
            airTemp: { min: 18, max: 28, ideal: 23 },
            soilTemp: { min: 15, max: 25, ideal: 20 },
            nitrogen: { min: 80, max: 140, ideal: 110 },
            phosphorus: { min: 70, max: 110, ideal: 90 },
            potassium: { min: 90, max: 150, ideal: 120 }
        },
        growthStages: [
            { day: 0, description: 'Посадка луковиц', height: 5 },
            { day: 30, description: 'Рост листьев', height: 35 },
            { day: 60, description: 'Формирование стрелки', height: 70 },
            { day: 90, description: 'Цветение', height: 100 }
        ],
        diseases: [
            { name: 'Фузариоз', conditions: 'высокая влажность + тепло' },
            { name: 'Трипсы', conditions: 'жаркая погода' }
        ]
    },
    iris: {
        id: 'iris',
        name: 'Ирис',
        nameEn: 'Iris',
        icon: '🦋',
        optimal: {
            soilMoisture: { min: 50, max: 70, ideal: 60 },
            sunlight: { min: 5, max: 8, ideal: 6.5 },
            pH: { min: 6.0, max: 7.5, ideal: 6.8 },
            airTemp: { min: 15, max: 25, ideal: 20 },
            soilTemp: { min: 12, max: 23, ideal: 18 },
            nitrogen: { min: 60, max: 100, ideal: 80 },
            phosphorus: { min: 70, max: 110, ideal: 90 },
            potassium: { min: 80, max: 130, ideal: 105 }
        },
        growthStages: [
            { day: 0, description: 'Посадка корневищ', height: 8 },
            { day: 30, description: 'Рост листьев', height: 30 },
            { day: 60, description: 'Формирование цветоноса', height: 50 },
            { day: 90, description: 'Цветение', height: 70 }
        ],
        diseases: [
            { name: 'Бактериальная гниль', conditions: 'переувлажнение' },
            { name: 'Ржавчина', conditions: 'влажность + плохая циркуляция' }
        ]
    },
    lily: {
        id: 'lily',
        name: 'Лилия',
        nameEn: 'Lily',
        icon: '🎺',
        optimal: {
            soilMoisture: { min: 60, max: 75, ideal: 68 },
            sunlight: { min: 5, max: 8, ideal: 6.5 },
            pH: { min: 6.0, max: 7.0, ideal: 6.5 },
            airTemp: { min: 16, max: 26, ideal: 21 },
            soilTemp: { min: 14, max: 24, ideal: 19 },
            nitrogen: { min: 70, max: 120, ideal: 95 },
            phosphorus: { min: 80, max: 130, ideal: 105 },
            potassium: { min: 90, max: 140, ideal: 115 }
        },
        growthStages: [
            { day: 0, description: 'Посадка луковиц', height: 5 },
            { day: 30, description: 'Прорастание', height: 25 },
            { day: 60, description: 'Рост стебля', height: 55 },
            { day: 90, description: 'Цветение', height: 90 }
        ],
        diseases: [
            { name: 'Серая гниль', conditions: 'высокая влажность' },
            { name: 'Фузариоз', conditions: 'переувлажнение + тепло' }
        ]
    },
    // narcissus: {
    //    id: 'narcissus',
    //    name: 'Нарцисс',
    //    nameEn: 'Narcissus',
    //    icon: '🌼',
    //    optimal: {
    //        soilMoisture: { min: 55, max: 70, ideal: 63 },
    //        sunlight: { min: 5, max: 7, ideal: 6 },
    //        pH: { min: 6.0, max: 7.5, ideal: 6.8 },
    //        airTemp: { min: 10, max: 20, ideal: 15 },
    //        soilTemp: { min: 8, max: 18, ideal: 13 },
    //        nitrogen: { min: 50, max: 90, ideal: 70 },
    //       phosphorus: { min: 60, max: 100, ideal: 80 },
    //        potassium: { min: 70, max: 110, ideal: 90 }
    //    },
    //    growthStages: [
    //        { day: 0, description: 'Посадка луковиц', height: 5 },
    //        { day: 30, description: 'Прорастание', height: 15 },
    //        { day: 60, description: 'Рост стебля', height: 30 },
    //        { day: 90, description: 'Цветение', height: 45 }
    //    ],
    //    diseases: [
    //        { name: 'Серая гниль', conditions: 'избыточная влажность' },
    //        { name: 'Фузариоз', conditions: 'теплая влажная почва' }
    //    ]
    //},
    chrysanthemum: {
        id: 'chrysanthemum',
        name: 'Хризантема',
        nameEn: 'Chrysanthemum',
        icon: '🏵️',
        optimal: {
            soilMoisture: { min: 60, max: 75, ideal: 68 },
            sunlight: { min: 5, max: 8, ideal: 6.5 },
            pH: { min: 6.5, max: 7.5, ideal: 7.0 },
            airTemp: { min: 15, max: 25, ideal: 20 },
            soilTemp: { min: 14, max: 23, ideal: 18 },
            nitrogen: { min: 80, max: 140, ideal: 110 },
            phosphorus: { min: 60, max: 100, ideal: 80 },
            potassium: { min: 80, max: 130, ideal: 105 }
        },
        growthStages: [
            { day: 0, description: 'Посадка черенков', height: 8 },
            { day: 30, description: 'Укоренение и рост', height: 30 },
            { day: 60, description: 'Развитие куста', height: 50 },
            { day: 90, description: 'Цветение', height: 70 }
        ],
        diseases: [
            { name: 'Мучнистая роса', conditions: 'влажность + перепады температуры' },
            { name: 'Септориоз', conditions: 'высокая влажность' }
        ]
    },
    peony: {
        id: 'peony',
        name: 'Пион',
        nameEn: 'Peony',
        icon: '🌹',
        optimal: {
            soilMoisture: { min: 55, max: 70, ideal: 63 },
            sunlight: { min: 6, max: 8, ideal: 7 },
            pH: { min: 6.5, max: 7.5, ideal: 7.0 },
            airTemp: { min: 15, max: 25, ideal: 20 },
            soilTemp: { min: 12, max: 22, ideal: 17 },
            nitrogen: { min: 60, max: 100, ideal: 80 },
            phosphorus: { min: 80, max: 130, ideal: 105 },
            potassium: { min: 90, max: 140, ideal: 115 }
        },
        growthStages: [
            { day: 0, description: 'Посадка корневищ', height: 5 },
            { day: 30, description: 'Прорастание почек', height: 20 },
            { day: 60, description: 'Рост стеблей', height: 50 },
            { day: 90, description: 'Цветение', height: 80 }
        ],
        diseases: [
            { name: 'Серая гниль', conditions: 'высокая влажность + прохлада' },
            { name: 'Ржавчина', conditions: 'влажность + застой воздуха' }
        ]
    },
    phlox: {
        id: 'phlox',
        name: 'Флокс',
        nameEn: 'Phlox',
        icon: '💐',
        optimal: {
            soilMoisture: { min: 60, max: 75, ideal: 68 },
            sunlight: { min: 5, max: 8, ideal: 6.5 },
            pH: { min: 6.0, max: 7.5, ideal: 6.8 },
            airTemp: { min: 16, max: 26, ideal: 21 },
            soilTemp: { min: 14, max: 24, ideal: 19 },
            nitrogen: { min: 70, max: 120, ideal: 95 },
            phosphorus: { min: 60, max: 100, ideal: 80 },
            potassium: { min: 70, max: 120, ideal: 95 }
        },
        growthStages: [
            { day: 0, description: 'Посадка', height: 8 },
            { day: 30, description: 'Рост розетки', height: 25 },
            { day: 60, description: 'Развитие побегов', height: 50 },
            { day: 90, description: 'Цветение', height: 75 }
        ],
        diseases: [
            { name: 'Мучнистая роса', conditions: 'высокая влажность' },
            { name: 'Пятнистость', conditions: 'переувлажнение' }
        ]
    },
    hydrangea: {
        id: 'hydrangea',
        name: 'Гортензия',
        nameEn: 'Hydrangea',
        icon: '💠',
        optimal: {
            soilMoisture: { min: 65, max: 80, ideal: 73 },
            sunlight: { min: 4, max: 6, ideal: 5 },
            pH: { min: 5.0, max: 6.5, ideal: 5.8 },
            airTemp: { min: 16, max: 26, ideal: 21 },
            soilTemp: { min: 14, max: 24, ideal: 19 },
            nitrogen: { min: 70, max: 120, ideal: 95 },
            phosphorus: { min: 60, max: 100, ideal: 80 },
            potassium: { min: 80, max: 130, ideal: 105 }
        },
        growthStages: [
            { day: 0, description: 'Посадка саженца', height: 15 },
            { day: 30, description: 'Укоренение', height: 30 },
            { day: 60, description: 'Рост побегов', height: 55 },
            { day: 90, description: 'Цветение', height: 80 }
        ],
        diseases: [
            { name: 'Мучнистая роса', conditions: 'влажность + застой воздуха' },
            { name: 'Серая гниль', conditions: 'переувлажнение' }
        ]
    },
    hollyhock: {
        id: 'hollyhock',
        name: 'Мальва (Шток-роза)',
        nameEn: 'Hollyhock',
        icon: '🌺',
        optimal: {
            soilMoisture: { min: 50, max: 70, ideal: 60 },
            sunlight: { min: 6, max: 10, ideal: 8 },
            pH: { min: 6.0, max: 8.0, ideal: 7.0 },
            airTemp: { min: 15, max: 28, ideal: 22 },
            soilTemp: { min: 14, max: 26, ideal: 20 },
            nitrogen: { min: 60, max: 110, ideal: 85 },
            phosphorus: { min: 70, max: 120, ideal: 95 },
            potassium: { min: 70, max: 120, ideal: 95 }
        },
        growthStages: [
            { day: 0, description: 'Посадка', height: 8 },
            { day: 30, description: 'Рост розетки', height: 30 },
            { day: 60, description: 'Вытягивание стебля', height: 90 },
            { day: 90, description: 'Цветение', height: 150 }
        ],
        diseases: [
            { name: 'Ржавчина', conditions: 'влажность + загущенность' },
            { name: 'Мучнистая роса', conditions: 'высокая влажность' }
        ]
    },
    delphinium: {
        id: 'delphinium',
        name: 'Дельфиниум',
        nameEn: 'Delphinium',
        icon: '🔵',
        optimal: {
            soilMoisture: { min: 60, max: 75, ideal: 68 },
            sunlight: { min: 6, max: 8, ideal: 7 },
            pH: { min: 6.5, max: 7.5, ideal: 7.0 },
            airTemp: { min: 15, max: 24, ideal: 19 },
            soilTemp: { min: 13, max: 22, ideal: 17 },
            nitrogen: { min: 80, max: 140, ideal: 110 },
            phosphorus: { min: 70, max: 120, ideal: 95 },
            potassium: { min: 90, max: 150, ideal: 120 }
        },
        growthStages: [
            { day: 0, description: 'Посадка', height: 8 },
            { day: 30, description: 'Рост листьев', height: 40 },
            { day: 60, description: 'Формирование соцветий', height: 80 },
            { day: 90, description: 'Цветение', height: 130 }
        ],
        diseases: [
            { name: 'Мучнистая роса', conditions: 'высокая влажность' },
            { name: 'Черная пятнистость', conditions: 'переувлажнение' }
        ]
    }
};

// Функция для получения информации о растении
function getPlantById(plantId) {
    return plantsDatabase[plantId] || null;
}

// Функция для получения списка всех растений
function getAllPlants() {
    return Object.values(plantsDatabase);
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { plantsDatabase, getPlantById, getAllPlants };
}
