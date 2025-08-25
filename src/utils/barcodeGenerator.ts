import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';

export interface BookCode {
  bookTitle: string;
  code: string;
  author?: string;
  genre?: string;
  shelf?: string;
}

export interface BarcodeOptions {
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
}

export class BarcodeGenerator {
  private static defaultOptions: BarcodeOptions = {
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 12,
    margin: 10
  };

  /**
   * Gera um código de barras em canvas para um código específico
   */
  static generateBarcodeCanvas(code: string, options: BarcodeOptions = {}): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const finalOptions = { ...this.defaultOptions, ...options };
    
    try {
      JsBarcode(canvas, code, finalOptions);
      return canvas;
    } catch (error) {
      console.error('Erro ao gerar código de barras:', error);
      throw new Error(`Falha ao gerar código de barras para: ${code}`);
    }
  }

  /**
   * Gera um código de barras como Data URL (base64)
   */
  static generateBarcodeDataURL(code: string, options: BarcodeOptions = {}): string {
    const canvas = this.generateBarcodeCanvas(code, options);
    return canvas.toDataURL('image/png');
  }

  /**
   * Gera um PDF com etiquetas completas para códigos de barras
   */
  static async generateBarcodesPDF(bookCodes: BookCode[], fileName: string = 'etiquetas_livros.pdf'): Promise<void> {
    if (bookCodes.length === 0) {
      throw new Error('Nenhum código de livro fornecido');
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      
      // Dimensões da etiqueta (compatível com impressoras térmicas)
      const labelWidth = 80;
      const labelHeight = 50;
      const labelMargin = 3;
      const spacing = 5;
      
      // Calcular quantas etiquetas cabem por linha e por coluna
      const labelsPerRow = Math.floor((pageWidth - 2 * margin + spacing) / (labelWidth + spacing));
      const labelsPerCol = Math.floor((pageHeight - 2 * margin + spacing) / (labelHeight + spacing));
      
      let currentLabel = 0;

      // Adicionar título da página
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Etiquetas de Livros - Biblioteca', pageWidth / 2, margin - 2, { align: 'center' });

      for (let i = 0; i < bookCodes.length; i++) {
        const bookCode = bookCodes[i];
        
        // Calcular posição da etiqueta atual
        const row = Math.floor(currentLabel / labelsPerRow);
        
        // Verificar se precisa de nova página
        if (row >= labelsPerCol) {
          doc.addPage();
          currentLabel = 0;
          
          // Título da nova página
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Etiquetas de Livros - Biblioteca', pageWidth / 2, margin - 2, { align: 'center' });
        }

        // Recalcular posição após possível mudança de página
        const newRow = Math.floor(currentLabel / labelsPerRow);
        const newCol = currentLabel % labelsPerRow;
        
        // Posição da etiqueta
        const labelX = margin + newCol * (labelWidth + spacing);
        const labelY = margin + 8 + newRow * (labelHeight + spacing);

        // Desenhar moldura da etiqueta
        doc.setLineWidth(0.3);
        doc.setDrawColor(0, 0, 0);
        doc.rect(labelX, labelY, labelWidth, labelHeight);

        // Área interna da etiqueta
        const innerX = labelX + labelMargin;
        const innerY = labelY + labelMargin;
        const innerWidth = labelWidth - 2 * labelMargin;
        let textY = innerY + 4;

        // Título do livro (máximo 2 linhas)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const titleText = bookCode.bookTitle || '-';
        const titleLines = doc.splitTextToSize(titleText, innerWidth);
        const maxTitleLines = Math.min(titleLines.length, 2);
        
        for (let j = 0; j < maxTitleLines; j++) {
          doc.text(titleLines[j], innerX, textY);
          textY += 3.5;
        }
        
        if (titleLines.length > 2) {
          // Adicionar "..." se o título foi truncado
          const lastLine = titleLines[1];
          const truncatedLine = lastLine.length > 25 ? lastLine.substring(0, 25) + '...' : lastLine;
          doc.text(truncatedLine, innerX, textY - 3.5);
        }
        
        textY += 1;

        // Informações do livro
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        // Autor (só exibe se houver informação)
        const author = (bookCode as any).author;
        if (author && author !== '-' && author.trim() !== '') {
          doc.text(`Autor: ${author}`, innerX, textY);
          textY += 3;
        }
        
        // Gênero (só exibe se houver informação)
        const genre = (bookCode as any).genre;
        if (genre && genre !== '-' && genre.trim() !== '') {
          doc.text(`Gênero: ${genre}`, innerX, textY);
          textY += 3;
        }
        
        // Prateleira (só exibe se houver informação)
        const shelf = (bookCode as any).shelf;
        if (shelf && shelf !== '-' && shelf.trim() !== '') {
          doc.text(`Prateleira: ${shelf}`, innerX, textY);
          textY += 3;
        }
        
        textY += 1; // Pequeno espaço antes do código de barras

        // Gerar código de barras com largura reduzida
        const barcodeDataURL = this.generateBarcodeDataURL(bookCode.code, {
          width: 1,
          height: 50,
          displayValue: true,
          fontSize: 10,
          margin: 3
        });

        // Adicionar código de barras centralizado com largura reduzida
        const barcodeWidth = innerWidth * 0.8; // 80% da largura disponível
        const barcodeHeight = 15;
        const barcodeX = innerX + (innerWidth - barcodeWidth) / 2; // centralizar
        const barcodeY = labelY + labelHeight - labelMargin - barcodeHeight - 2;
        
        doc.addImage(barcodeDataURL, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);

        currentLabel++;
      }

      // Adicionar rodapé com informações
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Página ${i} de ${totalPages} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      // Salvar o PDF
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar PDF com etiquetas de livros');
    }
  }

  /**
   * Validar se um código é válido para gerar código de barras
   */
  static validateCode(code: string): boolean {
    // Verificar se o código não está vazio e tem caracteres válidos
    if (!code || code.trim().length === 0) {
      return false;
    }
    
    // CODE128 aceita caracteres ASCII 32-126 (caracteres imprimíveis)
    return /^[\x20-\x7E]+$/.test(code.trim());
  }

  /**
   * Preparar códigos de livros a partir dos dados dos livros selecionados
   */
  static prepareBooksData(books: any[]): BookCode[] {
    const bookCodes: BookCode[] = [];
    
    books.forEach(book => {
      const codes = this.getAllCodesFromBook(book);
      codes.forEach(code => {
        if (this.validateCode(code)) {
          // Preparar informações do autor
          let author = '';
          if (book.authors) {
            if (Array.isArray(book.authors)) {
              author = book.authors.length > 0 ? book.authors.join(', ') : '';
            } else {
              author = book.authors.toString();
            }
          }

          // Preparar informações do gênero
          let genre = '';
          if (book.genres && Array.isArray(book.genres) && book.genres.length > 0) {
            // Pegar apenas o primeiro gênero para economizar espaço
            genre = book.genres[0];
          }

          // Prateleira
          const shelf = book.shelf || '';

          bookCodes.push({
            bookTitle: book.title || 'Título não informado',
            code: code.trim(),
            author: author,
            genre: genre,
            shelf: shelf
          });
        }
      });
    });
    
    return bookCodes;
  }

  /**
   * Extrair todos os códigos de um livro (incluindo múltiplas cópias)
   */
  private static getAllCodesFromBook(book: any): string[] {
    if (book.codes && book.codes.length > 0) {
      return book.codes;
    }
    return book.code ? [book.code] : [];
  }
}

export default BarcodeGenerator;
