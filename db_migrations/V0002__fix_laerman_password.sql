-- Исправляем пароль пользователя Laerman (хешируем "Tvthwqu88")
UPDATE users 
SET password = '9464e6f6b6b7ad1e68b4c89b6d1e6ec7f5ad82fd36cdec5dc1b0b8b4f02d8949'
WHERE login = 'Laerman';