import React from 'react';
import styled, { css } from 'styled-components';
import { ButtonProps } from '../../types/common';
import { COLORS, ANIMATION_DURATION, SIZES, BREAKPOINTS } from '../../constants';

const StyledButton = styled.button<ButtonProps>`
  border: none;
  border-radius: ${SIZES.BORDER_RADIUS};
  cursor: pointer;
  font-weight: 500;
  transition: all ${ANIMATION_DURATION.SHORT}s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${props => {
    switch (props.size) {
      case 'small':
        return css`
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          min-height: 32px;
        `;
      case 'large':
        return css`
          padding: 1rem 2rem;
          font-size: 1.125rem;
          min-height: 48px;
        `;
      default:
        return css`
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          min-height: 40px;
        `;
    }
  }}

  ${props => {
    switch (props.variant) {
      case 'secondary':
        return css`
          background: ${COLORS.BACKGROUND.SECONDARY};
          color: ${COLORS.TEXT.PRIMARY};
          border: 1px solid ${COLORS.BACKGROUND.SECONDARY};
          
          &:hover:not(:disabled) {
            background: #e9ecef;
            border-color: #e9ecef;
          }
        `;
      case 'outline':
        return css`
          background: transparent;
          color: ${COLORS.PRIMARY};
          border: 1px solid ${COLORS.PRIMARY};
          
          &:hover:not(:disabled) {
            background: ${COLORS.PRIMARY};
            color: ${COLORS.TEXT.LIGHT};
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${COLORS.PRIMARY};
          border: 1px solid transparent;
          
          &:hover:not(:disabled) {
            background: rgba(0, 120, 212, 0.1);
          }
        `;
      default:
        return css`
          background: ${COLORS.PRIMARY};
          color: ${COLORS.TEXT.LIGHT};
          border: 1px solid ${COLORS.PRIMARY};
          
          &:hover:not(:disabled) {
            background: #106ebe;
            border-color: #106ebe;
          }
        `;
    }
  }}

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 100%;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  children,
  className
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={handleClick}
      type={type}
      className={className}
    >
      {loading && <LoadingSpinner />}
      {children}
    </StyledButton>
  );
};

export default Button; 