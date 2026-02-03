import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from tensorflow import keras
from tensorflow.keras import layers
import joblib
import random
import os

class AdvancedPlantPredictor:
    def __init__(self):
        self.growth_model = None
        self.health_model = None
        self.disease_model = None
        self.flowering_model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def generate_training_data(self, n_samples=5000):  # Уменьшил для скорости
        """Генерация синтетических данных для обучения"""
        np.random.seed(42)
        
        data = []
        for _ in range(n_samples):
            # Генерация реалистичных параметров
            temp = np.random.normal(22, 5)
            humidity = np.random.normal(65, 15)
            light = np.random.normal(1200, 400)
            water = np.random.normal(200, 80)
            fertilizer = np.random.normal(15, 8)
            soil_ph = np.random.normal(6.5, 0.8)
            
            # Упрощенные зависимости
            temp_optimal = max(0, 1.0 - abs(temp - 22.0) / 20.0)
            humidity_optimal = max(0, 1.0 - abs(humidity - 65.0) / 35.0)
            light_optimal = min(light / 1500.0, 1.0)
            water_optimal = max(0, 1.0 - abs(water - 200.0) / 150.0)
            
            # Рост
            growth = 2.0 * (
                temp_optimal * 0.3 +
                light_optimal * 0.3 +
                water_optimal * 0.2 +
                humidity_optimal * 0.2
            ) + random.uniform(-0.2, 0.2)
            
            # Здоровье
            health = 0.7 + (temp_optimal + humidity_optimal + water_optimal) * 0.1
            
            # Риск заболеваний
            disease_risk = max(0.0, 0.3 + (1.0 - health) * 0.4)
            
            # Вероятность цветения
            flowering_prob = max(0.0, 0.4 + health * 0.3 + light_optimal * 0.2)
            
            data.append([
                temp, humidity, light, water, fertilizer, soil_ph,
                max(0.1, growth),
                max(0.1, min(1.0, health)),
                max(0.0, min(1.0, disease_risk)),
                max(0.0, min(1.0, flowering_prob))
            ])
        
        columns = [
            'temperature', 'humidity', 'light_intensity', 'water_ml',
            'fertilizer_ml', 'soil_ph', 'growth', 'health', 'disease_risk', 'flowering_prob'
        ]
        return pd.DataFrame(data, columns=columns)
    
    def create_simplified_nn(self, input_dim):
        """Упрощенная нейронная сеть для избежания проблем совместимости"""
        model = keras.Sequential([
            layers.Dense(32, activation='relu', input_shape=(input_dim,)),
            layers.Dense(16, activation='relu'),
            layers.Dense(4, activation='linear')
        ])
        
        # Упрощенная компиляция без проблемных метрик
        model.compile(optimizer='adam', loss='mse')
        return model
    
    def train_models(self):
        """Обучение всех моделей с подробным выводом прогресса"""
        print("🌱 Генерация тренировочных данных...")
        df = self.generate_training_data(3000)
        
        X = df[['temperature', 'humidity', 'light_intensity', 'water_ml', 'fertilizer_ml', 'soil_ph']]
        y = df[['growth', 'health', 'disease_risk', 'flowering_prob']]
        
        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
        
        print("📊 Обучение XGBoost для роста...")
        self.growth_model = xgb.XGBRegressor(n_estimators=50, max_depth=4, random_state=42)
        self.growth_model.fit(X_train, y_train['growth'])
        print("   ✅ Модель роста обучена")
        
        print("💚 Обучение XGBoost для здоровья...")
        self.health_model = xgb.XGBRegressor(n_estimators=50, max_depth=4, random_state=42)
        self.health_model.fit(X_train, y_train['health'])
        print("   ✅ Модель здоровья обучена")
        
        print("🦠 Обучение Random Forest для риска заболеваний...")
        self.disease_model = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
        self.disease_model.fit(X_train, y_train['disease_risk'])
        print("   ✅ Модель риска заболеваний обучена")
        
        print("🌸 Обучение нейронной сети...")
        self.flowering_model = self.create_simplified_nn(X_train.shape[1])
        
        # Обучение с прогрессом
        history = self.flowering_model.fit(
            X_train, y_train.values,
            epochs=30,
            batch_size=32,
            validation_split=0.2,
            verbose=1
        )
        print("   ✅ Нейронная сеть обучена")
        
        self.is_trained = True
        
        # Сохранение моделей
        self.save_models()
        
        # Вывод итоговой информации
        growth_score = self.growth_model.score(X_test, y_test['growth'])
        health_score = self.health_model.score(X_test, y_test['health'])
        
        print("🎯 Обучение завершено! Качество моделей:")
        print(f"   📈 Модель роста: {growth_score:.3f}")
        print(f"   💚 Модель здоровья: {health_score:.3f}")
        print(f"   🌸 Нейронная сеть: loss={history.history['loss'][-1]:.4f}")
    
    def save_models(self):
        """Сохранение обученных моделей"""
        os.makedirs('models', exist_ok=True)
        
        # Сохраняем только веса для нейронной сети (избегаем проблем с сериализацией)
        self.flowering_model.save_weights('models/flowering_nn.weights.h5')
        
        # Остальные модели сохраняем как обычно
        joblib.dump(self.growth_model, 'models/growth_xgb.model')
        joblib.dump(self.health_model, 'models/health_xgb.model')
        joblib.dump(self.disease_model, 'models/disease_rf.model')
        joblib.dump(self.scaler, 'models/scaler.save')
        
        # Сохраняем архитектуру нейронной сети отдельно
        with open('models/flowering_nn_architecture.json', 'w') as f:
            f.write(self.flowering_model.to_json())
        
        print("Модели сохранены в папку 'models'")
    
    def load_models(self):
        """Загрузка предварительно обученных моделей"""
        try:
            # print(os.getcwd())
            # Проверяем существование всех файлов
            required_files = [
                'models/growth_xgb.model',
                'models/health_xgb.model', 
                'models/disease_rf.model',
                'models/scaler.save',
                'models/flowering_nn.weights.h5',
                'models/flowering_nn_architecture.json'
            ]
            
            for file in required_files:
                if not os.path.exists(file):
                    raise FileNotFoundError(f"Файл {file} не найден\n")
            
            # Загружаем scikit-learn модели
            self.growth_model = joblib.load('models/growth_xgb.model')
            self.health_model = joblib.load('models/health_xgb.model')
            self.disease_model = joblib.load('models/disease_rf.model')
            self.scaler = joblib.load('models/scaler.save')
            
            # Загружаем нейронную сеть
            with open('models/flowering_nn_architecture.json', 'r') as f:
                model_architecture = f.read()
            
            self.flowering_model = keras.models.model_from_json(model_architecture)
            self.flowering_model.compile(optimizer='adam', loss='mse')  # Перекомпилируем
            self.flowering_model.load_weights('models/flowering_nn.weights.h5')
            
            self.is_trained = True
            print("Модели успешно загружены!")
            
        except FileNotFoundError as e:
            print(f"Модели не найдены: {e}")
            print("Необходимо обучение. Используйте эндпоинт /train-models")
            self.is_trained = False
        except Exception as e:
            print(f"Ошибка загрузки моделей: {e}")
            print("Рекомендуется переобучить модели")
            self.is_trained = False
    
    def predict(self, input_params, auto_train=True):
        """Предсказание на основе входных параметров с автоматическим обучением при необходимости"""
    
        # Если модели не обучены и разрешено автообучение
        if not self.is_trained and auto_train:
            print("🔄 Модели не обучены. Запускаю автоматическое обучение...")
            try:
                self.train_models()
                print("✅ Автообучение завершено успешно!")
            except Exception as e:
                print(f"❌ Ошибка автообучения: {e}")
                print("🔄 Возвращаю демо-предсказания...")
                return self.demo_predict(input_params)
        
        # Если после автообучения модели все еще не обучены
        if not self.is_trained:
            print("ℹ️ Модели не обучены, использую демо-режим")
            return self.demo_predict(input_params)
        
        try:
            # Преобразование в numpy array
            input_array = np.array([[
                input_params['temperature'],
                input_params['humidity'], 
                input_params['light_intensity'],
                input_params['water_ml'],
                input_params['fertilizer_ml'],
                input_params['soil_ph']
            ]])
            
            # Масштабирование
            input_scaled = self.scaler.transform(input_array)
            
            # Предсказания от отдельных моделей
            growth_pred = float(self.growth_model.predict(input_scaled)[0])
            health_pred = float(self.health_model.predict(input_scaled)[0])
            disease_pred = float(self.disease_model.predict(input_scaled)[0])
            
            # Предсказание от нейронной сети (включая flowering)
            nn_pred = self.flowering_model.predict(input_scaled, verbose=0)[0]
            flowering_pred = float(nn_pred[3])
            
            # Гарантируем разумные диапазоны
            result = {
                'growth_cm': max(0.1, min(5.0, growth_pred)),
                'health_score': max(0.1, min(1.0, health_pred)),
                'disease_risk': max(0.0, min(1.0, disease_pred)),
                'flowering_probability': max(0.0, min(1.0, flowering_pred)),
                'model_status': 'trained'  # Добавляем статус модели
            }
            
            print(f"✅ Предсказание успешно: рост={result['growth_cm']:.2f}см, здоровье={result['health_score']:.2f}")
            return result
            
        except Exception as e:
            print(f"❌ Ошибка предсказания: {e}")
            print("🔄 Возвращаю демо-предсказания...")
            demo_result = self.demo_predict(input_params)
            demo_result['model_status'] = 'error'
            return demo_result
    
    def demo_predict(self, input_params):
        """Демо-предсказания когда модели не загружены"""
        temp = input_params['temperature']
        water = input_params['water_ml']
        light = input_params['light_intensity']
        
        # Улучшенная простая логика для демонстрации
        temp_factor = max(0, 1.0 - abs(temp - 22.0) / 15.0)
        water_factor = max(0, 1.0 - abs(water - 200.0) / 200.0)
        light_factor = min(light / 1500.0, 1.0)
        
        growth = 2.0 * (temp_factor * 0.4 + light_factor * 0.4 + water_factor * 0.2)
        health = 0.6 + (temp_factor + water_factor) * 0.2
        disease_risk = max(0.0, 0.3 + (1.0 - health) * 0.4)
        flowering = 0.2 + health * 0.3 + light_factor * 0.3
        
        return {
            'growth_cm': max(0.1, min(5.0, growth)),
            'health_score': max(0.1, min(1.0, health)),
            'disease_risk': max(0.0, min(1.0, disease_risk)),
            'flowering_probability': max(0.0, min(1.0, flowering)),
            'model_status': 'demo'  # Добавляем статус демо-режима
        }

# Глобальный экземпляр predictor
plant_predictor = AdvancedPlantPredictor()