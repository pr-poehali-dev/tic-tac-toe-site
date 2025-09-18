import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка email уведомлений о регистрации новых пользователей
    Args: event - dict с httpMethod, body (user_login, user_email, notification_type)
          context - объект с request_id, function_name
    Returns: HTTP response с результатом отправки email
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
        user_login = body_data.get('user_login', '')
        user_email = body_data.get('user_email', '')
        notification_type = body_data.get('notification_type', 'registration')
        
        if not user_login:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Отсутствует логин пользователя'})
            }
        
        # Получаем настройки SMTP из переменных окружения
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        admin_email = os.environ.get('ADMIN_EMAIL')
        
        # Проверяем наличие необходимых настроек
        missing_configs = []
        if not smtp_host:
            missing_configs.append('SMTP_HOST')
        if not smtp_user:
            missing_configs.append('SMTP_USER')
        if not smtp_password:
            missing_configs.append('SMTP_PASSWORD')
        if not admin_email:
            missing_configs.append('ADMIN_EMAIL')
            
        if missing_configs:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': f'Не настроены параметры email: {", ".join(missing_configs)}',
                    'missing_configs': missing_configs
                })
            }
        
        # Создаем email сообщение
        current_time = datetime.now().strftime('%d.%m.%Y %H:%M:%S')
        
        if notification_type == 'registration':
            subject = f'🎉 Новая регистрация: {user_login}'
            
            # HTML версия письма
            html_body = f'''
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .info-box {{ background: white; padding: 15px; border-left: 4px solid #667eea; 
                                margin: 15px 0; border-radius: 5px; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Новый пользователь зарегистрирован!</h1>
                    </div>
                    <div class="content">
                        <p>Привет! На вашем сайте зарегистрировался новый пользователь:</p>
                        
                        <div class="info-box">
                            <p><strong>👤 Логин:</strong> {user_login}</p>
                            <p><strong>📧 Email:</strong> {user_email if user_email else 'Не указан'}</p>
                            <p><strong>⏰ Время регистрации:</strong> {current_time}</p>
                            <p><strong>🆔 ID запроса:</strong> {context.request_id}</p>
                        </div>
                        
                        <p>Пользователь был автоматически добавлен в базу данных PostgreSQL.</p>
                        
                        <p>Вы можете управлять пользователями через административную панель.</p>
                    </div>
                    <div class="footer">
                        <p>Это автоматическое уведомление от системы регистрации</p>
                    </div>
                </div>
            </body>
            </html>
            '''
            
            # Текстовая версия
            text_body = f'''
Новый пользователь зарегистрирован!

Логин: {user_login}
Email: {user_email if user_email else 'Не указан'}
Время регистрации: {current_time}
ID запроса: {context.request_id}

Пользователь был автоматически добавлен в базу данных PostgreSQL.
Вы можете управлять пользователями через административную панель.

Это автоматическое уведомление от системы регистрации.
            '''
        else:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестный тип уведомления'})
            }
        
        # Создаем email сообщение
        msg = MIMEMultipart('alternative')
        msg['From'] = smtp_user
        msg['To'] = admin_email
        msg['Subject'] = subject
        
        # Добавляем текстовую и HTML версии
        part1 = MIMEText(text_body, 'plain', 'utf-8')
        part2 = MIMEText(html_body, 'html', 'utf-8')
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Отправляем email
        try:
            # Подключаемся к SMTP серверу
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()  # Включаем шифрование
            server.login(smtp_user, smtp_password)
            
            # Отправляем сообщение
            text = msg.as_string()
            server.sendmail(smtp_user, admin_email, text)
            server.quit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Email уведомление отправлено на {admin_email}',
                    'user_login': user_login,
                    'notification_type': notification_type,
                    'timestamp': current_time,
                    'request_id': context.request_id
                })
            }
            
        except smtplib.SMTPAuthenticationError:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Ошибка аутентификации SMTP. Проверьте логин и пароль email аккаунта'
                })
            }
        except smtplib.SMTPConnectError:
            return {
                'statusCode': 503,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Не удается подключиться к SMTP серверу. Проверьте хост и порт'
                })
            }
        except Exception as smtp_error:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': f'Ошибка отправки email: {str(smtp_error)}'
                })
            }
            
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректный JSON в теле запроса'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': f'Внутренняя ошибка: {str(e)}'
            })
        }