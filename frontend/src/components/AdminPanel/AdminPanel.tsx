import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState} from '../../store';
import {
  fetchManagers,
  activateManager,
  recoverPassword,
  banManager,
  unbanManager,
} from '../../store/slices/managerSlice';
import css from './AdminPanel.module.css';
import { api } from '../../services/api';
import Button from '../Button/Button';
import Header from '../Header/Header';

interface ManagerFormData {
  email: string;
  name: string;
  surname: string;
}

interface AdminPanelProps {
  token: string;
  role: 'admin' | 'manager';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ token, role }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { managers, total, loading, error, page, limit } = useSelector(
    (state: RootState) => state.managers
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ManagerFormData>({
    email: '',
    name: '',
    surname: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (token && role === 'admin') {
      dispatch(fetchManagers({ page, limit }));
    } else {
      navigate('/login');
    }
  }, [dispatch, token, role, page, limit, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(
        '/admin/managers',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setFormSuccess('Manager created successfully!');
      setFormData({ email: '', name: '', surname: '' });
      setIsModalOpen(false);
      setFormError(null);
      dispatch(fetchManagers({ page: 1, limit }));
    } catch (err: any) {
      setFormError(err.response?.data?.messages?.[0] || 'Failed to create manager');
      setFormSuccess(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ email: '', name: '', surname: '' });
    setFormError(null);
    setFormSuccess(null);
  };

  const handlePageChange = (newPage: number) => {
    dispatch(fetchManagers({ page: newPage, limit }));
  };

  const handleAction = (action: string, managerId: string) => {
    switch (action) {
      case 'activate':
        dispatch(activateManager(managerId));
        break;
      case 'recover':
        dispatch(recoverPassword(managerId));
        break;
      case 'ban':
        dispatch(banManager(managerId));
        break;
      case 'unban':
        dispatch(unbanManager(managerId));
        break;
    }
  };

  return (
    <div className={css.container}>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Button
          className={css.createButton}
          onClick={() => setIsModalOpen(true)}
        >
          CREATE
        </Button>
      </div>

      {isModalOpen && (
        <div className={css.modalOverlay}>
          <div className={css.modal}>
            <h2 className={css.modalTitle}>Create New Manager</h2>
            <form className={css.form} onSubmit={handleSubmit}>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Surname</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {formError && <p className={css.error}>{formError}</p>}
              {formSuccess && <p className={css.success}>{formSuccess}</p>}
              <div>
                <Button type="button" onClick={closeModal}>
                  Cancel
                </Button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <div className={css.loading}>Loading...</div>}
      {error && <p className={css.error}>{error}</p>}
      {managers.length > 0 ? (
        <>
          <table className={css.table}>
            <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Surname</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {managers.map((manager) => (
              <tr key={manager.id}>
                <td>{manager.email}</td>
                <td>{manager.name}</td>
                <td>{manager.surname}</td>
                <td>{manager.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                  {!manager.is_active && (
                    <button
                      className={`${css.actionButton} ${css.activateButton}`}
                      onClick={() => handleAction('activate', manager.id)}
                    >
                      Activate
                    </button>
                  )}
                  <Button
                    className={`${css.actionButton} ${css.recoverButton}`}
                    onClick={() => handleAction('recover', manager.id)}
                  >
                    Recover Password
                  </Button>
                  {manager.is_active && (
                    <button
                      className={`${css.actionButton} ${css.banButton}`}
                      onClick={() => handleAction('ban', manager.id)}
                    >
                      Ban
                    </button>
                  )}
                  {!manager.is_active && (
                    <Button
                      className={`${css.actionButton} ${css.unbanButton}`}
                      onClick={() => handleAction('unban', manager.id)}
                    >
                      Unban
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
          <div className={css.pagination}>
            <Button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <span>Page {page}</span>
            <Button
              disabled={page * limit >= total}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        !loading && <p className={css.noManagers}>No managers found.</p>
      )}
    </div>
  );
};

export default AdminPanel;