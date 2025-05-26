import React from 'react';

export interface Notification {
  id: string;
  message: React.ReactNode;
  type: 'error' | 'success' | 'info';
  duration?: number;
}


