from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sys
import os

# Добавляем текущую директорию в путь
sys.path.append(os.path.dirname(__file__))

from plant_ml import predictor

app = FastAPI(title="Plant Growth Analysis API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PlantParams(BaseModel):
    plantName: str
    soilMoisture: float
    sunlight: float
    pH: float
    airTemp: float
    soilTemp: float
    nitrogen: float
    phosphorus: float
    potassium: float

class AnalysisResponse(BaseModel):
    score: int
    recommendations: List[str]
    diseaseRisks: List[str]
    growthTips: List[str]
    modelStatus: str

def generate_recommendations(params: PlantParams, score: int, disease_risk: float) -> List[str]:
    """Генерация рекомендаций на основе параметров"""
    recommendations = []

    # Влажность почвы
    if params.soilMoisture < 40:
        diff = 60 - params.soilMoisture
        recommendations.append(
            f"Увеличьте влажность почвы на {diff:.0f}% (текущее: {params.soilMoisture:.0f}%, оптимально: 50-70%)"
        )
    elif params.soilMoisture > 80:
        diff = params.soilMoisture - 70
        recommendations.append(
            f"Снизьте влажность почвы на {diff:.0f}% (текущее: {params.soilMoisture:.0f}%, оптимально: 50-70%)"
        )

    # Освещенность
    if params.sunlight < 5:
        diff = 6 - params.sunlight
        recommendations.append(
            f"Увеличьте освещенность на {diff:.1f} ч/день (текущее: {params.sunlight:.1f} ч/день, оптимально: 6-8 ч/день)"
        )
    elif params.sunlight > 10:
        recommendations.append(
            f"Слишком много света ({params.sunlight:.1f} ч/день). Оптимально: 6-8 ч/день"
        )

    # pH почвы
    if params.pH < 5.5:
        diff = 6.5 - params.pH
        recommendations.append(
            f"Повысьте pH почвы на {diff:.1f} (текущее: {params.pH:.1f}, оптимально: 6.0-7.0)"
        )
    elif params.pH > 7.5:
        diff = params.pH - 6.5
        recommendations.append(
            f"Понизьте pH почвы на {diff:.1f} (текущее: {params.pH:.1f}, оптимально: 6.0-7.0)"
        )

    # Температура воздуха
    if params.airTemp < 18:
        diff = 22 - params.airTemp
        recommendations.append(
            f"Увеличьте температуру воздуха на {diff:.0f}°C (текущее: {params.airTemp:.0f}°C, оптимально: 20-25°C)"
        )
    elif params.airTemp > 28:
        diff = params.airTemp - 22
        recommendations.append(
            f"Снизьте температуру воздуха на {diff:.0f}°C (текущее: {params.airTemp:.0f}°C, оптимально: 20-25°C)"
        )

    # Азот
    if params.nitrogen < 60:
        diff = 80 - params.nitrogen
        recommendations.append(
            f"Увеличьте содержание азота на {diff:.0f} мг/кг (текущее: {params.nitrogen:.0f} мг/кг, оптимально: 70-100 мг/кг)"
        )

    # Фосфор
    if params.phosphorus < 40:
        diff = 60 - params.phosphorus
        recommendations.append(
            f"Увеличьте содержание фосфора на {diff:.0f} мг/кг (текущее: {params.phosphorus:.0f} мг/кг, оптимально: 50-70 мг/кг)"
        )

    # Калий
    if params.potassium < 60:
        diff = 90 - params.potassium
        recommendations.append(
            f"Увеличьте содержание калия на {diff:.0f} мг/кг (текущее: {params.potassium:.0f} мг/кг, оптимально: 80-110 мг/кг)"
        )

    if not recommendations:
        recommendations.append("Все параметры в норме! Продолжайте поддерживать текущие условия.")

    return recommendations

def generate_disease_risks(params: PlantParams, disease_risk: float) -> List[str]:
    """Генерация предупреждений о болезнях"""
    risks = []

    if disease_risk > 0.6:
        risks.append("Высокий риск заболеваний при текущих условиях")

    if params.soilMoisture > 80 and params.airTemp < 18:
        risks.append("Риск грибковых заболеваний из-за высокой влажности и низкой температуры")

    if params.pH < 5.5 or params.pH > 7.5:
        risks.append("Неоптимальный pH может привести к дефициту питательных веществ и болезням")

    if params.airTemp > 30:
        risks.append("Высокая температура может вызвать стресс и восприимчивость к болезням")

    if params.nitrogen < 40:
        risks.append("Недостаток азота снижает иммунитет растения")

    if not risks:
        risks.append("Рисков заболеваний не обнаружено при текущих условиях")

    return risks

def generate_growth_tips(params: PlantParams, score: int) -> List[str]:
    """Генерация советов для роста"""
    tips = []

    if score >= 80:
        tips.append("Отличные условия! Растение будет активно расти и развиваться")
    elif score >= 60:
        tips.append("Хорошие условия, но есть возможности для улучшения")
    else:
        tips.append("Условия требуют значительного улучшения для оптимального роста")

    tips.append("Регулярно проверяйте состояние растений и корректируйте параметры")

    if params.sunlight >= 6 and params.airTemp >= 20:
        tips.append("Условия благоприятны для цветения и плодоношения")

    tips.append("Обеспечьте хорошую циркуляцию воздуха для предотвращения болезней")

    if params.nitrogen >= 70 and params.phosphorus >= 50 and params.potassium >= 80:
        tips.append("Сбалансированное питание способствует здоровому росту")

    return tips

@app.on_event("startup")
async def startup_event():
    """Загрузка моделей при запуске"""
    print("🚀 Запуск сервера Plant Growth Analysis...")
    predictor.load_models()
    print("✅ Сервер готов!")

@app.get("/")
def root():
    return {
        "message": "Plant Growth Analysis API работает",
        "models_loaded": predictor.is_trained,
        "endpoints": ["/analyze", "/train", "/status"]
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(params: PlantParams):
    """Анализ условий выращивания"""
    try:
        # Конвертируем параметры
        ml_params = {
            'soilMoisture': params.soilMoisture,
            'sunlight': params.sunlight,
            'pH': params.pH,
            'airTemp': params.airTemp,
            'soilTemp': params.soilTemp,
            'nitrogen': params.nitrogen,
            'phosphorus': params.phosphorus,
            'potassium': params.potassium
        }

        # Получаем предсказание от ML модели
        result = predictor.predict(ml_params)

        # Генерируем рекомендации
        recommendations = generate_recommendations(params, result['score'], result['disease_risk'])
        disease_risks = generate_disease_risks(params, result['disease_risk'])
        growth_tips = generate_growth_tips(params, result['score'])

        return AnalysisResponse(
            score=result['score'],
            recommendations=recommendations,
            diseaseRisks=disease_risks,
            growthTips=growth_tips,
            modelStatus=result['model_status']
        )

    except Exception as e:
        print(f"Ошибка анализа: {e}")
        # Возвращаем базовый анализ
        return AnalysisResponse(
            score=50,
            recommendations=["Ошибка анализа. Проверьте параметры."],
            diseaseRisks=["Не удалось оценить риски"],
            growthTips=["Не удалось сгенерировать советы"],
            modelStatus="error"
        )

@app.post("/train")
def train():
    """Обучение моделей"""
    try:
        predictor.train_models()
        return {"message": "Модели успешно обучены!", "status": "success"}
    except Exception as e:
        return {"message": f"Ошибка обучения: {e}", "status": "error"}

@app.get("/status")
def status():
    """Статус моделей"""
    return {
        "models_trained": predictor.is_trained,
        "models_available": os.path.exists('backend/models/health_model.pkl')
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001, reload=True)
