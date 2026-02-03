import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import random
import os

class PlantGrowthPredictor:
    """ML модель для анализа условий выращивания растений"""

    def __init__(self):
        self.growth_model = None
        self.health_model = None
        self.disease_model = None
        self.scaler = StandardScaler()
        self.is_trained = False

    def generate_training_data(self, n_samples=3000):
        """Генерация синтетических данных для обучения"""
        np.random.seed(42)

        data = []
        for _ in range(n_samples):
            # Генерация реалистичных параметров
            soil_moisture = np.random.normal(60, 20)
            sunlight = np.random.normal(6, 2)
            pH = np.random.normal(6.5, 0.8)
            air_temp = np.random.normal(22, 5)
            soil_temp = np.random.normal(20, 4)
            nitrogen = np.random.normal(80, 30)
            phosphorus = np.random.normal(60, 25)
            potassium = np.random.normal(90, 30)

            # Расчет оптимальности параметров
            moisture_optimal = max(0, 1.0 - abs(soil_moisture - 60.0) / 40.0)
            sunlight_optimal = max(0, min(sunlight / 8.0, 1.0))
            pH_optimal = max(0, 1.0 - abs(pH - 6.5) / 1.5)
            air_temp_optimal = max(0, 1.0 - abs(air_temp - 22.0) / 15.0)
            soil_temp_optimal = max(0, 1.0 - abs(soil_temp - 20.0) / 10.0)
            nitrogen_optimal = max(0, 1.0 - abs(nitrogen - 80.0) / 80.0)
            phosphorus_optimal = max(0, 1.0 - abs(phosphorus - 60.0) / 60.0)
            potassium_optimal = max(0, 1.0 - abs(potassium - 90.0) / 90.0)

            # Расчет итоговых метрик
            overall_optimal = (
                moisture_optimal * 0.15 +
                sunlight_optimal * 0.15 +
                pH_optimal * 0.10 +
                air_temp_optimal * 0.15 +
                soil_temp_optimal * 0.10 +
                nitrogen_optimal * 0.15 +
                phosphorus_optimal * 0.10 +
                potassium_optimal * 0.10
            )

            # Здоровье растения (0-100)
            health = 50 + overall_optimal * 50 + random.uniform(-5, 5)
            health = max(10, min(100, health))

            # Риск заболеваний (увеличивается при плохих условиях)
            disease_risk = max(0, 1.0 - overall_optimal) * 0.7
            if soil_moisture > 80 and air_temp < 18:
                disease_risk += 0.2
            disease_risk = max(0.0, min(1.0, disease_risk))

            data.append([
                soil_moisture, sunlight, pH, air_temp, soil_temp,
                nitrogen, phosphorus, potassium,
                health, disease_risk
            ])

        columns = [
            'soil_moisture', 'sunlight', 'pH', 'air_temp', 'soil_temp',
            'nitrogen', 'phosphorus', 'potassium',
            'health', 'disease_risk'
        ]
        return pd.DataFrame(data, columns=columns)

    def train_models(self):
        """Обучение моделей"""
        print("🌱 Генерация тренировочных данных...")
        df = self.generate_training_data(3000)

        X = df[['soil_moisture', 'sunlight', 'pH', 'air_temp', 'soil_temp',
                'nitrogen', 'phosphorus', 'potassium']]
        y = df[['health', 'disease_risk']]

        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )

        print("💚 Обучение модели здоровья (XGBoost)...")
        self.health_model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=5,
            random_state=42,
            learning_rate=0.1
        )
        self.health_model.fit(X_train, y_train['health'])

        print("🦠 Обучение модели риска заболеваний (Random Forest)...")
        self.disease_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=6,
            random_state=42
        )
        self.disease_model.fit(X_train, y_train['disease_risk'])

        self.is_trained = True

        # Сохранение моделей
        self.save_models()

        # Вывод качества
        health_score = self.health_model.score(X_test, y_test['health'])
        disease_score = self.disease_model.score(X_test, y_test['disease_risk'])

        print("🎯 Обучение завершено!")
        print(f"   💚 Модель здоровья: R² = {health_score:.3f}")
        print(f"   🦠 Модель риска: R² = {disease_score:.3f}")

        return health_score, disease_score

    def save_models(self):
        """Сохранение моделей"""
        os.makedirs('backend/models', exist_ok=True)

        joblib.dump(self.health_model, 'backend/models/health_model.pkl')
        joblib.dump(self.disease_model, 'backend/models/disease_model.pkl')
        joblib.dump(self.scaler, 'backend/models/scaler.pkl')

        print("✅ Модели сохранены в backend/models/")

    def load_models(self):
        """Загрузка моделей"""
        try:
            self.health_model = joblib.load('backend/models/health_model.pkl')
            self.disease_model = joblib.load('backend/models/disease_model.pkl')
            self.scaler = joblib.load('backend/models/scaler.pkl')
            self.is_trained = True
            print("✅ Модели успешно загружены!")
            return True
        except FileNotFoundError:
            print("⚠️  Модели не найдены. Необходимо обучение.")
            self.is_trained = False
            return False
        except Exception as e:
            print(f"❌ Ошибка загрузки моделей: {e}")
            self.is_trained = False
            return False

    def predict(self, params):
        """Предсказание на основе входных параметров"""

        # Если модели не обучены, обучаем автоматически
        if not self.is_trained:
            print("🔄 Автоматическое обучение моделей...")
            try:
                self.train_models()
            except Exception as e:
                print(f"❌ Ошибка обучения: {e}")
                return self.fallback_predict(params)

        try:
            # Подготовка входных данных
            input_array = np.array([[
                params['soilMoisture'],
                params['sunlight'],
                params['pH'],
                params['airTemp'],
                params['soilTemp'],
                params['nitrogen'],
                params['phosphorus'],
                params['potassium']
            ]])

            # Масштабирование
            input_scaled = self.scaler.transform(input_array)

            # Предсказания
            health = float(self.health_model.predict(input_scaled)[0])
            disease_risk = float(self.disease_model.predict(input_scaled)[0])

            # Нормализация результатов
            health = max(10, min(100, health))
            disease_risk = max(0.0, min(1.0, disease_risk))

            return {
                'score': int(health),
                'disease_risk': disease_risk,
                'model_status': 'ml_trained'
            }

        except Exception as e:
            print(f"❌ Ошибка предсказания: {e}")
            return self.fallback_predict(params)

    def fallback_predict(self, params):
        """Базовое предсказание без ML"""
        # Простая эвристика
        score = 50

        # Проверка базовых параметров
        if 50 <= params['soilMoisture'] <= 70:
            score += 10
        if 5 <= params['sunlight'] <= 8:
            score += 10
        if 6.0 <= params['pH'] <= 7.0:
            score += 10
        if 18 <= params['airTemp'] <= 28:
            score += 10
        if 60 <= params['nitrogen'] <= 120:
            score += 5
        if 40 <= params['phosphorus'] <= 80:
            score += 5

        disease_risk = 0.3
        if params['soilMoisture'] > 80:
            disease_risk += 0.2
        if params['airTemp'] < 15 or params['airTemp'] > 30:
            disease_risk += 0.15

        return {
            'score': score,
            'disease_risk': min(1.0, disease_risk),
            'model_status': 'fallback'
        }

# Глобальный экземпляр
predictor = PlantGrowthPredictor()
