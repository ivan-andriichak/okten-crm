import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import css from './AdminPanel.module.css';
import {
  activateManager,
  addNotification,
  AppDispatch,
  banManager,
  createManager,
  fetchManagers,
  fetchOverallStats,
  recoverPassword,
  RootState,
  unbanManager,
} from '../../store';
import Button from '../Button/Button';
import CreateManagerModal from '../CreateManagerModal/CreateManagerModal';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import Header from '../Header/Header';
import { Pagination } from '../Pagination/Pagination';
import { formatCell } from '../../utils/timeUtils';

interface ManagerFormData {
  email: string;
  name: string;
  surname: string;
}

interface AdminPanelProps {
  token: string;
  role: 'admin' | 'manager';
}

const AdminPanel: FC<AdminPanelProps> = ({ token, role }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { managers, total, loading, page, limit, overallStats } = useSelector(
    (state: RootState) => state.managers,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ManagerFormData>({
    email: '',
    name: '',
    surname: '',
  });


  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
    } else {
      dispatch(
        fetchManagers({ page, limit, sort: 'created_at', order: 'DESC' }),
      );
      dispatch(fetchOverallStats());
    }
  }, [dispatch, token, role, page, limit, navigate]);

  useEffect(() => {
  }, [overallStats]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.surname) {
      dispatch(
        addNotification({
          message: 'Fill in all fields',
          type: 'error',
        }),
      );
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      dispatch(
        addNotification({
          message: 'Invalid email format',
          type: 'error',
        }),
      );
      return;
    }

    try {
      await dispatch(createManager(formData)).unwrap();
      dispatch(
        addNotification({
          message: 'Manager created successfully!',
          type: 'success',
        }),
      );
      setFormData({ email: '', name: '', surname: '' });
      setIsModalOpen(false);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Failed to create manager. Please contact support: support@example.com',
          type: 'error',
        }),
      );
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ email: '', name: '', surname: '' });
  };

  const handlePageChange = (newPage: number) => {
    dispatch(
      fetchManagers({
        page: newPage,
        limit,
        sort: 'created_at',
        order: 'DESC',
      }),
    );
  };

  const handleAction = async (action: string, managerId: string) => {
    try {
      switch (action) {
        case 'activate': {
          const result = await dispatch(activateManager(managerId)).unwrap();
          await navigator.clipboard.writeText(result.link);
          dispatch(
            addNotification({
              message: 'Activation link copied!',
              type: 'success',
            }),
          );
          break;
        }
        case 'recover': {
          const result = await dispatch(recoverPassword(managerId)).unwrap();
          await navigator.clipboard.writeText(result.link);
          dispatch(
            addNotification({
              message: 'Recovery link copied!',
              type: 'success',
            }),
          );
          break;
        }
        case 'ban': {
          await dispatch(banManager(managerId)).unwrap();
          dispatch(
            addNotification({
              message: 'Manager banned successfully!',
              type: 'success',
            }),
          );
          dispatch(fetchManagers({ page, limit, sort: 'created_at', order: 'DESC' }));
          break;
        }
        case 'unban': {
          await dispatch(unbanManager(managerId)).unwrap();
          dispatch(
            addNotification({
              message: 'Manager unbanned successfully!',
              type: 'success',
            }),
          );
          break;
        }
        default:
          dispatch(
            addNotification({
              message: `Unknown action: ${action}`,
              type: 'error',
            }),
          );
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Action failed';
      dispatch(
        addNotification({
          message: `${errorMessage}. Please contact support: support@example.com`,
          type: 'error',
        }),
      );
    }
  };

  return (
    <>
      <Header />
      <div className={css.container}>
        <div className={css.statsContainer}>
          <h3>Overall Order Statistics</h3>
          <div className={css.stats}>
            <p style={{ fontWeight: 'bolder' }}>Total: {overallStats.Total ?? 0}</p>
          <p>New: <span style={{ color: 'green', fontWeight: 'bold' }}>{overallStats.New ?? 0}</span></p>
           <p>In Work: <span style={{ color: 'blue', fontWeight: 'bold' }}>{overallStats['In work'] ?? 0}</span></p>
            <p>Agree: <span style={{ color: 'green', fontWeight: 'bold' }}>{overallStats.Agree ?? 0}</span></p>
            <p>Disagree: <span style={{ color: 'red', fontWeight: 'bold' }}>{overallStats.Disagree ?? 0}</span></p>
            <p>Dubbing: <span style={{ color: 'purple', fontWeight: 'bold' }}>{overallStats.Dubbing ?? 0}</span></p>
          </div>
        </div>
        <div className={css.createButton}>
          <Button onClick={() => setIsModalOpen(true)}>CREATE</Button>
        </div>

        <CreateManagerModal
          isOpen={isModalOpen}
          formData={formData}
          formError={null}
          formSuccess={null}
          onClose={closeModal}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />

        {loading && <LoadingSpinner />}
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
                <th>Last login</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {managers.map(manager => (
                <tr key={manager.id}>
                  <td>{manager.email}</td>
                  <td>{manager.name}</td>
                  <td>{manager.surname}</td>
                 <td style={{ color: manager.is_active ? 'green' : 'red' }}>
                    {manager.is_active ? 'Active' : 'Inactive'}
                  </td>
                  <td>
                    Total Orders: {manager.statistics?.totalOrders || 0},
                    Active: {manager.statistics?.activeOrders || 0}
                  </td>
                  <td>{formatCell('last_login', manager.last_login)}</td>
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