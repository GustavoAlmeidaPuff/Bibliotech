import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const HomeContainer = styled.div`
  width: 100%;
  min-height: 100vh;
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
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
`;

const Home: React.FC = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <HomeContainer>
      <Section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Title variants={fadeInUp}>
          Bem-vindo ao Bibliotech
        </Title>
        <Subtitle variants={fadeInUp}>
          Uma solução moderna para gerenciamento de bibliotecas
        </Subtitle>
      </Section>

      <Section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Title variants={fadeInUp}>
          Recursos Principais
        </Title>
        <Subtitle variants={fadeInUp}>
          Sistema completo de gerenciamento de acervo, empréstimos e devoluções
        </Subtitle>
      </Section>

      <Section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Title variants={fadeInUp}>
          Por que escolher o Bibliotech?
        </Title>
        <Subtitle variants={fadeInUp}>
          Interface intuitiva, relatórios detalhados e suporte completo
        </Subtitle>
      </Section>
    </HomeContainer>
  );
};

export default Home; 