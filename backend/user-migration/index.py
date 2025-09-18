import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Автоматическое добавление пользователей в PostgreSQL
    Args: event - dict with httpMethod, body containing login and password
          context - object with request_id, function_name, function_version
    Returns: HTTP response dict
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
        
        # Validate input
        if len(login) < 3:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Login must be at least 3 characters'
                })
            }
        
        if len(password) < 6:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Password must be at least 6 characters'
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
        
        # Escape quotes for SQL injection protection
        safe_login = login.replace("'", "''")
        safe_password = password.replace("'", "''")
        
        # Check if user already exists
        cursor.execute(f"SELECT id FROM users WHERE login = '{safe_login}'")
        existing_user = cursor.fetchone()
        
        if existing_user:
            cursor.close()
            conn.close()
            return {
                'statusCode': 409,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'User with this login already exists'
                })
            }
        
        # Insert new user
        cursor.execute(f'''
            INSERT INTO users (login, password, created_at, updated_at) 
            VALUES ('{safe_login}', '{safe_password}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, login, created_at
        ''')
        
        user_data = cursor.fetchone()
        conn.commit()
        
        # Close connections
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'message': 'User created successfully',
                'user': {
                    'id': user_data[0],
                    'login': user_data[1],
                    'created_at': user_data[2].isoformat() if user_data[2] else None
                }
            })
        }
        
    except psycopg2.IntegrityError as e:
        return {
            'statusCode': 409,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': 'User with this login already exists'
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