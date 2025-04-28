import React from 'react';
import Button from '../Button/Button';
import css from './CreateManagerModal.module.css';

interface ManagerFormData {
  email: string;
  name: string;
  surname: string;
}

interface CreateManagerModalProps {
  isOpen: boolean;
  formData: ManagerFormData;
  formError: string | null;
  formSuccess: string | null;
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CreateManagerModal: React.FC<CreateManagerModalProps> = ({
  isOpen,
  formData,
  formError,
  formSuccess,
  onClose,
  onInputChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className={css.modalOverlay}>
      <div className={css.modal}>
        <h2 className={css.modalTitle}>Create New Manager</h2>
        <form className={css.form} onSubmit={onSubmit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              required
            />
          </div>
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              required
            />
          </div>
          <div>
            <label>Surname</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={onInputChange}
              required
            />
          </div>
          {formError && <p className={css.error}>{formError}</p>}
          {formSuccess && <p className={css.success}>{formSuccess}</p>}
          <div>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateManagerModal;
