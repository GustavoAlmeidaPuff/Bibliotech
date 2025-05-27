import React from 'react';
import styled, { css } from 'styled-components';
import { CardProps } from '../types/common';
import { COLORS, SIZES, ANIMATION_DURATION } from '../constants';

const StyledCard = styled.div<{ variant: CardProps['variant'] }>`
  position: relative;
  width: 100%;
  max-width: 300px;
  height: 200px;
  border-radius: ${SIZES.BORDER_RADIUS};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all ${ANIMATION_DURATION.MEDIUM}s cubic-bezier(0.23, 1, 0.320, 1);
  cursor: pointer;
  
  ${props => {
    switch (props.variant) {
      case 'outlined':
        return css`
          border: 2px solid ${COLORS.PRIMARY};
          background: ${COLORS.BACKGROUND.PRIMARY};
        `;
      case 'elevated':
        return css`
          background: linear-gradient(-45deg, ${COLORS.PRIMARY} 0%, #152a67 100%);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        `;
      default:
        return css`
          background: linear-gradient(-45deg, ${COLORS.PRIMARY} 0%, #152a67 100%);
        `;
    }
  }}

  &:hover {
    transform: rotate(-2deg) scale(1.05);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all ${ANIMATION_DURATION.MEDIUM}s cubic-bezier(0.23, 1, 0.320, 1);
`;

const CardContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: ${COLORS.BACKGROUND.PRIMARY};
  opacity: 0;
  transition: all ${ANIMATION_DURATION.MEDIUM}s cubic-bezier(0.23, 1, 0.320, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  ${StyledCard}:hover & {
    transform: translate(-50%, -50%) rotate(0deg);
    opacity: 1;
  }

  ${StyledCard}:hover ${CardImage} {
    scale: 0;
    transform: rotate(-45deg);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: ${COLORS.TEXT.PRIMARY};
  font-weight: 700;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${COLORS.TEXT.SECONDARY};
  line-height: 1.4;
`;

const Card: React.FC<CardProps> = ({
  title = 'Card Title',
  description = 'Card description goes here',
  imageUrl = 'https://placehold.co/300x200',
  onClick,
  className,
  variant = 'default'
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <StyledCard 
      variant={variant} 
      onClick={handleClick} 
      className={className}
    >
      {imageUrl && <CardImage src={imageUrl} alt={title} />}
      
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </StyledCard>
  );
};

export default Card; 