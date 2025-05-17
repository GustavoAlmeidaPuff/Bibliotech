import React from 'react';
import styled, { css } from 'styled-components';

interface ReactAtomProps {
  size?: string;
  asLogo?: boolean;
  className?: string;
}

const ReactAtom: React.FC<ReactAtomProps> = ({ size = '5rem', asLogo = false, className }) => {
  return (
    <StyledWrapper size={size} className={className}>
      <div className={`react-star${asLogo ? ' logo' : ''}`}>
        <div className="nucleus" />
        <div className="electron electron1" />
        <div className="electron electron2" />
        <div className="electron electron3" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ size: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  .react-star {
    position: relative;
    width: ${props => props.size};
    height: ${props => props.size};
    display: flex;
    justify-content: center;
    align-items: center;
    animation: rotate 3s infinite linear;
  }
  .react-star.logo {
    animation: none;
  }
  .nucleus {
    position: absolute;
    left: 44%;
    top: 44%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: linear-gradient(#0738e8, cyan);
    height: calc(${props => props.size} * 0.13);
    width: calc(${props => props.size} * 0.13);
    animation: rotate 1s linear infinite;
  }
  .electron {
    position: absolute;
    width: ${props => props.size};
    height: calc(${props => props.size} * 0.4);
    border-radius: 50%;
    border: 0.18em solid #00ffff;
    animation: revolve 1s linear infinite;
  }
  .electron1::before,
  .electron2::before,
  .electron3::before {
    content: "";
    position: absolute;
    top: 60%;
    left: 100%;
    transform: translate(-50%, -50%);
    width: 0.18em;
    height: 0.18em;
    background-color: cyan;
    border-radius: 50%;
    animation: moveElectron 1s infinite;
  }
  .electron2 {
    transform: rotate(60deg);
    animation-delay: -0.66s;
  }
  .electron2::before {
    animation-delay: -0.66s;
  }
  .electron3 {
    transform: rotate(-60deg);
  }
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg) scale3d(1.1, 1.1, 0);
    }
  }
  @keyframes revolve {
    0% {
      border-color: #00ffff9c;
      border-right: transparent;
    }
    25% {
      border-color: #00ffff9c;
      border-bottom-color: transparent;
    }
    50% {
      border-color: #00ffff9c;
      border-left-color: transparent;
    }
    75% {
      border-color: #00ffff9c;
      border-top-color: transparent;
    }
    100% {
      border-color: #00ffff9c;
      border-right-color: transparent;
    }
  }
  @keyframes moveElectron {
    0% {
      top: 60%;
      left: 100%;
    }
    25% {
      top: 100%;
      left: 60%;
    }
    50% {
      top: 60%;
      left: 0%;
    }
    75% {
      top: 0%;
      left: 60%;
    }
    100% {
      top: 60%;
      left: 100%;
    }
  }
`;

export default ReactAtom; 