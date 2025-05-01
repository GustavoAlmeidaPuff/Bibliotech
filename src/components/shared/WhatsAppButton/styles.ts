import styled from 'styled-components';
import { motion } from 'framer-motion';

export const WhatsAppButtonContainer = styled(motion.a)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #25D366;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 1000;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  img {
    width: 35px;
    height: 35px;
  }
`; 