import json
import os
import psycopg2
from typing import Dict, Any
import hashlib

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Автоматическое выполнение SQL миграций в базе данных
    Args: event - dict с httpMethod, body (migration_sql, migration_name)
          context - объект с request_id, function_name
    Returns: HTTP response с результатом выполнения миграции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    try:
        # Получаем данные из запроса
        body_data = json.loads(event.get('body', '{}'))
        migration_sql = body_data.get('migration_sql', '')
        migration_name = body_data.get('migration_name', 'unnamed_migration')
        
        if not migration_sql:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Отсутствует SQL код миграции'})
            }
        
        # Подключение к базе данных
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не настроен DATABASE_URL'})
            }
        
        # Выполняем миграцию
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        try:
            # Создаем таблицу для отслеживания миграций если её нет
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS migrations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL,
                    sql_hash VARCHAR(64) NOT NULL,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Проверяем, не выполнялась ли уже эта миграция
            sql_hash = hashlib.sha256(migration_sql.encode()).hexdigest()
            cursor.execute('SELECT id FROM migrations WHERE sql_hash = %s', (sql_hash,))
            
            if cursor.fetchone():
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'Миграция уже была выполнена ранее',
                        'hash': sql_hash
                    })
                }
            
            # Выполняем SQL миграцию
            cursor.execute(migration_sql)
            
            # Записываем информацию о миграции
            cursor.execute(
                'INSERT INTO migrations (name, sql_hash) VALUES (%s, %s)',
                (migration_name, sql_hash)
            )
            
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Миграция успешно выполнена',
                    'migration_name': migration_name,
                    'hash': sql_hash,
                    'request_id': context.request_id
                })
            }
            
        except Exception as db_error:
            conn.rollback()
            conn.close()
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': f'Ошибка выполнения миграции: {str(db_error)}'
                })
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': f'Внутренняя ошибка: {str(e)}'
            })
        }