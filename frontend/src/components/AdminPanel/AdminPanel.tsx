import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Tooltip as ReactTooltip } from 'react-tooltip';
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
import SupportEmail from '../SupportEmail/SupportEmail';

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

  useEffect(() => {}, [overallStats]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.surname) {
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return;
    }

    try {
      await dispatch(createManager(formData)).unwrap();
      setFormData({ email: '', name: '', surname: '' });
      setIsModalOpen(false);
    } catch (e) {}
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

  const getManagerStatus = (manager: any) => {
    if (manager.is_active) {
      return { text: 'Active', color: 'green' };
    }
    if (manager.hasPassword) {
      return { text: 'Banned', color: 'red' };
    }
    return { text: 'Inactive', color: 'orange' };
  };

  const handleAction = async (action: string, managerId: string) => {
    try {
      switch (action) {
        case 'activate': {
          const result = await dispatch(activateManager(managerId)).unwrap();
          await navigator.clipboard.writeText(result.link);
          break;
        }
        case 'recover': {
          const result = await dispatch(recoverPassword(managerId)).unwrap();
          await navigator.clipboard.writeText(result.link);

          break;
        }
        case 'ban': {
          await dispatch(banManager(managerId)).unwrap();
          dispatch(
            fetchManagers({ page, limit, sort: 'created_at', order: 'DESC' }),
          );
          break;
        }
        case 'unban': {
          await dispatch(unbanManager(managerId)).unwrap();
          dispatch(
            fetchManagers({ page, limit, sort: 'created_at', order: 'DESC' }),
          );
          break;
        }
        default:
          dispatch(
            addNotification({
              message: (
                <>
                  Unknown action: {action}. Please contact support:{' '}
                  <SupportEmail />
                </>
              ),
              type: 'error',
              notificationType: 'system',
            }),
          );
          return;
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Action failed';
      dispatch(
        addNotification({
          message: (
            <>
              {`${errorMessage}. Please contact support: `} <SupportEmail />
            </>
          ),
          type: 'error',
          notificationType: 'system',
        }),
      );
    }
  };

  return (
    <>
      <div
        style={{ position: 'sticky', top: 0, zIndex: isModalOpen ? 0 : 100 }}>
        <Header />
      </div>
      <div className={css.container}>
        <div className={css.statsContainer}>
          <h3>Overall Order Statistics</h3>
          <div className={css.stats}>
            <p style={{ fontWeight: 'bolder' }}>
              Total: {overallStats.Total ?? 0}
            </p>
            <p>
              New:{' '}
              <span style={{ color: 'green', fontWeight: 'bold' }}>
                {overallStats.New ?? 0}
              </span>
            </p>
            <p>
              In Work:{' '}
              <span style={{ color: 'blue', fontWeight: 'bold' }}>
                {overallStats['In work'] ?? 0}
              </span>
            </p>
            <p>
              Agree:{' '}
              <span style={{ color: 'green', fontWeight: 'bold' }}>
                {overallStats.Agree ?? 0}
              </span>
            </p>
            <p>
              Disagree:{' '}
              <span style={{ color: 'red', fontWeight: 'bold' }}>
                {overallStats.Disagree ?? 0}
              </span>
            </p>
            <p>
              Dubbing:{' '}
              <span style={{ color: 'purple', fontWeight: 'bold' }}>
                {overallStats.Dubbing ?? 0}
              </span>
            </p>
          </div>
        </div>
        <div className={css.createButton}>
          <Button
            data-tooltip-id="create-tooltip"
            data-tooltip-content="Create a new manager"
            onClick={() => setIsModalOpen(true)}>
            CREATE
          </Button>
          <ReactTooltip
            id="create-tooltip"
            style={{
              backgroundColor: 'green',
              color: '#fff',
              borderRadius: '8px',
            }}
          />
        </div>

        <CreateManagerModal
          isOpen={isModalOpen}
          formData={formData}
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
                  <th>ID</th>
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
                {[...managers]
                  .sort((a, b) => {
                    if (a.role === 'admin' && b.role !== 'admin') return -1;
                    if (a.role !== 'admin' && b.role === 'admin') return 1;
                    return 0;
                  })
                  .map((manager, index) => {
                    const status = getManagerStatus(manager);
                    const displayIndex = index + 1 + (page - 1) * limit;
                    const isAdmin = manager.role === 'admin';
                    return (
                      <tr
                        key={manager.id}
                        style={
                          isAdmin
                            ? { backgroundColor: 'rgb(240, 255, 232)' }
                            : {}
                        }>
                        <td>{displayIndex}</td>
                        <td>
                          <span>
                            {manager.email}{' '}
                            {isAdmin && (
                              <h4
                                style={{
                                  textDecoration: isAdmin
                                    ? 'underline'
                                    : 'none',
                                }}>
                                (Admin)
                              </h4>
                            )}
                          </span>
                        </td>
                        <td>{manager.name}</td>
                        <td>{manager.surname}</td>
                        <td style={{ color: manager.hasPassword ? 'red' : status.color }}>{status.text}</td>
                        <td>
                          Total Orders: {manager.statistics?.totalOrders ?? 0},
                          Active: {manager.statistics?.activeOrders ?? 0}
                        </td>
                        <td>{formatCell('last_login', manager.last_login)}</td>
                        <td>
                          {isAdmin ? (
                            <Button
                              className={`${css.actionButton} ${css.recoverButton}`}
                              onClick={() =>
                                handleAction('recover', manager.id)
                              }>
                              Recover Password
                            </Button>
                          ) : (
                            <>
                              {manager.is_active ? (
                                <Button
                                  className={`${css.actionButton} ${css.recoverButton}`}
                                  onClick={() =>
                                    handleAction('recover', manager.id)
                                  }>
                                  Recover Password
                                </Button>
                              ) : (
                                <Button
                                  className={`${css.actionButton} ${css.activateButton}`}
                                  onClick={() =>
                                    handleAction('activate', manager.id)
                                  }
                                  disabled={manager.hasPassword}
                                  data-tooltip-id={`activate-tooltip-${manager.id}`}
                                  data-tooltip-content={
                                    manager.hasPassword
                                      ? 'Manager is banned'
                                      : 'Generate activation link'
                                  }>
                                  Activate
                                  {manager.hasPassword && (
                                    <ReactTooltip
                                      id={`activate-tooltip-${manager.id}`}
                                      style={{
                                        backgroundColor: 'red',
                                        color: 'white',
                                        borderRadius: '8px',
                                      }}
                                    />
                                  )}
                                </Button>
                              )}
                              {manager.is_active ? (
                                <Button
                                  className={`${css.actionButton} ${css.banButton}`}
                                  onClick={() =>
                                    handleAction('ban', manager.id)
                                  }
                                  disabled={
                                    manager.role === 'admin'
                                  }>
                                  Ban
                                </Button>
                              ) : (
                                <Button
                                  className={`${css.actionButton} ${css.unbanButton}`}
                                  onClick={() =>
                                    handleAction('unban', manager.id)
                                  }
                                  disabled={
                                    manager.role === 'admin'
                                  }>
                                  Unban
                                </Button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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