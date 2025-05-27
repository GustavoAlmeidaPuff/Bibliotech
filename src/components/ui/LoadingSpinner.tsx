import React from 'react';
import styled, { keyframes } from 'styled-components';
import { COLORS, ANIMATION_DURATION } from '../../constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div<{ size: LoadingSpinnerProps['size']; color: string }>`
  display: inline-block;
  
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          width: 16px;
          height: 16px;
          border-width: 2px;
        `;
      case 'large':
        return `
          width: 32px;
          height: 32px;
          border-width: 3px;
        `;
      default:
        return `
          width: 24px;
          height: 24px;
          border-width: 2px;
        `;
    }
  }}

  border: ${props => props.size === 'large' ? '3px' : '2px'} solid transparent;
  border-top-color: ${props => props.color};
  border-radius: 50%;
  animation: ${spin} ${ANIMATION_DURATION.LONG}s linear infinite;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = COLORS.PRIMARY,
  className
}) => {
  return (
    <SpinnerContainer 
      size={size} 
      color={color} 
      className={className}
      role="status"
      aria-label="Carregando..."
    />
  );
};

export default LoadingSpinner; 