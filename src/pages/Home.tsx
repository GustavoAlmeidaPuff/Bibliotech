import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Header from '../components/layout/Header';

const HomeContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  padding-top: 70px; // Espaço para o header fixo
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

const Section = styled(motion.section)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #333;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Home: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        
        <Section
          id="produto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Title variants={fadeInUp}>
            Bem-vindo à Bibliotech
          </Title>
          <Subtitle variants={fadeInUp}>
            bibliotecas escolar, com foco no <span style={{ color: '#0078d4' }}>aluno</span>.
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