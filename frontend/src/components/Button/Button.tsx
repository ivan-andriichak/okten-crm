import React, { ButtonHTMLAttributes, CSSProperties } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Button = ({
  children,
  variant = 'primary',
  onClick,
  style,
  ...rest
}: ButtonProps) => {
  const baseStyles: CSSProperties = {
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #ddd',
    transition: 'background-color 0.2s, color 0.2s',
  };

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      backgroundColor: '#e2ebfd',
      color: '#333',
      border: '1px solid #b0c4de',
    },
    secondary: {
      backgroundColor: '#f7f8fa',
      color: '#555',
      border: '1px solid #ccc',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#333',
      border: '1px solid #ddd',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button style={combinedStyles} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default Button;