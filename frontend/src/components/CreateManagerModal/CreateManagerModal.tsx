import  { FC } from 'react';
import Button from '../Button/Button';
import css from './CreateManagerModal.module.css';
import { CreateManagerModalProps } from '../interfaces/createManager';

const CreateManagerModal: FC<CreateManagerModalProps> = ({
  isOpen,
  formData,
  onClose,
  onInputChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className={css.modalOverlay}>
      <div className={css.modalContainer}>
        <h2 className={css.modalTitle}>Create New Manager</h2>
        <form className={css.form} onSubmit={onSubmit}>
          <div>
            <label>Email</label>
            <input
              className={css.input}
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
              className={css.input}
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
              className={css.input}
              type="text"
              name="surname"
              value={formData.surname}
              onChange={onInputChange}
              required
            />
          </div>
          <div className={css.buttonGroup}>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateManagerModal;
