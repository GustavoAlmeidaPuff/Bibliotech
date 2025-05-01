import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styled from 'styled-components';
import Header from '../components/layout/Header';
import WhatsAppButton from '../components/shared/WhatsAppButton';

const HomeContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
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
  top: -100px;
  left: -100px;
  right: -100px;
  bottom: -100px;
  background-image: url('/images/home/fundo/fundo1.jpg');
  background-size: cover;
  background-position: center;
  z-index: 0;
`;

const ContentWrapper = styled(motion.div)`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  padding: 0 2rem;
  margin: 0 auto;
  padding-top: 15vh;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
    padding-top: 10vh;
  }
`;

const TextContent = styled(motion.div)`
  flex: 1;
  text-align: left;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: -300px;

  @media (max-width: 768px) {
    text-align: center;
    align-items: center;
    margin-top: -130px;
    position: relative;
    z-index: 3;
  }
`;

const ImageContent = styled(motion.div)`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 0;

  img {
    max-width: 100%;
    height: auto;
    max-height: 500px;
    object-fit: contain;
    transition: transform 0.15s ease;
  }

  @media (max-width: 768px) {
    justify-content: center;
    margin-top: 4rem;
    padding-top: 0;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 2;
    
    img {
      max-height: none;
      width: 70%;
      margin-left: -40%;
      margin-right: -40%;
      object-fit: contain;
      transform: scale(2.2);
    }
  }
`;

const DeviceMessage = styled.p`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  width: 100%;
  max-width: 300px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    bottom: -40px;
  }
`;

const NeonTextContainer = styled.span`
  position: relative;
  display: inline-block;
  cursor: default;
`;

const NeonTextContent = styled.span<{ mouseX: number; mouseY: number; isHovering: boolean }>`
  position: relative;
  background: ${props => props.isHovering ? `
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
  const textRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (textRef.current) {
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
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
    >
      <NeonTextContent 
        mouseX={mousePosition.x} 
        mouseY={mousePosition.y}
        data-text={children}
        isHovering={isHovering}
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
    font-size: 2.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const Subtitle = styled(motion.p)<{ isLight?: boolean }>`
  font-size: 1.5rem;
  color: ${props => props.isLight ? '#ffffff' : '#2c3e50'};
  max-width: 800px;
  margin: 0 auto;
  text-shadow: ${props => props.isLight ? '1px 1px 2px rgba(0, 0, 0, 0.3)' : 'none'};

  @media (max-width: 768px) {
    font-size: 1.2rem;
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
  background: ${props => props.isSecond ? '#fff' : 'transparent'};
  
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
      background: #fff;
      transform: skewY(4deg);
      transform-origin: top right;
      z-index: 1;
    }
    
    & > * {
      position: relative;
      z-index: 2;
    }
  `}
`;

const Home: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleRect, setTitleRect] = useState<DOMRect | null>(null);

  // Configuração do spring para movimento suave
  const springConfig = { damping: 15, stiffness: 100 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform o movimento do mouse em movimento do background
  const backgroundX = useTransform(x, [-500, 500], [100, -100]);
  const backgroundY = useTransform(y, [-500, 500], [100, -100]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);

      if (isMobile) {
        // Aumentar o efeito de parallax no scroll mobile
        const scrollY = window.scrollY;
        const parallaxY = scrollY * 0.5; // Aumentado de 0.15 para 0.5
        mouseY.set(parallaxY);
        
        // Adicionar movimento horizontal suave baseado no scroll
        const parallaxX = Math.sin(scrollY * 0.002) * 100; // Novo efeito de movimento horizontal
        mouseX.set(parallaxX);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) {
        mouseX.set(e.clientX - window.innerWidth / 2);
        mouseY.set(e.clientY - window.innerHeight / 2);
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
            <ImageContent
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.img 
                src={isMobile ? "/images/home/notebook com site.png" : "/images/home/celular com site (sem fundo).png"}
                alt={isMobile ? "Dashboard do Bibliotech em um notebook" : "Dashboard do Bibliotech em um celular"}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.15 }}
              />
            </ImageContent>
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
          <Title variants={fadeInUp}>
            Produto
          </Title>
          <Subtitle variants={fadeInUp}>
            Funcionalidades, beneficios, métricas, e apresentação do produto.
          </Subtitle>
        </Section>

        <Section
          id="precos"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Title variants={fadeInUp}>
            Planos e Preços
          </Title>
          <Subtitle variants={fadeInUp}>
            Amostra de planos diferentes, com preços e benefícios distintos.
          </Subtitle>
        </Section>

        <Section
          id="sobre"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Title variants={fadeInUp}>
            Sobre nós
          </Title>
          <Subtitle variants={fadeInUp}>
            falar sobre a empresa, o que fazemos, e como podemos ajudar você. assim como o suporte que temos para o cliente.
          </Subtitle>
        </Section>

        <Section
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
            Mostra redes sociais, assim como um formulario de contato, que o usurario coloca a mensagem e vai pro whatsapp da empresa.
          </Subtitle>
        </Section>

        <WhatsAppButton 
          phoneNumber="5551997188572"
          message="Olá, Gustavo! Referente à Bibliotech;"
        />
      </HomeContainer>
    </>
  );
};

export default Home; 