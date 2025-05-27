// Common interfaces for better typing
export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: 'admin' | 'librarian';
}

export interface Student extends BaseEntity {
  name: string;
  className: string;
  userId: string;
  username?: string;
  hasCredentials?: boolean;
  tempPassword?: string;
}

export interface Staff extends BaseEntity {
  name: string;
  department: string;
  position: string;
  userId: string;
}

export interface Book extends BaseEntity {
  title: string;
  author: string;
  isbn?: string;
  category: string;
  tags: string[];
  available: boolean;
  totalCopies: number;
  availableCopies: number;
  userId: string;
}

export interface Loan extends BaseEntity {
  bookId: string;
  borrowerId: string;
  borrowerType: 'student' | 'staff';
  loanDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'active' | 'returned' | 'overdue';
  userId: string;
}

// Form interfaces
export interface ContactFormData {
  nome: string;
  interesse: string;
  mensagem: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface StudentLoginFormData {
  username: string;
  password: string;
}

// Component props interfaces
export interface CardProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  className?: string;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
} 