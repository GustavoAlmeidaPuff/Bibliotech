import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { COLORS } from '../../constants';
import { useIsMobile } from '../../hooks/useIsMobile';

interface NeonTextProps {
  children: React.ReactNode;
}

const NeonTextContainer = styled.span`
  position: relative;
  display: inline-block;
  cursor: default;
`;

const NeonTextContent = styled.span<{ 
  mouseX: number; 
  mouseY: number; 
  isHovering: boolean; 
  isMobile: boolean;
}>`
  position: relative;
  background: ${props => !props.isMobile && props.isHovering ? `
    radial-gradient(
      circle 250px at ${props.mouseX}px ${props.mouseY}px,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 1) 15%,
      rgba(77, 181, 255, 1) 35%,
      ${COLORS.SECONDARY} 100%
    )
  ` : COLORS.SECONDARY};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  display: inline-block;
  
  &::before {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    text-shadow: 0 0 5px ${COLORS.SECONDARY}, 0 0 10px ${COLORS.SECONDARY};
    opacity: 0.7;
    z-index: -1;
  }
`;

const NeonText: React.FC<NeonTextProps> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useIsMobile();
  const textRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile && textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovering(false);
      setMousePosition({ x: 0, y: 0 });
    }
  };

  return (
    <NeonTextContainer
      ref={textRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NeonTextContent 
        mouseX={mousePosition.x} 
        mouseY={mousePosition.y}
        data-text={children}
        isHovering={isHovering}
        isMobile={isMobile}
      >
        {children}
      </NeonTextContent>
    </NeonTextContainer>
  );
};

export default NeonText; 