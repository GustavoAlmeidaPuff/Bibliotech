import React from 'react';
import { motion } from 'framer-motion';
import { WhatsAppButtonContainer } from './styles';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber, message }) => {
  const encodedMessage = encodeURIComponent(message);
  
  return (
    <WhatsAppButtonContainer
      href={`https://wa.me/${phoneNumber}?text=${encodedMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
    >
      <img src="/images/home/icone/wpp.png" alt="WhatsApp" />
    </WhatsAppButtonContainer>
  );
};

export default WhatsAppButton; 