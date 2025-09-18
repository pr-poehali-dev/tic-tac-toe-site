import json
import os
import psycopg2
from datetime import datetime, timezone
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Заполняет базу данных демо-играми для тестирования системы
    Args: event - dict с httpMethod; context - объект с request_id
    Returns: HTTP response с результатом заполнения
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
        
        # Очищаем существующие демо-данные (если есть)
        cur.execute("DELETE FROM game_bets WHERE game_id IN (SELECT id FROM games WHERE game_type IN ('demo_poker', 'demo_blackjack'))")
        cur.execute("DELETE FROM game_participants WHERE game_id IN (SELECT id FROM games WHERE game_type IN ('demo_poker', 'demo_blackjack'))")
        cur.execute("DELETE FROM games WHERE game_type IN ('demo_poker', 'demo_blackjack')")
        
        # Добавляем демо-игры
        games_data = [
            {
                'game_type': 'demo_poker',
                'status': 'finished',
                'winner_id': 1,
                'total_pot_value': 1500,
                'game_data': {'rounds': 3, 'final_hand': 'royal_flush', 'duration_minutes': 45},
                'started_at': '2024-09-15 14:30:00+00',
                'finished_at': '2024-09-15 15:15:00+00'
            },
            {
                'game_type': 'demo_blackjack', 
                'status': 'finished',
                'winner_id': 1,
                'total_pot_value': 800,
                'game_data': {'dealer_score': 19, 'player_score': 21, 'cards_dealt': 12},
                'started_at': '2024-09-16 10:20:00+00',
                'finished_at': '2024-09-16 10:35:00+00'
            }
        ]
        
        game_ids = []
        for game in games_data:
            cur.execute("""
                INSERT INTO games (game_type, status, winner_id, total_pot_value, game_data, started_at, finished_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                game['game_type'], game['status'], game['winner_id'], 
                game['total_pot_value'], json.dumps(game['game_data']),
                game['started_at'], game['finished_at']
            ))
            game_id = cur.fetchone()[0]
            game_ids.append(game_id)
        
        # Добавляем участников игр
        participants_data = [
            {'game_id': game_ids[0], 'user_id': 1, 'position': 1, 'player_data': {'cards': ['AS', 'KS'], 'final_bet': 500}},
            {'game_id': game_ids[1], 'user_id': 1, 'position': 1, 'player_data': {'cards': ['AH', '10S'], 'score': 21}}
        ]
        
        for participant in participants_data:
            cur.execute("""
                INSERT INTO game_participants (game_id, user_id, position, player_data)
                VALUES (%s, %s, %s, %s)
            """, (
                participant['game_id'], participant['user_id'], 
                participant['position'], json.dumps(participant['player_data'])
            ))
        
        # Добавляем ставки (используем существующие предметы из инвентаря)
        cur.execute("SELECT id, item_id, quantity FROM user_inventory WHERE user_id = 1 LIMIT 2")
        inventory_items = cur.fetchall()
        
        if inventory_items:
            bets_data = [
                {
                    'game_id': game_ids[0],
                    'user_id': 1,
                    'item_id': inventory_items[0][0], 
                    'bet_amount': 1,
                    'item_value': 500,
                    'status': 'won'
                },
                {
                    'game_id': game_ids[1],
                    'user_id': 1,
                    'item_id': inventory_items[1][0] if len(inventory_items) > 1 else inventory_items[0][0],
                    'bet_amount': 1,
                    'item_value': 300,
                    'status': 'won'
                }
            ]
            
            for bet in bets_data:
                cur.execute("""
                    INSERT INTO game_bets (game_id, user_id, item_id, bet_amount, item_value, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    bet['game_id'], bet['user_id'], bet['item_id'],
                    bet['bet_amount'], bet['item_value'], bet['status']
                ))
        
        conn.commit()
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
                'message': 'Демо-данные для игр успешно добавлены',
                'games_created': len(game_ids),
                'participants_added': len(participants_data),
                'bets_added': len(inventory_items)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }