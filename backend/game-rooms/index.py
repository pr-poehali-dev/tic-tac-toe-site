import json
import os
import psycopg2
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления игровыми комнатами крестиков-ноликов
    Args: event с httpMethod, body, queryStringParameters; context с request_id
    Returns: HTTP response с данными комнат или результатом операции
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
        DATABASE_URL = os.environ.get('DATABASE_URL')
        if not DATABASE_URL:
            return create_error_response(500, 'DATABASE_URL не настроен')
        
        conn = psycopg2.connect(DATABASE_URL)
        
        if method == 'GET':
            return handle_get_rooms(conn, event)
        elif method == 'POST':
            return handle_create_room(conn, event)
        elif method == 'PUT':
            return handle_update_room(conn, event)
        elif method == 'DELETE':
            return handle_delete_room(conn, event)
        else:
            return create_error_response(405, 'Метод не поддерживается')
            
    except Exception as e:
        return create_error_response(500, f'Ошибка сервера: {str(e)}')
    finally:
        if 'conn' in locals():
            conn.close()

def handle_get_rooms(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    """Получение списка комнат"""
    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id')
    room_id = params.get('room_id')
    
    cursor = conn.cursor()
    
    try:
        if room_id:
            # Получаем конкретную комнату
            cursor.execute("""
                SELECT r.id, r.room_code, r.creator_id, r.current_turn_player_id, 
                       r.status, r.winner_user_id, r.board, r.game_data,
                       r.created_at, r.started_at, r.finished_at, r.last_activity,
                       r.bot_check_scheduled,
                       json_agg(
                           json_build_object(
                               'id', p.id,
                               'user_id', p.user_id,
                               'symbol', p.symbol,
                               'is_bot', p.is_bot,
                               'stake_item_id', p.stake_item_id,
                               'stake_item_name', p.stake_item_name,
                               'stake_item_value', p.stake_item_value,
                               'joined_at', p.joined_at
                           ) ORDER BY p.joined_at
                       ) as players
                FROM game_rooms r
                LEFT JOIN game_room_players p ON r.id = p.room_id
                WHERE r.id = %s
                GROUP BY r.id
            """, (room_id,))
            
            row = cursor.fetchone()
            if not row:
                return create_error_response(404, 'Комната не найдена')
            
            room = format_room_data(row)
            return create_success_response({'room': room})
        else:
            # Получаем все активные комнаты
            cursor.execute("""
                SELECT r.id, r.room_code, r.creator_id, r.current_turn_player_id, 
                       r.status, r.winner_user_id, r.board, r.game_data,
                       r.created_at, r.started_at, r.finished_at, r.last_activity,
                       r.bot_check_scheduled,
                       json_agg(
                           json_build_object(
                               'id', p.id,
                               'user_id', p.user_id,
                               'symbol', p.symbol,
                               'is_bot', p.is_bot,
                               'stake_item_id', p.stake_item_id,
                               'stake_item_name', p.stake_item_name,
                               'stake_item_value', p.stake_item_value,
                               'joined_at', p.joined_at
                           ) ORDER BY p.joined_at
                       ) as players
                FROM game_rooms r
                LEFT JOIN game_room_players p ON r.id = p.room_id
                WHERE r.status IN ('waiting', 'playing')
                  AND r.last_activity > NOW() - INTERVAL '1 hour'
                GROUP BY r.id
                ORDER BY r.created_at DESC
            """)
            
            rows = cursor.fetchall()
            rooms = [format_room_data(row) for row in rows]
            
            return create_success_response({'rooms': rooms})
            
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

def handle_create_room(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    """Создание новой комнаты"""
    try:
        body_data = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return create_error_response(400, 'Некорректные данные JSON')
    
    required_fields = ['creator_id', 'stake_item_id', 'stake_item_name', 'stake_item_value']
    for field in required_fields:
        if field not in body_data:
            return create_error_response(400, f'Отсутствует поле: {field}')
    
    cursor = conn.cursor()
    
    try:
        # Проверяем, не участвует ли пользователь уже в другой комнате
        cursor.execute("""
            SELECT COUNT(*) FROM game_room_players p
            JOIN game_rooms r ON p.room_id = r.id
            WHERE p.user_id = %s AND r.status IN ('waiting', 'playing')
        """, (body_data['creator_id'],))
        
        if cursor.fetchone()[0] > 0:
            return create_error_response(409, 'Вы уже участвуете в другой игре')
        
        # Генерируем уникальные ID и код комнаты
        room_id = str(uuid.uuid4())
        room_code = generate_room_code()
        
        # Создаем комнату
        cursor.execute("""
            INSERT INTO game_rooms (id, room_code, creator_id, status, board, last_activity)
            VALUES (%s, %s, %s, 'waiting', %s, NOW())
        """, (room_id, room_code, body_data['creator_id'], json.dumps([None] * 9)))
        
        # Добавляем создателя как игрока
        cursor.execute("""
            INSERT INTO game_room_players (room_id, user_id, symbol, stake_item_id, stake_item_name, stake_item_value)
            VALUES (%s, %s, 'X', %s, %s, %s)
        """, (room_id, body_data['creator_id'], body_data['stake_item_id'], 
              body_data['stake_item_name'], body_data['stake_item_value']))
        
        conn.commit()
        
        # Получаем созданную комнату
        return handle_get_rooms(conn, {'queryStringParameters': {'room_id': room_id}})
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

def handle_update_room(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    """Обновление комнаты (присоединение игрока, ход, завершение игры)"""
    try:
        body_data = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return create_error_response(400, 'Некорректные данные JSON')
    
    action = body_data.get('action')
    room_id = body_data.get('room_id')
    
    if not action or not room_id:
        return create_error_response(400, 'Отсутствуют обязательные поля: action, room_id')
    
    cursor = conn.cursor()
    
    try:
        if action == 'join':
            return handle_join_room(conn, cursor, body_data)
        elif action == 'move':
            return handle_make_move(conn, cursor, body_data)
        elif action == 'leave':
            return handle_leave_room(conn, cursor, body_data)
        else:
            return create_error_response(400, f'Неизвестное действие: {action}')
            
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

def handle_join_room(conn, cursor, data: Dict[str, Any]) -> Dict[str, Any]:
    """Присоединение к комнате"""
    required_fields = ['room_id', 'user_id', 'stake_item_id', 'stake_item_name', 'stake_item_value']
    for field in required_fields:
        if field not in data:
            return create_error_response(400, f'Отсутствует поле: {field}')
    
    # Проверяем состояние комнаты
    cursor.execute("""
        SELECT status, 
               (SELECT COUNT(*) FROM game_room_players WHERE room_id = %s) as player_count
        FROM game_rooms WHERE id = %s
    """, (data['room_id'], data['room_id']))
    
    row = cursor.fetchone()
    if not row:
        return create_error_response(404, 'Комната не найдена')
    
    status, player_count = row
    if status != 'waiting':
        return create_error_response(409, 'Комната недоступна для присоединения')
    
    if player_count >= 2:
        return create_error_response(409, 'В комнате уже достаточно игроков')
    
    # Проверяем, не участвует ли пользователь уже в другой комнате
    cursor.execute("""
        SELECT COUNT(*) FROM game_room_players p
        JOIN game_rooms r ON p.room_id = r.id
        WHERE p.user_id = %s AND r.status IN ('waiting', 'playing')
    """, (data['user_id'],))
    
    if cursor.fetchone()[0] > 0:
        return create_error_response(409, 'Вы уже участвуете в другой игре')
    
    # Добавляем игрока
    cursor.execute("""
        INSERT INTO game_room_players (room_id, user_id, symbol, stake_item_id, stake_item_name, stake_item_value)
        VALUES (%s, %s, 'O', %s, %s, %s)
    """, (data['room_id'], data['user_id'], data['stake_item_id'], 
          data['stake_item_name'], data['stake_item_value']))
    
    # Обновляем статус комнаты на "playing" и устанавливаем первого игрока
    cursor.execute("""
        UPDATE game_rooms 
        SET status = 'playing', 
            started_at = NOW(),
            last_activity = NOW(),
            current_turn_player_id = (
                SELECT user_id FROM game_room_players 
                WHERE room_id = %s AND symbol = 'X' LIMIT 1
            )
        WHERE id = %s
    """, (data['room_id'], data['room_id']))
    
    conn.commit()
    
    # Возвращаем обновленную комнату
    return handle_get_rooms(conn, {'queryStringParameters': {'room_id': data['room_id']}})

def handle_make_move(conn, cursor, data: Dict[str, Any]) -> Dict[str, Any]:
    """Совершение хода в игре"""
    required_fields = ['room_id', 'user_id', 'position']
    for field in required_fields:
        if field not in data:
            return create_error_response(400, f'Отсутствует поле: {field}')
    
    position = data['position']
    if not isinstance(position, int) or position < 0 or position > 8:
        return create_error_response(400, 'Позиция должна быть от 0 до 8')
    
    # Получаем текущее состояние игры
    cursor.execute("""
        SELECT r.board, r.current_turn_player_id, r.status,
               p.symbol
        FROM game_rooms r
        JOIN game_room_players p ON r.id = p.room_id
        WHERE r.id = %s AND p.user_id = %s
    """, (data['room_id'], data['user_id']))
    
    row = cursor.fetchone()
    if not row:
        return create_error_response(404, 'Комната не найдена или вы не участвуете в игре')
    
    board, current_turn_player_id, status, player_symbol = row
    
    if status != 'playing':
        return create_error_response(409, 'Игра не активна')
    
    if current_turn_player_id != data['user_id']:
        return create_error_response(409, 'Сейчас не ваш ход')
    
    # Проверяем, что клетка пуста
    if board[position] is not None:
        return create_error_response(409, 'Клетка уже занята')
    
    # Делаем ход
    new_board = board.copy()
    new_board[position] = player_symbol
    
    # Проверяем на победу
    winner = check_winner(new_board)
    is_board_full = all(cell is not None for cell in new_board)
    
    # Определяем следующего игрока
    cursor.execute("""
        SELECT user_id FROM game_room_players 
        WHERE room_id = %s AND user_id != %s LIMIT 1
    """, (data['room_id'], data['user_id']))
    
    next_player_row = cursor.fetchone()
    next_player_id = next_player_row[0] if next_player_row else None
    
    # Обновляем игру
    if winner or is_board_full:
        # Игра завершена
        winner_user_id = data['user_id'] if winner == player_symbol else (next_player_id if winner else None)
        
        cursor.execute("""
            UPDATE game_rooms 
            SET board = %s, 
                status = 'finished',
                winner_user_id = %s,
                finished_at = NOW(),
                last_activity = NOW(),
                current_turn_player_id = NULL
            WHERE id = %s
        """, (json.dumps(new_board), winner_user_id, data['room_id']))
    else:
        # Игра продолжается
        cursor.execute("""
            UPDATE game_rooms 
            SET board = %s, 
                current_turn_player_id = %s,
                last_activity = NOW()
            WHERE id = %s
        """, (json.dumps(new_board), next_player_id, data['room_id']))
    
    conn.commit()
    
    # Возвращаем обновленную комнату
    return handle_get_rooms(conn, {'queryStringParameters': {'room_id': data['room_id']}})

def handle_leave_room(conn, cursor, data: Dict[str, Any]) -> Dict[str, Any]:
    """Покидание комнаты"""
    required_fields = ['room_id', 'user_id']
    for field in required_fields:
        if field not in data:
            return create_error_response(400, f'Отсутствует поле: {field}')
    
    # Проверяем, что пользователь в комнате
    cursor.execute("""
        SELECT COUNT(*) FROM game_room_players 
        WHERE room_id = %s AND user_id = %s
    """, (data['room_id'], data['user_id']))
    
    if cursor.fetchone()[0] == 0:
        return create_error_response(404, 'Вы не участвуете в этой комнате')
    
    # Удаляем игрока из комнаты
    cursor.execute("""
        DELETE FROM game_room_players 
        WHERE room_id = %s AND user_id = %s
    """, (data['room_id'], data['user_id']))
    
    # Проверяем, остались ли игроки
    cursor.execute("""
        SELECT COUNT(*) FROM game_room_players WHERE room_id = %s
    """, (data['room_id'],))
    
    players_left = cursor.fetchone()[0]
    
    if players_left == 0:
        # Удаляем пустую комнату
        cursor.execute("DELETE FROM game_rooms WHERE id = %s", (data['room_id'],))
    else:
        # Обновляем статус комнаты
        cursor.execute("""
            UPDATE game_rooms 
            SET status = 'waiting', 
                current_turn_player_id = NULL,
                last_activity = NOW()
            WHERE id = %s
        """, (data['room_id'],))
    
    conn.commit()
    
    return create_success_response({'message': 'Вы покинули комнату'})

def handle_delete_room(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    """Удаление комнаты"""
    params = event.get('queryStringParameters') or {}
    room_id = params.get('room_id')
    
    if not room_id:
        return create_error_response(400, 'Отсутствует room_id')
    
    cursor = conn.cursor()
    
    try:
        # Удаляем игроков и комнату
        cursor.execute("DELETE FROM game_room_players WHERE room_id = %s", (room_id,))
        cursor.execute("DELETE FROM game_rooms WHERE id = %s", (room_id,))
        
        conn.commit()
        
        return create_success_response({'message': 'Комната удалена'})
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

def format_room_data(row) -> Dict[str, Any]:
    """Форматирование данных комнаты"""
    (room_id, room_code, creator_id, current_turn_player_id, status, winner_user_id,
     board, game_data, created_at, started_at, finished_at, last_activity, 
     bot_check_scheduled, players_json) = row
    
    # Преобразуем игроков из JSON
    players = players_json if players_json and players_json[0]['id'] is not None else []
    
    return {
        'id': room_id,
        'room_code': room_code,
        'creator_id': creator_id,
        'current_turn_player_id': current_turn_player_id,
        'status': status,
        'winner_user_id': winner_user_id,
        'board': board,
        'game_data': game_data,
        'created_at': created_at.isoformat() if created_at else None,
        'started_at': started_at.isoformat() if started_at else None,
        'finished_at': finished_at.isoformat() if finished_at else None,
        'last_activity': last_activity.isoformat() if last_activity else None,
        'bot_check_scheduled': bot_check_scheduled,
        'players': players
    }

def check_winner(board: List) -> Optional[str]:
    """Проверка на победителя"""
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # строки
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # столбцы
        [0, 4, 8], [2, 4, 6]              # диагонали
    ]
    
    for combo in winning_combinations:
        if (board[combo[0]] is not None and 
            board[combo[0]] == board[combo[1]] == board[combo[2]]):
            return board[combo[0]]
    
    return None

def generate_room_code() -> str:
    """Генерация кода комнаты"""
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def create_success_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Создание успешного ответа"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'data': data
        })
    }

def create_error_response(status_code: int, message: str) -> Dict[str, Any]:
    """Создание ответа с ошибкой"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': False,
            'error': message
        })
    }