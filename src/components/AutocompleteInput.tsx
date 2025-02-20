import React, { useState, useRef, useEffect } from 'react';
import { useTags } from '../contexts/TagsContext';
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
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { capitalizeTag, removeGenre } = useTags();

  useEffect(() => {
    if (value.trim()) {
      const searchTerm = value.toLowerCase();
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm)
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
        onSelect(value.trim());
        onChange('');
      } else {
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

  const handleRemoveSuggestion = (e: React.MouseEvent, suggestion: string) => {
    e.stopPropagation();
    removeGenre(suggestion);
  };

  const displayValue = value ? capitalizeTag(value) : '';

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        type="text"
        id={id}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.trim() && setIsOpen(true)}
        placeholder={placeholder}
        className={styles.input}
        autoComplete="off"
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
                  onMouseEnter={() => setHoveredSuggestion(suggestion)}
                  onMouseLeave={() => setHoveredSuggestion(null)}
                >
                  {suggestion}
                  {hoveredSuggestion === suggestion && (
                    <button
                      type="button"
                      className={styles.removeSuggestion}
                      onClick={(e) => handleRemoveSuggestion(e, suggestion)}
                      title="Remover sugestão"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {!filteredSuggestions.includes(capitalizeTag(value.trim())) && (
                <div
                  className={`${styles.suggestion} ${styles.addNew}`}
                  onClick={handleAddNew}
                >
                  Adicionar "{capitalizeTag(value.trim())}"
                </div>
              )}
            </>
          ) : (
            <div
              className={`${styles.suggestion} ${styles.addNew}`}
              onClick={handleAddNew}
            >
              Adicionar "{capitalizeTag(value.trim())}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput; 