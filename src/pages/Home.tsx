import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll, useInView } from 'framer-motion';
import styled from 'styled-components';
import Header from '../components/layout/Header';
import WhatsAppButton from '../components/shared/WhatsAppButton';

const HomeContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  
  * {
    box-sizing: border-box;
  }
  
  body, html {
    overflow-x: hidden;
  }
`;

const ProgressBar = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  height: 6px;
  background: #0078d4;
  z-index: 1000;
  box-shadow: 0 0 4px rgba(0, 120, 212, 0.3);
`;

const ParallaxSection = styled(motion.section)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-top: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3));
    z-index: 1;
  }
`;

const ParallaxBackground = styled(motion.div)`
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  background-image: url('/images/home/fundo/fundo1.jpg');
  background-size: cover;
  background-position: center;
  z-index: 0;
  
  @media (max-width: 768px) {
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
  }
`;

const ContentWrapper = styled(motion.div)`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rem;
  padding: 0 2rem;
  margin: 0 auto;
  padding-top: 15vh;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
    padding-top: 10vh;
    padding: 1rem;
  }
`;

const TextContent = styled(motion.div)`
  text-align: center;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;

  @media (max-width: 768px) {
    text-align: center;
    align-items: center;
    margin-top: 0;
    position: relative;
    z-index: 3;
    width: 100%;
    padding: 0 1rem;
  }
`;

const NeonTextContainer = styled.span`
  position: relative;
  display: inline-block;
  cursor: default;
`;

const NeonTextContent = styled.span<{ mouseX: number; mouseY: number; isHovering: boolean; isMobile: boolean }>`
  position: relative;
  background: ${props => !props.isMobile && props.isHovering ? `
    radial-gradient(
      circle 250px at ${props.mouseX}px ${props.mouseY}px,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 1) 15%,
      rgba(77, 181, 255, 1) 35%,
      #4db5ff 100%
    )
  ` : '#4db5ff'};
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
    text-shadow: 0 0 5px #4db5ff, 0 0 10px #4db5ff;
    opacity: 0.7;
    z-index: -1;
  }
`;

const NeonText: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile && textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <NeonTextContainer
      ref={textRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => {
        if (!isMobile) {
          setIsHovering(false);
          setMousePosition({ x: 0, y: 0 });
        }
      }}
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

const Title = styled(motion.h1)<{ isLight?: boolean }>`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: ${props => props.isLight ? '#ffffff' : '#2c3e50'};
  text-shadow: ${props => props.isLight ? '2px 2px 4px rgba(0, 0, 0, 0.3)' : 'none'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 3rem;
    justify-content: center;
    flex-wrap: wrap;
    white-space: normal;
    line-height: 1.2;
    margin-bottom: 1.5rem;
  }
`;

const Subtitle = styled(motion.p)<{ isLight?: boolean }>`
  font-size: 1.5rem;
  color: ${props => props.isLight ? '#ffffff' : '#2c3e50'};
  max-width: 800px;
  margin: 0 auto;
  text-shadow: ${props => props.isLight ? '1px 1px 2px rgba(0, 0, 0, 0.3)' : 'none'};

  @media (max-width: 768px) {
    font-size: 1.4rem;
    line-height: 1.4;
    padding: 0 1rem;
  }

  span {
    color: ${props => props.isLight ? '#4db5ff' : '#0078d4'};
    font-weight: 500;
  }
`;

const Section = styled(motion.section)<{ isSecond?: boolean }>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  position: relative;
  background: #1a1a1a;
  overflow: hidden;
  
  ${props => props.isSecond && `
    margin-top: -60px;
    padding-top: 80px;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      background: #1a1a1a;
      transform: skewY(4deg);
      transform-origin: top right;
      z-index: 1;
    }
    
    & > * {
      position: relative;
      z-index: 2;
    }

    ${Title} {
      color: #ffffff;
    }

    ${Subtitle} {
      color: #e0e0e0;
      
      span {
        color: #4db5ff;
      }
    }
  `}
`;

const ProductSection = styled(motion.section)`
  padding: 4rem 2rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    width: 100%;
  }
`;

const ProductTitle = styled(motion.h2)`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  span {
    white-space: nowrap;
  }
`;

const ProductDescription = styled(motion.p)`
  font-size: 1.2rem;
  color: #e0e0e0;
  margin-bottom: 4rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding: 0;
    font-size: 1.2rem;
    width: 90%;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0;
    width: 100%;
  }
`;

const ImageModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  cursor: zoom-out;
`;

const ModalImage = styled(motion.img)`
  max-width: 90%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const ProductImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;

  @media (min-width: 769px) {
    &:hover {
      transform: scale(1.02);
    }
  }
`;

const VideoContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;

  &:hover .play-overlay {
    opacity: 1;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlayOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  svg {
    width: 50px;
    height: 50px;
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
`;

const VideoModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;

  video {
    max-width: 90%;
    max-height: 90vh;
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
`;

const ProductGraphContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #ffffff;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    aspect-ratio: 16/9;
    width: 100%;
    padding: 1rem;
    font-size: 1.4rem;
  }
`;

const ProductVideoContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #ffffff;
  grid-column: 2 / -1;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    grid-column: 1;
    width: 100%;
    padding: 1rem;
    font-size: 1.4rem;
  }
`;

const PlanCard = ({ title, price, description }: { title: string; price: string; description: string }) => (
  <PlanCardWrapper>
    <div className="card">
      <div className="coming-soon">Em breve</div>
      <div className="content">
        <div className="title">{title}</div>
        <div className="price">{price}</div>
        <div className="description">{description}</div>
      </div>
      <button disabled>Indisponível</button>
    </div>
  </PlanCardWrapper>
);

const PlanCardWrapper = styled.div`
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    width: 260px;
    padding: 20px 1px;
    margin: 10px 0;
    text-align: center;
    position: relative;
    cursor: not-allowed;
    box-shadow: 0 10px 15px -3px rgba(33,150,243,.4),0 4px 6px -4px rgba(33,150,243,.4);
    border-radius: 10px;
    background: linear-gradient(45deg, #04051dea 0%, #2b566e 100%);
    overflow: hidden;
  }
  .coming-soon {
    position: absolute;
    top: 15px;
    right: -40px;
    background: #bfc3c9;
    color: #fff;
    font-weight: bold;
    font-size: 0.9rem;
    padding: 0.4rem 2.2rem;
    border-radius: 6px;
    transform: rotate(45deg);
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    z-index: 2;
    opacity: 0.85;
  }
  .content {
    padding: 20px;
  }
  .content .price {
    color: white;
    font-weight: 800;
    font-size: 50px;
    text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.42);
  }
  .content .description {
    color: rgba(255, 255, 255, 0.6);
    margin-top: 10px;
    font-size: 14px;
  }
  .content .title {
    font-weight: 800;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.64);
    margin-top: 10px;
    font-size: 25px;
    letter-spacing: 1px;
  }
  button {
    user-select: none;
    border: none;
    outline: none;
    color: rgb(255 255 255);
    text-transform: uppercase;
    font-weight: 700;
    font-size: .75rem;
    padding: 0.75rem 1.5rem;
    background-color: rgb(33 150 243);
    border-radius: 0.5rem;
    width: 90%;
    text-shadow: 0px 4px 18px #2c3442;
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const PlansContainer = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: stretch;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
`;

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageModalProps> = ({ isOpen, imageUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = scale + (e.deltaY > 0 ? -0.1 : 0.1);
    setScale(Math.min(Math.max(0.5, newScale), 3));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ImageModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onWheel={handleWheel}
        >
          <ModalImage
            src={imageUrl}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            style={{ scale }}
            onClick={(e) => e.stopPropagation()}
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            whileDrag={{ cursor: 'grabbing' }}
          />
        </ImageModal>
      )}
    </AnimatePresence>
  );
};

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <VideoModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.video
            ref={videoRef}
            src="/images/home/produto/video.mp4"
            muted
            controls
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          />
        </VideoModal>
      )}
    </AnimatePresence>
  );
};

const ScaleOnScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.div
      ref={ref}
      style={{
        width: '100%',
        height: '100%'
      }}
      animate={isMobile ? {
        scale: isInView ? 1.05 : 1
      } : {}}
      transition={{
        duration: 0.5,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

const PricingSection = styled(Section)`
  background: linear-gradient(135deg, #0a192f 0%, #112240 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(77, 181, 255, 0.1) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234db5ff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  ${Title} {
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }

  ${Subtitle} {
    color: #fff;
    text-shadow: 0 1px 6px rgba(0,0,0,0.4);
    span {
      color: #4db5ff;
    }
  }
`;

const AboutSection = styled(Section)`
  background: linear-gradient(135deg, #0a192f 100%, #112240 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 70% 30%, rgba(77, 181, 255, 0.15) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234db5ff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const AboutContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  gap: 3rem;
  padding: 2rem;

  @media (min-width: 992px) {
    flex-direction: row;
    align-items: center;
    gap: 4rem;
  }
`;

const AboutContent = styled(motion.div)`
  flex: 1;
  text-align: left;

  @media (max-width: 991px) {
    text-align: center;
    order: 2;
  }
`;

const AboutCardsContainer = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;

  @media (max-width: 991px) {
    order: 1;
  }
`;

const AboutCard = styled(motion.div)`
  position: relative;
  width: 280px;
  height: 180px;
  background: linear-gradient(-45deg, #143582 0%, #152a67 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.320, 1);
  box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 30px -15px rgba(2, 12, 27, 0.7);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.7;
    transition: all 0.6s cubic-bezier(0.23, 1, 0.320, 1);
  }

  &:hover img {
    opacity: 0.9;
    transform: scale(1.05);
  }

  span {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: rgba(10, 25, 47, 0.85);
    color: #4db5ff;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    transform: translateY(100%);
    transition: all 0.3s ease;
  }

  &:hover span {
    transform: translateY(0);
  }
`;

const AboutTextBlock = styled(motion.div)`
  margin-bottom: 2rem;
  position: relative;
  padding: 0 0 0 1.5rem;
  border-left: 2px solid #4db5ff;

  @media (max-width: 991px) {
    padding: 0;
    border-left: none;
    margin-bottom: 1.5rem;
  }

  h3 {
    color: #4db5ff;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    color: #e0e0e0;
    line-height: 1.6;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
`;

const AboutHighlight = styled.span`
  color: #4db5ff;
  font-weight: 500;
`;

const ContactSection = styled(Section)`
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 70%, rgba(77, 181, 255, 0.15) 0%, rgba(0, 0, 0, 0.3) 70%);
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    pointer-events: none;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  ${Title} {
    color: #ffffff;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
    font-weight: 700;
  }

  ${Subtitle} {
    color: #f0f0f0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
    font-weight: 500;
    
    span {
      color: #4db5ff;
      font-weight: 600;
      text-shadow: 0 0 10px rgba(77, 181, 255, 0.3);
    }
  }
`;

const ContactContainer = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ContactForm = styled(motion.form)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 3rem;
  border: 1px solid rgba(77, 181, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

const FormLabel = styled.label`
  display: block;
  color: #4db5ff;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(77, 181, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4db5ff;
    box-shadow: 0 0 0 3px rgba(77, 181, 255, 0.2);
    background: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(77, 181, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4db5ff;
    box-shadow: 0 0 0 3px rgba(77, 181, 255, 0.2);
    background: rgba(255, 255, 255, 0.15);
  }

  option {
    background: #1a1a1a;
    color: #ffffff;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(77, 181, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #4db5ff;
    box-shadow: 0 0 0 3px rgba(77, 181, 255, 0.2);
    background: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ContactWhatsAppButton = styled(motion.button)`
  width: 100%;
  padding: 1.2rem 2rem;
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

interface ContactFormData {
  nome: string;
  interesse: string;
  mensagem: string;
}

const Home: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleRect, setTitleRect] = useState<DOMRect | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const gridVideoRef = useRef<HTMLVideoElement>(null);
  
  // estados do formulário de contato
  const [contactForm, setContactForm] = useState<ContactFormData>({
    nome: '',
    interesse: '',
    mensagem: ''
  });

  // configuração do spring para movimento suave
  const springConfig = { damping: 25, stiffness: 80, mass: 1.2 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // transforma o movimento do mouse em movimento do background
  const backgroundX = useTransform(x, [-500, 500], [60, -60]);
  const backgroundY = useTransform(y, [-500, 500], [60, -60]);

  // abre WhatsApp com mensagem personalizada
  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.nome || !contactForm.interesse || !contactForm.mensagem) {
      return;
    }

    const message = `Olá! Meu nome é ${contactForm.nome}.
    
Interesse: ${contactForm.interesse}

Mensagem: ${contactForm.mensagem}

Aguardo retorno. Obrigado!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5551997188572?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);

      if (isMobile) {
        const scrollY = window.scrollY;
        const parallaxY = scrollY * 0.5;
        mouseY.set(parallaxY);
        
        const parallaxX = Math.sin(scrollY * 0.002) * 100;
        mouseX.set(parallaxX);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const moveX = (e.clientX - centerX) * 0.8;
        const moveY = (e.clientY - centerY) * 0.8;
        mouseX.set(moveX);
        mouseY.set(moveY);
      }
    };

    handleResize();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile, mouseX, mouseY]);

  useEffect(() => {
    const updateRect = () => {
      if (titleRef.current) {
        setTitleRect(titleRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  useEffect(() => {
    if (gridVideoRef.current) {
      gridVideoRef.current.muted = true;
      gridVideoRef.current.play();
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Header />
      <HomeContainer>
        <ProgressBar
          style={{ width: `${scrollProgress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
        
        <ParallaxSection
          id="inicio"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <ParallaxBackground
            style={{
              x: backgroundX,
              y: backgroundY,
            }}
          />
          <ContentWrapper>
            <TextContent
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <Title isLight>
                Bem-vindo à&nbsp;<NeonText>BIBLIOTECH</NeonText>
              </Title>
              <Subtitle isLight>
                Bibliotecas escolares com foco no&nbsp;<NeonText>aluno!</NeonText>
              </Subtitle>
            </TextContent>
          </ContentWrapper>
        </ParallaxSection>

        <Section
          id="produto"
          isSecond
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <ProductSection>
            <ProductGrid>
              <ProductDescription
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ProductTitle
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  Sobre o <span style={{ color: '#4db5ff' }}>sistema</span>
                </ProductTitle>
                Oferecemos um <span style={{ color: '#4db5ff' }}>controle de métricas</span> que contribui para o desempenho da biblioteca, assim como para a <span style={{ color: '#4db5ff' }}>motivação dos alunos!</span>
              </ProductDescription>
              <ProductGraphContainer
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <ScaleOnScroll>
                  <ProductImage
                    src="/images/home/produto/graph1.png"
                    alt="Gráfico de métricas 1"
                    onClick={() => setSelectedImage("/images/home/produto/graph1.png")}
                  />
                </ScaleOnScroll>
              </ProductGraphContainer>
              <ProductGraphContainer
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <ScaleOnScroll>
                  <ProductImage
                    src="/images/home/produto/graph2.png"
                    alt="Gráfico de métricas 2"
                    onClick={() => setSelectedImage("/images/home/produto/graph2.png")}
                  />
                </ScaleOnScroll>
              </ProductGraphContainer>
              <ProductGraphContainer
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <ScaleOnScroll>
                  <ProductImage
                    src="/images/home/produto/graph3.png"
                    alt="Gráfico de métricas 3"
                    onClick={() => setSelectedImage("/images/home/produto/graph3.png")}
                  />
                </ScaleOnScroll>
              </ProductGraphContainer>
              <ProductVideoContainer
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <ScaleOnScroll>
                  <VideoContainer onClick={() => setIsVideoModalOpen(true)}>
                    <video
                      ref={gridVideoRef}
                      src="/images/home/produto/video.mp4"
                      muted
                      playsInline
                      loop
                      autoPlay
                    />
                    <PlayOverlay className="play-overlay">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </PlayOverlay>
                  </VideoContainer>
                </ScaleOnScroll>
              </ProductVideoContainer>
            </ProductGrid>
          </ProductSection>
        </Section>

        {/* 
        ====================================================================
        SEÇÃO DE PLANOS E PREÇOS - COMENTADA POR ENQUANTO
        ====================================================================
        
        Aqui ficam os planos Bibliotech Basic e Bibliotech +.
        Se eu quiser implementar uma seção de planos e preços mais tarde, 
        é só descomentar esta seção aqui.
        
        Não vou criar uma nova seção de planos - vou usar esta que já tá pronta.

        (comentario preparado pra facilitar minha vida depois kkkkk)
        ====================================================================
        
        <PricingSection
          id="precos"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Title variants={fadeInUp}>
            Planos
          </Title>
          <Subtitle variants={fadeInUp}>
            Oferecemos planos <span style={{ color: '#4db5ff' }}>distintos</span>, para atender à <span style={{ color: '#4db5ff' }}>todos </span>os tipos de escola. Não gostou? Receba seu <span style={{ color: '#4db5ff' }}>dinheiro de volta!</span>
          </Subtitle>
          <PlansContainer>
            <PlanCard
              title="Bibliotech Basic"
              price="R$ --"
              description="Plano básico para escolas que buscam digitalizar sua biblioteca de forma simples e eficiente."
            />
            <PlanCard
              title="Bibliotech +"
              price="R$ --"
              description="Plano avançado com recursos extras para escolas que querem o máximo em tecnologia e gestão."
            />
          </PlansContainer>
        </PricingSection>
        */}

        {/* Seção Proton Software comentada temporariamente
        <AboutSection
          id="sobre"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Title variants={fadeInUp} isLight={true}>
            Proton Software
          </Title>
          <AboutContainer>
            <AboutContent>
              <AboutTextBlock
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3>Nossa história</h3>
                <p>
                  A <AboutHighlight>Bibliotech</AboutHighlight> nasceu quando identificamos oportunidades de melhoria em uma solução mal projetada, encontrando um caminho para desenvolver um produto inovador e expansível para gerenciamento de bibliotecas escolares.
                </p>
                <p>
                  Nosso sistema foi desenvolvido com foco no desempenho de alunos, livros e turmas. Criamos métricas que ajudam escolas a investirem nos livros certos e motivam os estudantes através de metas trimestrais, criando um sentimento de participação.
                </p>
                <p>
                  A partir desse produto, fundamos a <AboutHighlight>Proton Software</AboutHighlight>, expandindo para o desenvolvimento de softwares sob demanda, que atualmente representa nosso principal foco de faturamento, enquanto continuamos evoluindo nossos produtos próprios.
                </p>
              </AboutTextBlock>
            </AboutContent>
            <AboutCardsContainer
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              <AboutCard
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <img src="/images/home/about/bibliotech-dashboard.jpg" alt="Dashboard Bibliotech" />
                <span>Dashboard intuitivo</span>
              </AboutCard>
              <AboutCard
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <img src="/images/home/about/dev-team.jpg" alt="Equipe de desenvolvimento" />
                <span>Equipe especializada</span>
              </AboutCard>
              <AboutCard
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <img src="/images/home/about/innovation.jpg" alt="Inovação" />
                <span>Inovação constante</span>
              </AboutCard>
            </AboutCardsContainer>
          </AboutContainer>
        </AboutSection>
        */}

        <ContactSection
          id="contato"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Title variants={fadeInUp}>
            Entre em Contato
          </Title>
          <Subtitle variants={fadeInUp}>
            Preencha o formulário abaixo e <span style={{ color: '#4db5ff' }}>continue no WhatsApp</span> para finalizar seu contato conosco.
          </Subtitle>
          
          <ContactContainer>
            <ContactForm
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onSubmit={handleWhatsAppSubmit}
            >
              <FormGroup>
                <FormLabel>Nome</FormLabel>
                <FormInput
                  type="text"
                  value={contactForm.nome}
                  onChange={(e) => setContactForm({ ...contactForm, nome: e.target.value })}
                  placeholder="Digite seu nome"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Interesse</FormLabel>
                <FormSelect
                  value={contactForm.interesse}
                  onChange={(e) => setContactForm({ ...contactForm, interesse: e.target.value })}
                  required
                >
                  <option value="">Selecione um interesse</option>
                  <option value="Suporte">Suporte</option>
                  {/* <option value="Planos">Conhecer Planos</option> - Comentado temporariamente junto com a seção de planos */}
                  <option value="Conhecer mais">Conhecer mais sobre o sistema</option>
                  <option value="Demonstração">Solicitar demonstração</option>
                  <option value="Parceria">Oportunidades de parceria</option>
                  <option value="Outros">Outros assuntos</option>
                </FormSelect>
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Mensagem</FormLabel>
                <FormTextarea
                  value={contactForm.mensagem}
                  onChange={(e) => setContactForm({ ...contactForm, mensagem: e.target.value })}
                  placeholder="Digite sua mensagem"
                  required
                />
              </FormGroup>
              
              <ContactWhatsAppButton
                type="submit"
                disabled={!contactForm.nome || !contactForm.interesse || !contactForm.mensagem}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.569-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                </svg>
                Continuar no WhatsApp
              </ContactWhatsAppButton>
            </ContactForm>
          </ContactContainer>
        </ContactSection>

        <WhatsAppButton 
          phoneNumber="5551997188572"
          message="Olá, Gustavo! Referente à Bibliotech;"
        />
      </HomeContainer>
      
      <VideoPlayer
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
      
      <ImageViewer
        isOpen={!!selectedImage}
        imageUrl={selectedImage || ''}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};

export default Home; 