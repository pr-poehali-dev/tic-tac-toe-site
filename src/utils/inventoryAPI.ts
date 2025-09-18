interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  type: string;
  rarity: string;
  icon: string;
  value: number;
  quantity: number;
  equipped: boolean;
  stackable: boolean;
  max_stack: number;
  slot_position?: number;
  acquired_at?: string;
}

interface InventoryStats {
  total_items: number;
  total_value: number;
  equipped_items: number;
}

interface InventoryResponse {
  success: boolean;
  data?: {
    user_id: number;
    inventory: InventoryItem[];
    stats: InventoryStats;
  };
  error?: string;
}

// URL функции из func2url.json
const USER_INVENTORY_URL = 'https://functions.poehali.dev/de2f4c29-9de3-4165-9dbb-43567d499b35';

// Получение инвентаря пользователя
export const getUserInventory = async (userId: number): Promise<InventoryResponse> => {
  try {
    const response = await fetch(`${USER_INVENTORY_URL}?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    console.log(`DEBUG: Inventory response status: ${response.status}`);
    console.log(`DEBUG: Inventory response data:`, data);

    if (response.ok && data.success) {
      console.log('✅ Инвентарь загружен успешно для пользователя:', userId);
      return {
        success: true,
        data: data.data
      };
    } else {
      console.error('❌ Ошибка загрузки инвентаря:', data.error || data);
      return {
        success: false,
        error: data.error || data || 'Не удалось загрузить инвентарь'
      };
    }
  } catch (error) {
    console.error('❌ Сетевая ошибка при загрузке инвентаря:', error);
    return {
      success: false,
      error: 'Не удалось подключиться к серверу'
    };
  }
};

// Проверка доступности API инвентаря
export const checkInventoryAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(USER_INVENTORY_URL, {
      method: 'OPTIONS',
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ API инвентаря недоступно:', error);
    return false;
  }
};

export type { InventoryItem, InventoryStats, InventoryResponse };