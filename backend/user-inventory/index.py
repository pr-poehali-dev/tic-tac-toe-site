import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получение инвентаря пользователя из PostgreSQL
    Args: event - dict with httpMethod, queryStringParameters с user_id
          context - object with request_id, function_name, function_version
    Returns: HTTP response dict с данными инвентаря
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Получаем user_id из параметров запроса
        query_params = event.get('queryStringParameters', {}) or {}
        user_id = query_params.get('user_id')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'user_id parameter is required'
                })
            }
        
        # Проверяем что user_id - число
        try:
            user_id = int(user_id)
        except ValueError:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'user_id must be a number'
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
        
        # Получаем инвентарь пользователя с информацией о предметах
        cursor.execute(f'''
            SELECT 
                ui.id,
                i.name,
                i.description,
                i.type,
                i.rarity,
                i.icon,
                i.value,
                ui.quantity,
                ui.equipped,
                i.stackable,
                i.max_stack,
                ui.slot_position,
                ui.acquired_at
            FROM user_inventory ui
            JOIN items i ON ui.item_id = i.id
            WHERE ui.user_id = {user_id}
            ORDER BY i.type, i.name
        ''')
        
        inventory_data = cursor.fetchall()
        
        # Close connections
        cursor.close()
        conn.close()
        
        # Формируем список предметов
        inventory = []
        for row in inventory_data:
            item = {
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'type': row[3],
                'rarity': row[4],
                'icon': row[5],
                'value': row[6],
                'quantity': row[7],
                'equipped': row[8],
                'stackable': row[9],
                'max_stack': row[10],
                'slot_position': row[11],
                'acquired_at': row[12].isoformat() if row[12] else None
            }
            inventory.append(item)
        
        # Подсчитываем статистику
        total_items = len(inventory)
        total_value = sum(item['value'] * item['quantity'] for item in inventory)
        equipped_items = sum(1 for item in inventory if item['equipped'])
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'data': {
                    'user_id': user_id,
                    'inventory': inventory,
                    'stats': {
                        'total_items': total_items,
                        'total_value': total_value,
                        'equipped_items': equipped_items
                    }
                }
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