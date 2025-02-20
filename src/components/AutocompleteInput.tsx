import React, { useState, useRef, useEffect } from 'react';
import styles from './AutocompleteInput.module.css';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  label: string;
  id: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder,
  label,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filtra sugestões baseado no valor atual
    if (value.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsOpen(true);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
  }, [value, suggestions]);

  useEffect(() => {
    // Fecha o dropdown quando clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      if (filteredSuggestions.length === 0) {
        // Se não houver sugestões, adiciona o valor atual como nova tag
        onSelect(value.trim());
        onChange('');
      } else {
        // Se houver sugestões, seleciona a primeira
        onSelect(filteredSuggestions[0]);
        onChange('');
      }
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSelect(suggestion);
    onChange('');
    setIsOpen(false);
  };

  const handleAddNew = () => {
    onSelect(value.trim());
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.trim() && setIsOpen(true)}
        placeholder={placeholder}
        className={styles.input}
      />
      {isOpen && (value.trim() !== '') && (
        <div className={styles.dropdown}>
          {filteredSuggestions.length > 0 ? (
            <>
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={styles.suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
              {!filteredSuggestions.includes(value.trim()) && (
                <div
                  className={`${styles.suggestion} ${styles.addNew}`}
                  onClick={handleAddNew}
                >
                  Adicionar "{value.trim()}"
                </div>
              )}
            </>
          ) : (
            <div
              className={`${styles.suggestion} ${styles.addNew}`}
              onClick={handleAddNew}
            >
              Adicionar "{value.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput; 