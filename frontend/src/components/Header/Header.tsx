import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppDispatch, RootState, logout } from '../../store';
import { addNotification } from '../../store/slices/notificationSlice';
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
        <img className={css.logoImage} src={oktenLogo} alt="okten-logo" />
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
            <Button>
              <img
                src={back}
                alt="back"
                style={{ borderRadius: '50%' }}
                className={css.resetButton}
              />
            </Button>
          </Link>
        ) : (
          <Button onClick={handleAdminClick}>
            <img src={admin} alt="admin" className={css.resetButton} />
          </Button>
        )}
        <Button>
          <img
            src={Logout}
            alt="logout"
            className={css.resetButton}
            onClick={handleLogout}
          />
        </Button>
      </div>
    </div>
  );
};

export default Header;
