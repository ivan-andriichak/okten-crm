import React from 'react';

export interface Notification {
  id: string;
  notificationType?: string;
  message: React.ReactNode;
  type: 'error' | 'success' | 'info';
  duration?: number;
}


