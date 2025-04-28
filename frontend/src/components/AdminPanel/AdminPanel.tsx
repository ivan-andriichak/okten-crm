import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import {
  activateManager,
  banManager,
  fetchManagers,
  recoverPassword,
  unbanManager,
} from '../../store/slices/managerSlice';
import css from './AdminPanel.module.css';
import { api } from '../../services/api';
import Button from '../Button/Button';
import Header from '../Header/Header';
import CreateManagerModal from '../CreateManagerModal/CreateManagerModal';
import { Pagination } from '../Pagination/Pagination';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

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
    (state: RootState) => state.managers,
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/managers', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setFormSuccess('Manager created successfully!');
      setFormData({ email: '', name: '', surname: '' });
      setIsModalOpen(false);
      setFormError(null);
      dispatch(fetchManagers({ page: 1, limit }));
    } catch (err: any) {
      setFormError(
        err.response?.data?.messages?.[0] || 'Failed to create manager',
      );
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
      <div>
        <Button onClick={() => setIsModalOpen(true)}>CREATE</Button>
      </div>

      <CreateManagerModal
        isOpen={isModalOpen}
        formData={formData}
        formError={formError}
        formSuccess={formSuccess}
        onClose={closeModal}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'red', display:'flex', justifyContent:'center' }}>{error}</p>}
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
            {managers.map(manager => (
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
            <Pagination
              currentPage={page}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        !loading && <p className={css.noManagers}>No managers found.</p>
      )}
    </div>
  );
};

export default AdminPanel;