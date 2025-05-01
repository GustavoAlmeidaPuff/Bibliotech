import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styled from 'styled-components';
import Header from '../components/layout/Header';

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
  top: -50px; // Extra padding for movement
  left: -50px; // Extra padding for movement
  right: -50px; // Extra padding for movement
  bottom: -50px; // Extra padding for movement
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
  }

  @media (max-width: 768px) {
    justify-content: center;
    margin-top: 2rem;
    padding-top: 0;
    img {
      max-height: 350px;
    }
  }
`;

const Title = styled(motion.h1)`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 2.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: white;
  max-width: 800px;
  margin: 0 auto;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }

  span {
    color: #4db5ff;
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

  // Configuração do spring para movimento suave
  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform o movimento do mouse em movimento do background
  const backgroundX = useTransform(x, [-500, 500], [50, -50]);
  const backgroundY = useTransform(y, [-500, 500], [50, -50]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);

      if (isMobile) {
        mouseY.set(window.scrollY);
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
          id="produto"
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
              <Title>
                Bem-vindo à&nbsp;<span style={{ 
                  color: '#4db5ff',
                  textShadow: '0 0 5px #4db5ff, 0 0 10px #4db5ff',
                  animation: 'glow 2s ease-in-out infinite alternate'
                }}>BIBLIOTECH</span>
              </Title>
              <Subtitle>
                Bibliotecas escolares com foco no <span style={{ 
                  color: '#4db5ff',
                  textShadow: '0 0 5px #4db5ff, 0 0 10px #4db5ff',
                  animation: 'glow 2s ease-in-out infinite alternate'
                }}>aluno!</span>
              </Subtitle>
            </TextContent>
            <ImageContent
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <img 
                src="/images/home/celular com site (sem fundo).png" 
                alt="Dashboard do Bibliotech em um celular"
              />
            </ImageContent>
          </ContentWrapper>
        </ParallaxSection>

        <Section
          id="sobre"
          isSecond
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Title variants={fadeInUp}>
            Sobre nós
          </Title>
          <Subtitle variants={fadeInUp}>
            Transformando a gestão de bibliotecas com tecnologia e inovação
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
            Escolha o plano ideal para sua biblioteca
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
            Estamos aqui para ajudar você a transformar sua biblioteca
          </Subtitle>
        </Section>
      </HomeContainer>
    </>
  );
};

export default Home; 