import { useState } from 'react';
import { BarcodeGenerator } from '../utils/barcodeGenerator';

interface UseBarcodeGeneratorReturn {
  generatePDF: (books: any[], fileName?: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
  clearError: () => void;
}

export const useBarcodeGenerator = (): UseBarcodeGeneratorReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async (books: any[], fileName?: string): Promise<void> => {
    if (!books || books.length === 0) {
      setError('Nenhum livro selecionado para gerar códigos de barras');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Preparar dados dos livros
      const bookCodes = BarcodeGenerator.prepareBooksData(books);
      
      if (bookCodes.length === 0) {
        throw new Error('Nenhum código válido encontrado nos livros selecionados');
      }

      // Gerar nome do arquivo baseado na data atual se não fornecido
      const defaultFileName = `etiquetas_livros_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      
      // Gerar PDF
      await BarcodeGenerator.generateBarcodesPDF(bookCodes, fileName || defaultFileName);
      
      // Feedback para o usuário (opcional - pode ser removido se preferir não mostrar alert)
      console.log(`PDF gerado com sucesso! ${bookCodes.length} códigos de barras incluídos.`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao gerar códigos de barras';
      setError(errorMessage);
      console.error('Erro ao gerar PDF de códigos de barras:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    generatePDF,
    isGenerating,
    error,
    clearError
  };
};

export default useBarcodeGenerator;
