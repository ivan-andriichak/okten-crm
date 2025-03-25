import React, { FC } from 'react';

const LoadingSpinner: FC = () => {
  const spinnerStyles: React.CSSProperties = {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 10px',
  };

  const containerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(0,0,0,0.2)',
    textAlign: 'center',
  };

  return (
    <div style={containerStyles}>
      <div className="spinner" style={spinnerStyles}></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
