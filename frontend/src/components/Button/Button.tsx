import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline'| 'delete';
  className?: string;
}

const Button = ({
                  children,
                  variant = 'primary',
                  onClick,
                  className,
                  ...rest
                }: ButtonProps) => {
  const buttonClasses = `${styles.button} ${styles[variant]} ${className || ''}`;

  return (
    <button className={buttonClasses} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default Button;