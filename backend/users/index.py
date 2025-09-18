import json
import os
import psycopg2
import hashlib
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления пользователями (создание, чтение, обновление, удаление)
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с request_id, function_name
    Returns: HTTP response с данными пользователей или результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        # Подключение к базе данных
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не настроен DATABASE_URL'})
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Создаем таблицу пользователей если её нет
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                login VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        ''')
        conn.commit()
        
        if method == 'GET':
            # Получить список всех пользователей
            cursor.execute('''
                SELECT id, login, created_at, is_active 
                FROM users 
                ORDER BY created_at DESC
            ''')
            users = cursor.fetchall()
            
            users_list = [
                {
                    'id': user[0],
                    'login': user[1],
                    'created_at': user[2].isoformat() if user[2] else None,
                    'is_active': user[3]
                }
                for user in users
            ]
            
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'users': users_list,
                    'total': len(users_list)
                })
            }
        
        elif method == 'POST':
            # Создать нового пользователя
            body_data = json.loads(event.get('body', '{}'))
            login = body_data.get('login', '').strip()
            password = body_data.get('password', '').strip()
            
            if not login or not password:
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Логин и пароль обязательны'})
                }
            
            if len(login) < 3 or len(password) < 6:
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Логин должен быть не менее 3 символов, пароль не менее 6'})
                }
            
            # Проверяем уникальность логина
            cursor.execute('SELECT id FROM users WHERE login = %s', (login,))
            if cursor.fetchone():
                conn.close()
                return {
                    'statusCode': 409,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким логином уже существует'})
                }
            
            # Хешируем пароль
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Создаем пользователя
            cursor.execute(
                'INSERT INTO users (login, password_hash) VALUES (%s, %s) RETURNING id, created_at',
                (login, password_hash)
            )
            result = cursor.fetchone()
            user_id, created_at = result
            
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': user_id,
                        'login': login,
                        'created_at': created_at.isoformat(),
                        'is_active': True
                    },
                    'message': 'Пользователь успешно создан'
                })
            }
        
        elif method == 'PUT':
            # Обновить пользователя (активация/деактивация)
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            is_active = body_data.get('is_active')
            
            if user_id is None or is_active is None:
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется user_id и is_active'})
                }
            
            cursor.execute(
                'UPDATE users SET is_active = %s WHERE id = %s RETURNING login',
                (is_active, user_id)
            )
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь не найден'})
                }
            
            conn.commit()
            conn.close()
            
            action = 'активирован' if is_active else 'деактивирован'
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Пользователь {result[0]} {action}'
                })
            }
        
        elif method == 'DELETE':
            # Удалить пользователя
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            
            if not user_id:
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется user_id'})
                }
            
            cursor.execute(
                'DELETE FROM users WHERE id = %s RETURNING login',
                (user_id,)
            )
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь не найден'})
                }
            
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Пользователь {result[0]} удален'
                })
            }
        
        else:
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Метод не поддерживается'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': f'Внутренняя ошибка: {str(e)}'
            })
        }