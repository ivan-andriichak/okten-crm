import React from 'react';

export interface ManagerFormData {
  email: string;
  name: string;
  surname: string;
}

export interface CreateManagerModalProps {
  isOpen: boolean;
  formData: ManagerFormData;
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}
