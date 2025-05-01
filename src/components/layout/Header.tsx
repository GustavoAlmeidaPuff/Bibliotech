import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { UserCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #0078d4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoWrapper = styled.div`
  background: white;
  border-radius: 50%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;
`;

const Logo = styled.img`
  height: 50px;
  width: auto;
`;

const LogoText = styled.div`
  color: white;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
  
  span {
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;

const Nav = styled.nav<{ isOpen: boolean }>`
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileNav = styled.div<{ isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: #0078d4;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const NavList = styled.ul`
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const NavItem = styled(motion.li)`
  color: white;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    opacity: 0.8;
  }
`;

const LoginButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    margin-top: 1rem;
  }

  @media (min-width: 769px) {
    width: auto;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <HeaderContainer>
      <LogoContainer>
        <LogoWrapper>
          <Logo src="/images/home/logo.png" alt="Bibliotech Logo" />
        </LogoWrapper>
        <LogoText>
          <h1>Bibliotech</h1>
          <span>by proton</span>
        </LogoText>
      </LogoContainer>

      <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? (
          <XMarkIcon width={24} height={24} />
        ) : (
          <Bars3Icon width={24} height={24} />
        )}
      </MenuButton>

      {/* Desktop Navigation */}
      <DesktopNav>
        <Nav isOpen={false}>
          <NavList>
            <NavItem
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollToSection('produto')}
            >
              Produto
            </NavItem>
            <NavItem
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollToSection('sobre')}
            >
              Sobre nós
            </NavItem>
            <NavItem
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollToSection('precos')}
            >
              Preços
            </NavItem>
            <NavItem
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollToSection('contato')}
            >
              Contato
            </NavItem>
          </NavList>
        </Nav>

        <LoginButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
        >
          <UserCircleIcon width={20} height={20} />
          Login
        </LoginButton>
      </DesktopNav>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMenuOpen}>
        <NavList>
          <NavItem onClick={() => scrollToSection('produto')}>
            Produto
          </NavItem>
          <NavItem onClick={() => scrollToSection('sobre')}>
            Sobre nós
          </NavItem>
          <NavItem onClick={() => scrollToSection('precos')}>
            Preços
          </NavItem>
          <NavItem onClick={() => scrollToSection('contato')}>
            Contato
          </NavItem>
        </NavList>
        <LoginButton
          onClick={() => {
            navigate('/login');
            setIsMenuOpen(false);
          }}
        >
          <UserCircleIcon width={20} height={20} />
          Login
        </LoginButton>
      </MobileNav>
    </HeaderContainer>
  );
};

export default Header; 