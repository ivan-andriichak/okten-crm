import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import {
  activateManager,
  banManager,
  createManager,
  fetchManagers,
  fetchOverallStats,
  recoverPassword,
  unbanManager,
} from '../../store/slices/managerSlice';
import css from './AdminPanel.module.css';
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
  const { managers, total, loading, error, page, limit, overallStats } = useSelector(
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
      dispatch(fetchManagers({ page, limit, sort: 'created_at', order: 'DESC' }));
      dispatch(fetchOverallStats());
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
      await dispatch(createManager(formData)).unwrap();
      setFormSuccess('Manager created successfully!');
      setFormData({ email: '', name: '', surname: '' });
      setIsModalOpen(false);
      setFormError(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create manager');
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
    dispatch(fetchManagers({ page: newPage, limit, sort: 'created_at', order: 'DESC' }));
  };

  const handleAction = async (action: string, managerId: string) => {
    try {
      switch (action) {
        case 'activate': {
          const result = await dispatch(activateManager(managerId)).unwrap();
          await navigator.clipboard.writeText(result.link);
          alert('Activation link copied to clipboard!');
          break;
        }
        case 'recover': {
          const result = await dispatch(recoverPassword(managerId)).unwrap();
          await navigator.clipboard.writeText(result.link);
          alert('Recovery link copied to clipboard!');
          break;
        }
        case 'ban':
          await dispatch(banManager(managerId)).unwrap();
          break;
        case 'unban':
          await dispatch(unbanManager(managerId)).unwrap();
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to perform ${action}`;
      alert(errorMessage);
      console.error(`Failed to perform ${action}:`, err);
    }
  };

  return (
    <>
      <Header />
      <div className={css.container}>
        <div className={css.stats}>
          <h3>Overall Order Statistics</h3>
          <p>New: {overallStats.New}</p>
          <p>In Work: {overallStats.InWork}</p>
          <p>Agree: {overallStats.Agree}</p>
          <p>Disagree: {overallStats.Disagree}</p>
          <p>Dubbing: {overallStats.Dubbing}</p>
        </div>
        <div className={css.createButton}>
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
        {error && (
          <p style={{ color: 'red', display: 'flex', justifyContent: 'center' }}>
            {error}
          </p>
        )}
        {managers.length > 0 ? (
          <>
            <table className={css.table}>
              <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Status</th>
                <th>Statistics</th>
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
                    Total Orders: {manager.statistics?.totalOrders || 0}, Active:{' '}
                    {manager.statistics?.activeOrders || 0}
                  </td>
                  <td>
                    {manager.is_active ? (
                      <Button
                        className={`${css.actionButton} ${css.recoverButton}`}
                        onClick={() => handleAction('recover', manager.id)}
                      >
                        Recover Password
                      </Button>
                    ) : (
                      <Button
                        className={`${css.actionButton} ${css.activateButton}`}
                        onClick={() => handleAction('activate', manager.id)}
                      >
                        Activate
                      </Button>
                    )}
                    <Button
                      className={`${css.actionButton} ${css.banButton}`}
                      onClick={() => handleAction('ban', manager.id)}
                      disabled={!manager.is_active}
                    >
                      Ban
                    </Button>
                    <Button
                      className={`${css.actionButton} ${css.unbanButton}`}
                      onClick={() => handleAction('unban', manager.id)}
                      disabled={manager.is_active}
                    >
                      Unban
                    </Button>
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
    </>
  );
};

export default AdminPanel;