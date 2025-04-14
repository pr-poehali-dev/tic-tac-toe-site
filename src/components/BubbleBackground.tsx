import React, { useEffect, useState } from 'react';

interface Bubble {
  id: number;
  size: number;
  left: number;
  delay: number;
}

const BubbleBackground: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  
  useEffect(() => {
    // Создаем пузырьки при монтировании компонента
    const bubbleCount = Math.floor(window.innerWidth / 100); // Количество пузырьков зависит от ширины экрана
    
    const newBubbles: Bubble[] = [];
    for (let i = 0; i < bubbleCount; i++) {
      newBubbles.push({
        id: i,
        size: Math.random() * 2 + 0.5, // Размер от 0.5 до 2.5rem
        left: Math.random() * 100, // Позиция слева (0-100%)
        delay: Math.random() * 10 // Задержка анимации (0-10s)
      });
    }
    
    setBubbles(newBubbles);
    
    // Очищаем при размонтировании
    return () => {
      setBubbles([]);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div className="ocean-waves"></div>
      
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            '--bubble-size': bubble.size,
            '--bubble-delay': bubble.delay,
            left: `${bubble.left}%`,
            bottom: '-20px'
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default BubbleBackground;