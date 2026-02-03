// Система 3D анимации роста растений с использованием Three.js
console.log('🌱 Loading animation.js...');

class PlantAnimator3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.plant = null;
        this.ground = null;
        this.currentDay = 0;
        this.healthScore = 100;
        this.plantData = null;
        this.animationId = null;

        // Параметры автоматической анимации
        this.autoPlay = true;
        this.growthSpeed = 2; // дней в секунду
        this.rotationSpeed = 0.1; // радианов в секунду
        this.maxDay = 90;
        this.cameraAngle = 0;
        this.lastUpdateTime = Date.now();
        this.userInteracting = false;
        this.lastRenderedDay = -1;
    }

    // Инициализация 3D сцены
    initialize() {
        const container = document.getElementById('plant3DScene');
        if (!container) {
            console.warn('3D container not found');
            return;
        }

        if (typeof THREE === 'undefined') {
            console.error('THREE.js not loaded');
            return;
        }

        console.log('Initializing 3D scene...');

        // Очистка контейнера
        container.innerHTML = '';

        // Создание сцены
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // Настройка камеры
        const width = container.clientWidth;
        const height = 600;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(4, 3, 6);
        this.camera.lookAt(0, 1.5, 0);

        // Создание рендерера
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Добавление освещения
        this.setupLighting();

        // Добавление земли/почвы
        this.createGround();

        // Контролы для вращения камеры
        if (THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 4;
            this.controls.maxDistance = 15;

            // Отслеживание взаимодействия пользователя
            this.renderer.domElement.addEventListener('mousedown', () => {
                this.switchToManualMode();
            });
        }

        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.onWindowResize());

        // Запуск анимационного цикла
        this.animate();

        console.log('3D scene initialized successfully');
    }

    // Настройка освещения
    setupLighting() {
        // Направленный свет (солнце)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(10, 10, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        // Окружающий свет
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        this.scene.add(ambientLight);

        // Полусферный свет
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.6);
        this.scene.add(hemiLight);
    }

    // Создание почвы
    createGround() {
        const groundGeometry = new THREE.CircleGeometry(6, 24);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.2
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Трава вокруг
        const grassGeometry = new THREE.RingGeometry(2.5, 6, 24);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            roughness: 0.9,
            metalness: 0.1
        });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.rotation.x = -Math.PI / 2;
        grass.position.y = 0.01;
        grass.receiveShadow = true;
        this.scene.add(grass);
    }

    // Обновление визуализации растения
    updatePlant(day, plantData, healthScore) {
        if (!this.scene) {
            console.warn('Scene not initialized');
            return;
        }

        this.currentDay = day;
        this.plantData = plantData;
        this.healthScore = healthScore;
        this.lastRenderedDay = day;

        // Удаляем старое растение
        if (this.plant) {
            this.scene.remove(this.plant);
        }

        // Создаем группу растений
        this.plant = this.createPlantGroup(plantData, day, healthScore);
        this.scene.add(this.plant);

        // Обновляем цвет почвы
        if (this.ground) {
            const soilColor = healthScore >= 80 ? 0x654321 : (healthScore >= 60 ? 0x8B7355 : 0x696969);
            this.ground.material.color.setHex(soilColor);
        }

        // Обновляем индикатор здоровья
        this.updateHealthIndicator(healthScore);
    }

    // Обновление индикатора здоровья
    updateHealthIndicator(healthScore) {
        const plantHealthPercent = document.getElementById('plantHealthPercent');
        if (plantHealthPercent) {
            plantHealthPercent.textContent = healthScore;

            const healthIndicator = plantHealthPercent.parentElement;
            if (healthIndicator) {
                healthIndicator.className = 'health-indicator';
                if (healthScore >= 80) {
                    healthIndicator.classList.add('health-good');
                } else if (healthScore >= 60) {
                    healthIndicator.classList.add('health-medium');
                } else {
                    healthIndicator.classList.add('health-poor');
                }
            }
        }
    }

    // Создание группы растений
    createPlantGroup(plantData, day, healthScore) {
        const plantGroup = new THREE.Group();

        // Позиции для 5 растений
        const positions = [
            { x: 0, z: 0 },
            { x: -1, z: 0.75 },
            { x: 1, z: 0.75 },
            { x: -0.75, z: -0.5 },
            { x: 0.75, z: -0.5 }
        ];

        for (let i = 0; i < positions.length; i++) {
            // Вариация здоровья для разнообразия
            const healthSeed = (positions[i].x + positions[i].z) * 10;
            const healthVariation = (Math.sin(healthSeed) * 0.5) * 30;
            const plantHealth = Math.max(20, Math.min(100, healthScore + healthVariation));

            // Создаем растение
            const singlePlant = this.createSinglePlant(plantData, day, plantHealth);

            // Позиционируем
            singlePlant.position.x = positions[i].x;
            singlePlant.position.z = positions[i].z;
            singlePlant.rotation.y = (i / positions.length) * Math.PI * 2;

            // Вариация размера
            const scale = 0.9 + (Math.sin(i * 1.5) * 0.5 + 0.5) * 0.2;
            singlePlant.scale.set(scale, scale, scale);

            plantGroup.add(singlePlant);
        }

        return plantGroup;
    }

    // Создание одного растения
    createSinglePlant(plantData, day, healthScore) {
        const plantGroup = new THREE.Group();

        // Получаем данные о росте
        const growthData = this.calculateGrowthData(plantData, day, healthScore);

        // Создаем стебель
        const stem = this.createStem(growthData);
        plantGroup.add(stem);

        // Создаем листья
        const leaves = this.createLeaves(growthData);
        leaves.forEach(leaf => plantGroup.add(leaf));

        // Создаем цветы
        if (growthData.showFlowers) {
            const flowers = this.createFlowers(growthData, plantData);
            flowers.forEach(flower => plantGroup.add(flower));
        }

        // // Создаем плоды
        // if (growthData.showFruits) {
        //     const fruits = this.createFruits(growthData, plantData);
        //     fruits.forEach(fruit => plantGroup.add(fruit));
        // }

        return plantGroup;
    }

    // Расчет данных о росте
    calculateGrowthData(plantData, day, healthScore) {
        const stages = plantData.growthStages || [];

        // Определяем текущий и следующий этап
        let currentStage = stages[0] || { day: 0, height: 10 };
        let nextStage = stages[1] || currentStage;

        for (let i = 0; i < stages.length - 1; i++) {
            if (day >= stages[i].day && day <= stages[i + 1].day) {
                currentStage = stages[i];
                nextStage = stages[i + 1];
                break;
            } else if (day > stages[stages.length - 1].day) {
                currentStage = stages[stages.length - 1];
                nextStage = stages[stages.length - 1];
            }
        }

        // Интерполяция высоты
        let progress = 0;
        if (nextStage.day !== currentStage.day) {
            progress = (day - currentStage.day) / (nextStage.day - currentStage.day);
        }
        const baseHeight = currentStage.height + (nextStage.height - currentStage.height) * progress;

        // Модификатор здоровья
        const healthModifier = 0.5 + (healthScore / 100) * 0.5;
        const height = (baseHeight / 100) * 4 * healthModifier * 0.75;

        // Цвет в зависимости от здоровья
        const color = healthScore >= 70 ? 0x228B22 : (healthScore >= 40 ? 0x9ACD32 : 0x808000);

        return {
            height,
            color,
            showFlowers: day >= 40 && healthScore > 60,
            showFruits: day >= 60 && healthScore > 70,
            leafCount: Math.floor((height / 0.3) * (healthScore / 100)),
            healthScore,
            day
        };
    }

    // Создание стебля
    createStem(growthData) {
        const stemGeometry = new THREE.CylinderGeometry(0.06, 0.09, growthData.height, 12);
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.7,
            metalness: 0.1
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = growthData.height / 2;
        stem.castShadow = true;
        return stem;
    }

    // Создание листьев
    createLeaves(growthData) {
        const leaves = [];
        const leafCount = Math.max(2, Math.min(growthData.leafCount, 12));

        for (let i = 0; i < leafCount; i++) {
            const leafGeometry = new THREE.SphereGeometry(0.175, 12, 12);
            leafGeometry.scale(1.25, 0.6, 0.75);

            const leafMaterial = new THREE.MeshStandardMaterial({
                color: growthData.color,
                roughness: 0.6,
                metalness: 0.1
            });

            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

            // Позиционирование по спирали
            const angle = (i / leafCount) * Math.PI * 4;
            const heightPos = (i / leafCount) * growthData.height;
            const radius = 0.2 + Math.sin(i) * 0.1;

            leaf.position.set(
                Math.cos(angle) * radius,
                heightPos,
                Math.sin(angle) * radius
            );

            leaf.rotation.z = Math.cos(angle) * 0.3;
            leaf.castShadow = true;

            leaves.push(leaf);
        }

        return leaves;
    }

    // Создание цветов
    createFlowers(growthData, plantData) {
        const flowers = [];
        const flowerCount = Math.max(1, Math.min(Math.floor(growthData.healthScore / 30), 5));

        for (let i = 0; i < flowerCount; i++) {
            const flowerGroup = new THREE.Group();

            // Центр цветка
            const centerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const centerMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                emissive: 0xFFD700,
                emissiveIntensity: 0.3
            });
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            flowerGroup.add(center);

            // Лепестки
            const petalCount = 6;
            const flowerColor = this.getFlowerColor(plantData.id);

            for (let j = 0; j < petalCount; j++) {
                const petalGeometry = new THREE.SphereGeometry(0.15, 16, 16);
                petalGeometry.scale(1, 0.6, 0.5);

                const petalMaterial = new THREE.MeshStandardMaterial({
                    color: flowerColor,
                    roughness: 0.4,
                    metalness: 0.1
                });

                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                const angle = (j / petalCount) * Math.PI * 2;
                petal.position.set(Math.cos(angle) * 0.175, 0, Math.sin(angle) * 0.175);
                petal.castShadow = true;
                flowerGroup.add(petal);
            }

            // Позиция цветка
            const angle = (i / flowerCount) * Math.PI * 2;
            flowerGroup.position.set(
                Math.cos(angle) * 0.3,
                growthData.height * 0.8 + i * 0.15,
                Math.sin(angle) * 0.3
            );

            flowers.push(flowerGroup);
        }

        return flowers;
    }

    // // Создание плодов
    // createFruits(growthData, plantData) {
    //     const fruits = [];
    //     const fruitCount = Math.max(1, Math.min(Math.floor(growthData.healthScore / 40), 4));

    //     for (let i = 0; i < fruitCount; i++) {
    //         const fruitGeometry = new THREE.SphereGeometry(0.15, 20, 20);
    //         const fruitMaterial = new THREE.MeshStandardMaterial({
    //             color: this.getFruitColor(plantData.id),
    //             roughness: 0.5,
    //             metalness: 0.2
    //         });

    //         const fruit = new THREE.Mesh(fruitGeometry, fruitMaterial);
    //         const angle = (i / fruitCount) * Math.PI * 2;

    //         fruit.position.set(
    //             Math.cos(angle) * 0.25,
    //             growthData.height * 0.5 + i * 0.15,
    //             Math.sin(angle) * 0.25
    //         );

    //         fruit.castShadow = true;
    //         fruits.push(fruit);
    //     }

    //     return fruits;
    // }

    // Получение цвета цветка
    getFlowerColor(plantId) {
        const colors = {
            rose: 0xFF1493, petunia: 0xBA55D3, tulip: 0xFF69B4,
            lavender: 0x8A2BE2, dahlia: 0xFF4500, aster: 0x9370DB,
            marigold: 0xFF8C00, zinnia: 0xFF6347, cosmos: 0xFF1493,
            gladiolus: 0xFF4500, iris: 0x4169E1, lily: 0xFFFFE0,
            narcissus: 0xFFFF00, chrysanthemum: 0xFFD700, peony: 0xFFB6C1,
            phlox: 0xFFB6C1, hydrangea: 0x4169E1, hollyhock: 0xFF1493,
            delphinium: 0x0000FF
        };
        return colors[plantId] || 0xFF69B4;
    }

    // Получение цвета плода
    getFruitColor(plantId) {
        const colors = {
            tomato: 0xFF6347,
            cucumber: 0x32CD32,
            strawberry: 0xFF0000
        };
        return colors[plantId] || 0xFF4500;
    }

    // Запуск автоматической анимации роста
    startGrowthAnimation(plantData, healthScore) {
        console.log('Starting growth animation for:', plantData?.name);

        if (!plantData) {
            console.error('No plant data provided');
            return;
        }

        this.plantData = plantData;
        this.healthScore = healthScore;
        this.currentDay = 0;
        this.autoPlay = true;
        this.userInteracting = false;
        this.cameraAngle = 0;
        this.lastUpdateTime = Date.now();
        this.lastRenderedDay = -1;

        // Определяем максимальный день (последний этап + 10 дней)
        if (plantData.growthStages && plantData.growthStages.length > 0) {
            const lastStage = plantData.growthStages[plantData.growthStages.length - 1];
            this.maxDay = lastStage.day + 10;
        } else {
            this.maxDay = 70;
        }

        console.log('Max day set to:', this.maxDay);

        // Обновляем слайдер
        this.updateTimelineSlider();

        // Показываем режим автоанимации
        this.showAutoMode();

        // Обновляем растение
        this.updatePlant(0, plantData, healthScore);
    }

    // Переключение на ручной режим
    switchToManualMode() {
        if (!this.userInteracting) {
            console.log('Switching to manual mode');
            this.autoPlay = false;
            this.userInteracting = true;

            const autoModeInfo = document.getElementById('autoModeInfo');
            const manualModeControls = document.getElementById('manualModeControls');

            if (autoModeInfo) autoModeInfo.style.display = 'none';
            if (manualModeControls) manualModeControls.style.display = 'block';

            const timelineSlider = document.getElementById('timelineSlider');
            if (timelineSlider) {
                timelineSlider.value = Math.floor(this.currentDay);
            }
        }
    }

    // Возобновление автоматической анимации
    resumeAutoAnimation() {
        console.log('Resuming auto animation');

        const timelineSlider = document.getElementById('timelineSlider');
        if (timelineSlider) {
            this.currentDay = parseInt(timelineSlider.value);
        }

        this.autoPlay = true;
        this.userInteracting = false;
        this.lastUpdateTime = Date.now();
        this.lastRenderedDay = -1;

        // Сбрасываем угол камеры
        this.cameraAngle = Math.atan2(this.camera.position.z, this.camera.position.x);

        this.showAutoMode();
    }

    // Показать режим автоанимации
    showAutoMode() {
        const autoModeInfo = document.getElementById('autoModeInfo');
        const manualModeControls = document.getElementById('manualModeControls');

        if (autoModeInfo) autoModeInfo.style.display = 'block';
        if (manualModeControls) manualModeControls.style.display = 'none';
    }

    // Обновление слайдера временной шкалы
    updateTimelineSlider() {
        const timelineSlider = document.getElementById('timelineSlider');
        const maxDayLabel = document.getElementById('maxDayLabel');
        const midDayLabel = document.getElementById('midDayLabel');

        if (timelineSlider) {
            timelineSlider.max = this.maxDay;
            timelineSlider.value = 0;
        }

        if (maxDayLabel) {
            maxDayLabel.textContent = `${this.maxDay} дней`;
        }

        if (midDayLabel) {
            midDayLabel.textContent = `${Math.floor(this.maxDay / 2)} дней`;
        }
    }

    // Анимационный цикл
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const currentTime = Date.now();
        const deltaTimeCamera = (currentTime - this.lastUpdateTime) / 1500;
        const deltaTime = (currentTime - this.lastUpdateTime) / 500;
        this.lastUpdateTime = currentTime;

        // Автоматическая анимация
        if (this.autoPlay && !this.userInteracting && this.plantData) {
            // Увеличиваем день
            this.currentDay += this.growthSpeed * deltaTime;

            // Останавливаем при достижении максимального дня
            if (this.currentDay >= this.maxDay) {
                this.currentDay = this.maxDay;
                this.autoPlay = false;
                console.log('Growth animation completed at day:', this.maxDay);
            }

            // Обновляем растение
            const newDay = Math.floor(this.currentDay);
            if (newDay !== this.lastRenderedDay) {
                this.lastRenderedDay = newDay;
                this.updatePlant(newDay, this.plantData, this.healthScore);
            }

            // Обновляем отображение дня
            const dayDisplay = document.getElementById('currentDayDisplay');
            if (dayDisplay) {
                dayDisplay.textContent = Math.floor(this.currentDay);
            }

            // Вращаем камеру
            this.cameraAngle += this.rotationSpeed * deltaTime;
            const radius = 7.5;
            const height = 3.5;

            this.camera.position.x = radius * Math.cos(this.cameraAngle);
            this.camera.position.z = radius * Math.sin(this.cameraAngle);
            this.camera.position.y = height;
            this.camera.lookAt(0, 1.5, 0);
        } else if (this.controls) {
            this.controls.update();
        }

        // Рендерим сцену
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Обработка изменения размера окна
    onWindowResize() {
        const container = document.getElementById('plant3DScene');
        if (!container || !this.camera || !this.renderer) return;

        const width = container.clientWidth;
        const height = 600;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // Очистка ресурсов
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
    }
}

// Создаем глобальный экземпляр аниматора
window.plantAnimator = new PlantAnimator3D();
console.log('✅ animation.js loaded successfully, plantAnimator created:', window.plantAnimator);

// Для обратной совместимости также создаём без window
var plantAnimator = window.plantAnimator;
