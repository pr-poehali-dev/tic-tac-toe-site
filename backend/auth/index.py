"""
Система аутентификации пользователей
Обрабатывает регистрацию, вход и проверку пользователей
"""

import json
import os
import hashlib
import psycopg2
from typing import Dict, Any


def hash_password(password: str) -> str:
    """Хеширует пароль с использованием SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def get_db_connection():
    """Создает подключение к базе данных"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL environment variable not set')
    return psycopg2.connect(database_url)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обрабатывает запросы аутентификации пользователей
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами: request_id, function_name
    Returns: HTTP response dict
    """
    method: str = event.get('httpMethod', 'GET')
    
    # Обработка CORS OPTIONS запроса
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'register':
                return handle_register(body_data)
            elif action == 'login':
                return handle_login(body_data)
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неизвестное действие'})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Внутренняя ошибка сервера: {str(e)}'})
        }


def handle_register(data: Dict[str, Any]) -> Dict[str, Any]:
    """Обработка регистрации нового пользователя"""
    login = data.get('login', '').strip()
    password = data.get('password', '').strip()
    
    # Валидация данных
    if not login or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Логин и пароль обязательны'})
        }
    
    if len(login) < 3:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Логин должен содержать минимум 3 символа'})
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль должен содержать минимум 6 символов'})
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверяем, существует ли уже пользователь с таким логином
        cursor.execute("SELECT id FROM users WHERE login = %s", (login,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            cursor.close()
            conn.close()
            return {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь с таким логином уже существует'})
            }
        
        # Создаем нового пользователя
        hashed_password = hash_password(password)
        cursor.execute(
            "INSERT INTO users (login, password) VALUES (%s, %s) RETURNING id, created_at",
            (login, hashed_password)
        )
        result = cursor.fetchone()
        user_id, created_at = result
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Пользователь успешно зарегистрирован',
                'user': {
                    'id': user_id,
                    'login': login,
                    'created_at': created_at.isoformat()
                }
            })
        }
        
    except psycopg2.Error as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка базы данных: {str(e)}'})
        }


def handle_login(data: Dict[str, Any]) -> Dict[str, Any]:
    """Обработка входа пользователя"""
    login = data.get('login', '').strip()
    password = data.get('password', '').strip()
    
    # Валидация данных
    if not login or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Логин и пароль обязательны'})
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Ищем пользователя по логину
        cursor.execute(
            "SELECT id, login, password, created_at FROM users WHERE login = %s",
            (login,)
        )
        user_data = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not user_data:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный логин или пароль'})
            }
        
        user_id, user_login, stored_password, created_at = user_data
        
        # Проверяем пароль
        hashed_password = hash_password(password)
        if hashed_password != stored_password:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный логин или пароль'})
            }
        
        # Успешный вход
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Вход выполнен успешно',
                'user': {
                    'id': user_id,
                    'login': user_login,
                    'created_at': created_at.isoformat()
                }
            })
        }
        
    except psycopg2.Error as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка базы данных: {str(e)}'})
        }