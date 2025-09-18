import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Аутентификация пользователей через PostgreSQL
    Args: event - dict with httpMethod, body containing login and password
          context - object with request_id, function_name, function_version
    Returns: HTTP response dict with user data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Parse request body
        body_data = json.loads(event.get('body', '{}'))
        login = body_data.get('login', '').strip()
        password = body_data.get('password', '').strip()
        
        if not login or not password:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Login and password are required'
                })
            }
        
        # Get database connection
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Database connection not configured'
                })
            }
        
        # Connect to PostgreSQL
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Find user by login and password
        cursor.execute('''
            SELECT id, login, created_at, updated_at 
            FROM users 
            WHERE login = %s AND password = %s
        ''', (login, password))
        
        user_data = cursor.fetchone()
        
        # Close connections
        cursor.close()
        conn.close()
        
        if user_data:
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({
                    'success': True,
                    'message': 'User authenticated successfully',
                    'user': {
                        'id': user_data[0],
                        'user': user_data[1],  # Используем поле 'user' для совместимости с фронтендом
                        'login': user_data[1],
                        'createdAt': user_data[2].isoformat() if user_data[2] else None,
                        'updatedAt': user_data[3].isoformat() if user_data[3] else None
                    }
                })
            }
        else:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Invalid login or password'
                })
            }
        
    except psycopg2.Error as db_error:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': f'Database error: {str(db_error)}'
            })
        }
    except Exception as error:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': f'Internal server error: {str(error)}'
            })
        }