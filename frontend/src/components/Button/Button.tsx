import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'delete';
  className?: string;
  disabled?: boolean;
}

const Button = ({
  children,
  variant = 'primary',
  onClick,
  className,
  disabled = false,
  ...rest
}: ButtonProps) => {
  const buttonClasses = `${styles.button} ${styles[variant]} ${className || ''} ${disabled ? styles.disabled : ''}`;

  return (
    <button className={buttonClasses} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default Button;
