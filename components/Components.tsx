import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading, 
  disabled, 
  ...props 
}) => {
  const baseStyle = "px-4 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-sage-500 text-white hover:bg-sage-600 shadow-md shadow-sage-200",
    secondary: "bg-white text-sage-600 border border-sage-200 hover:bg-sage-50",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
    danger: "bg-red-50 text-red-500 hover:bg-red-100",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all ${props.className}`}
  />
);
