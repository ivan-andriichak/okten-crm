import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { addNotification, AppDispatch, logout, RootState } from '../../store';

import oktenLogo from '../../images/okten.jpg';
import Logout from '../../images/Logout.png';
import admin from '../../images/admin.png';
import back from '../../images/back.png';
import Button from '../Button/Button';
import css from './Header.module.css';

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { role, name, surname } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleAdminClick = () => {
    if (role === 'manager') {
      dispatch(
        addNotification({
          message: 'Access restricted to administrators only',
          type: 'error',
        }),
      );
    } else if (role === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className={css.orders_container}>
      <div className={css.logo}>
        <img
          className={css.logoImage}
          src={oktenLogo}
          alt="okten-logo"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            window.open('http://localhost:3000/register', '_blank')
          }
          data-tooltip-id="logo-tooltip"
          data-tooltip-content="Go to registration page"
        />
      </div>
      <div className={css.user_info}>
        <div style={{ display: 'flex', gap: '5px', marginRight: '20px' }}>
          <p className={css.role}>{role || 'Not available'}</p>
          <p className={css.name}>
            {name && surname ? `${name} ${surname}` : 'Not available'}
          </p>
        </div>

        {pathname === '/admin' ? (
          <Link to="/orders">
            <Button
              data-tooltip-id="back-tooltip"
              data-tooltip-content="Back to orders">
              <img
                src={back}
                alt="back"
                style={{ borderRadius: '50%' }}
                className={css.resetButton}
              />
            </Button>
          </Link>
        ) : (
          <Button
            onClick={handleAdminClick}
            data-tooltip-id="admin-tooltip"
            data-tooltip-content="Go to admin panel">
            <img src={admin} alt="admin" className={css.resetButton} />
          </Button>
        )}

        <Button
          data-tooltip-id="logout-tooltip"
          data-tooltip-content="Logout">
          <img
            src={Logout}
            alt="logout"
            className={css.resetButton}
            onClick={handleLogout}
          />
        </Button>
      </div>

      <ReactTooltip
        id="back-tooltip"
        style={{ backgroundColor: '#222', color: '#fff', borderRadius: '8px', zIndex: 9999 }}
      />
      <ReactTooltip
        id="admin-tooltip"
        style={{ backgroundColor: '#007bff', color: '#fff', borderRadius: '8px', zIndex: 9999 }}
      />
      <ReactTooltip
        id="logout-tooltip"
        style={{ backgroundColor: '#dc3545', color: '#fff', borderRadius: '8px', zIndex: 9999 }}
      />
      <ReactTooltip
        id="logo-tooltip"
        style={{ backgroundColor: '#343a40', color: '#fff', borderRadius: '8px', zIndex: 9999 }}
      />
    </div>
  );
};

export default Header;
