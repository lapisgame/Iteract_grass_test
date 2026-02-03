from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from ml_models import plant_predictor
import os

# Создаем папку для моделей если её нет
os.makedirs('models', exist_ok=True)

app = FastAPI(title="Interactive Garden API with ML")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GardenParameters(BaseModel):
    temperature: float
    humidity: float
    light_intensity: float
    water_ml: float
    fertilizer_ml: float
    soil_ph: float

class PredictionResponse(BaseModel):
    growth_cm: float
    health_score: float
    disease_risk: float
    flowering_probability: float
    recommendations: List[str]
    model_confidence: float
    # Добавьте опционально, если хотите явно возвращать статус
    # model_status: Optional[str] = None

class RecommendationEngine:
    @staticmethod
    def generate_recommendations(predictions: dict, params: GardenParameters) -> List[str]:
        recommendations = []
        
        # Анализ здоровья
        if predictions['health_score'] < 0.4:
            recommendations.append("🔴 Критически низкое здоровье! Срочно проверьте условия.")
        elif predictions['health_score'] < 0.6:
            recommendations.append("🟡 Здоровье ниже оптимального. Требуется корректировка ухода.")
        
        # Анализ риска заболеваний
        if predictions['disease_risk'] > 0.7:
            recommendations.append("🦠 Высокий риск заболеваний! Увеличьте вентиляцию и уменьшите влажность.")
        elif predictions['disease_risk'] > 0.5:
            recommendations.append("⚠️ Повышенный риск заболеваний. Контролируйте влажность.")
        
        # Рекомендации по температуре
        if params.temperature < 15:
            recommendations.append("❄️ Слишком холодно. Растение в стрессе. Повысьте температуру.")
        elif params.temperature > 30:
            recommendations.append("🔥 Слишком жарко. Растение может перегреться. Понизьте температуру.")
        
        # Рекомендации по поливу
        if params.water_ml < 100:
            recommendations.append("💧 Недостаточный полив. Увеличьте количество воды.")
        elif params.water_ml > 350:
            recommendations.append("💦 Избыточный полив! Может привести к гниению корней.")
        
        # Рекомендации по свету
        if params.light_intensity < 500:
            recommendations.append("💡 Недостаточно света. Растение не может эффективно фотосинтезировать.")
        elif params.light_intensity > 1800:
            recommendations.append("☀️ Слишком интенсивный свет. Может вызвать ожоги листьев.")
        
        # Рекомендации по удобрениям
        if params.fertilizer_ml < 5:
            recommendations.append("🌱 Недостаток питательных веществ. Увеличьте дозу удобрений.")
        elif params.fertilizer_ml > 30:
            recommendations.append("⚗️ Переудобрено! Может повредить корневую систему.")
        
        # Рекомендации по pH
        if params.soil_ph < 5.5:
            recommendations.append("🧪 Слишком кислая почва. Добавьте известь для нормализации pH.")
        elif params.soil_ph > 7.5:
            recommendations.append("🧪 Слишком щелочная почва. Добавьте серу для нормализации pH.")
        
        # Положительные рекомендации
        if predictions['flowering_probability'] > 0.8:
            recommendations.append("🌸 Отличные условия для цветения! Продолжайте в том же духе.")
        
        if predictions['growth_cm'] > 3.0:
            recommendations.append("🚀 Отличный рост! Растение развивается оптимально.")
        
        if not recommendations:
            recommendations.append("✅ Параметры в норме. Растение чувствует себя хорошо!")
        
        return recommendations

@app.on_event("startup")
async def startup_event():
    """Загрузка моделей при запуске сервера"""
    print("Загрузка ML моделей...")
    try:
        plant_predictor.load_models()
        print("Сервер готов к работе!")
    except Exception as e:
        print(f"Ошибка загрузки моделей: {e}")
        print("Сервер запущен, но модели не загружены. Используйте /train для обучения.")

@app.get("/")
def read_root():
    return {
        "message": "Interactive Garden API с ML моделями работает!",
        "models_loaded": plant_predictor.is_trained,
        "available_endpoints": ["/predict", "/model-info", "/train"]
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_effects(params: GardenParameters):
    try:
        # Получаем предсказания от ML моделей
        predictions = plant_predictor.predict(params.dict())
        
        # Генерируем рекомендации
        recommendations = RecommendationEngine.generate_recommendations(
            predictions, params
        )
        
        # Рассчитываем уверенность модели
        model_confidence = min(0.95, 0.7 + predictions['health_score'] * 0.25)
        
        # Добавляем информацию о статусе модели в рекомендации
        if predictions.get('model_status') == 'demo':
            recommendations.insert(0, "🔶 Используются демо-предсказания. Модели в процессе обучения...")
        elif predictions.get('model_status') == 'error':
            recommendations.insert(0, "⚠️ Ошибка моделей. Используются демо-данные.")
        elif predictions.get('model_status') == 'trained':
            recommendations.insert(0, "✅ Используются обученные ML-модели")
        
        return PredictionResponse(
            growth_cm=round(predictions['growth_cm'], 2),
            health_score=round(predictions['health_score'], 3),
            disease_risk=round(predictions['disease_risk'], 3),
            flowering_probability=round(predictions['flowering_probability'], 3),
            recommendations=recommendations,
            model_confidence=round(model_confidence, 3)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка предсказания: {str(e)}")

@app.get("/model-info")
def get_model_info():
    return {
        "model_name": "Advanced Plant Growth Predictor",
        "version": "2.0",
        "algorithms": [
            "XGBoost для роста и здоровья",
            "Random Forest для риска заболеваний", 
            "Нейронная сеть для комплексных предсказаний"
        ],
        "features_used": [
            "temperature", "humidity", "light_intensity", 
            "water_ml", "fertilizer_ml", "soil_ph"
        ],
        "is_trained": plant_predictor.is_trained
    }

@app.post("/train")
def train_models():
    """Эндпоинт для переобучения моделей (для администрирования)"""
    try:
        plant_predictor.train_models()
        return {"message": "Модели успешно переобучены!"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/train-models")
def train_models_force():
    """Принудительное обучение моделей с нуля"""
    try:
        print("Принудительное обучение моделей...")
        plant_predictor.train_models()
        return {"message": "Модели успешно обучены и сохранены!"}
    except Exception as e:
        return {"error": f"Ошибка обучения: {str(e)}"}

# Запуск сервера
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)