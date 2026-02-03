#!/bin/bash

echo "🌱 Запуск локального ML backend для анализа растений..."
echo ""

# Проверка наличия Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден. Установите Python 3.8+"
    exit 1
fi

# Создание виртуального окружения если его нет
if [ ! -d "backend/venv" ]; then
    echo "📦 Создание виртуального окружения..."
    python3 -m venv backend/venv
fi

# Активация виртуального окружения
echo "🔧 Активация виртуального окружения..."
source backend/venv/bin/activate

# Установка зависимостей
echo "📥 Установка зависимостей..."
pip install -q --upgrade pip
pip install -q -r backend/requirements.txt

echo ""
echo "✅ Зависимости установлены!"
echo ""
echo "🚀 Запуск ML backend сервера..."
echo "   URL: http://localhost:8001"
echo "   Документация API: http://localhost:8001/docs"
echo ""
echo "   Для остановки нажмите Ctrl+C"
echo ""

# Запуск сервера
cd backend
python3 server.py
