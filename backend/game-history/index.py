import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получает историю игр с участниками и ставками
    Args: event - dict с httpMethod, queryStringParameters; context - объект с request_id
    Returns: HTTP response с историей игр
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
        # Подключение к базе данных
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'DATABASE_URL not configured'})
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Получаем параметры запроса
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
        limit = int(params.get('limit', 20))
        
        # Базовый запрос для получения игр
        base_query = """
            SELECT 
                g.id,
                g.game_type,
                g.status,
                g.winner_id,
                g.total_pot_value,
                g.game_data,
                g.started_at,
                g.finished_at,
                u.login as winner_login
            FROM games g
            LEFT JOIN users u ON g.winner_id = u.id
        """
        
        # Добавляем фильтр по пользователю если указан
        if user_id:
            base_query += """
                WHERE g.id IN (
                    SELECT DISTINCT game_id 
                    FROM game_participants 
                    WHERE user_id = %s
                )
            """
            query_params = [user_id, limit]
        else:
            query_params = [limit]
        
        base_query += " ORDER BY g.started_at DESC LIMIT %s"
        
        cur.execute(base_query, query_params)
        games_data = cur.fetchall()
        
        games: List[Dict[str, Any]] = []
        
        for game_row in games_data:
            game_id = game_row[0]
            
            # Получаем участников игры
            cur.execute("""
                SELECT 
                    gp.user_id,
                    gp.position,
                    gp.joined_at,
                    gp.player_data,
                    u.login
                FROM game_participants gp
                JOIN users u ON gp.user_id = u.id
                WHERE gp.game_id = %s
                ORDER BY gp.position ASC, gp.joined_at ASC
            """, [game_id])
            participants_data = cur.fetchall()
            
            # Получаем ставки игры
            cur.execute("""
                SELECT 
                    gb.user_id,
                    gb.bet_amount,
                    gb.item_value,
                    gb.status,
                    gb.placed_at,
                    i.name as item_name,
                    i.icon,
                    u.login
                FROM game_bets gb
                JOIN user_inventory ui ON gb.item_id = ui.id
                JOIN items i ON ui.item_id = i.id
                JOIN users u ON gb.user_id = u.id
                WHERE gb.game_id = %s
                ORDER BY gb.placed_at ASC
            """, [game_id])
            bets_data = cur.fetchall()
            
            # Формируем данные игры
            game = {
                'id': str(game_row[0]),
                'game_type': game_row[1],
                'status': game_row[2],
                'winner_id': game_row[3],
                'winner_login': game_row[8],
                'total_pot_value': game_row[4],
                'game_data': game_row[5],
                'started_at': game_row[6].isoformat() if game_row[6] else None,
                'finished_at': game_row[7].isoformat() if game_row[7] else None,
                'participants': [
                    {
                        'user_id': p[0],
                        'login': p[4],
                        'position': p[1],
                        'joined_at': p[2].isoformat() if p[2] else None,
                        'player_data': p[3]
                    }
                    for p in participants_data
                ],
                'bets': [
                    {
                        'user_id': b[0],
                        'login': b[7],
                        'bet_amount': b[1],
                        'item_value': b[2],
                        'status': b[3],
                        'placed_at': b[4].isoformat() if b[4] else None,
                        'item_name': b[5],
                        'item_icon': b[6]
                    }
                    for b in bets_data
                ]
            }
            
            games.append(game)
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'games': games,
                'total_count': len(games)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }