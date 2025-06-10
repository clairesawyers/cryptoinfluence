import React from 'react';
import { BubbleCard } from '../../types';
import { MobileVideoCardSimple } from './MobileVideoCardSimple';
import { useMobileDetect } from '../../hooks/useMobileDetect';
import { getResponsiveValue, SPACING, calculateGridLayout } from '../../utils/responsive';

interface MobileVideoGridProps {
  cards: BubbleCard[];
  selectedCard: BubbleCard | null;
  onCardSelect: (card: BubbleCard) => void;
  className?: string;
}

export const MobileVideoGrid: React.FC<MobileVideoGridProps> = ({
  cards,
  selectedCard,
  onCardSelect,
  className = ''
}) => {
  const detection = useMobileDetect();
  const spacing = getResponsiveValue(SPACING, detection);
  
  // Calculate grid layout
  const gridLayout = calculateGridLayout(detection.viewportWidth, detection);
  
  // On mobile, use single column for portrait, 2 columns for landscape
  const columns = detection.isMobile 
    ? (detection.orientation === 'portrait' ? 1 : 2)
    : gridLayout.columns;

  return (
    <div 
      className={`w-full ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${spacing}px`,
        padding: `${spacing}px`
      }}
    >
      {cards.map((card) => (
        <MobileVideoCardSimple
          key={card.id}
          card={card}
          isSelected={selectedCard?.id === card.id}
          onSelect={onCardSelect}
        />
      ))}
    </div>
  );
};

// Mobile-optimized scrollable list view
interface MobileVideoListProps {
  cards: BubbleCard[];
  selectedCard: BubbleCard | null;
  onCardSelect: (card: BubbleCard) => void;
  className?: string;
}

export const MobileVideoList: React.FC<MobileVideoListProps> = ({
  cards,
  selectedCard,
  onCardSelect,
  className = ''
}) => {
  const detection = useMobileDetect();
  const spacing = getResponsiveValue(SPACING, detection);

  return (
    <div 
      className={`
        w-full overflow-y-auto mobile-scroll 
        ${className}
      `}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      <div style={{ padding: `${spacing}px` }}>
        {cards.map((card, index) => (
          <div key={card.id} style={{ marginBottom: index < cards.length - 1 ? `${spacing}px` : 0 }}>
            <MobileVideoCardSimple
              card={card}
              isSelected={selectedCard?.id === card.id}
              onSelect={onCardSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};