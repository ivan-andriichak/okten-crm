import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppDispatch, RootState, logout } from '../../store';
import oktenLogo from '../../images/okten.jpg';
import Logout from '../../images/Logout.png';
import admin from '../../images/admin.png';
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

  return (
    <div className={css.orders_container}>
      {pathname === '/orders' ? (
        <div className={css.logo}>
          <img className={css.logoImage} src={oktenLogo} alt="okten-logo" />
        </div>
      ) : (
        <Link to="/orders">
          <div className={css.logo}>
            <img className={css.logoImage} src={oktenLogo} alt="okten-logo" />
          </div>
        </Link>
      )}
      <div className={css.user_info}>
        <div style={{ display: 'flex', gap: '5px', marginRight: '20px' }}>
          <p className={css.role}>{role || 'Not available'}</p>
          <p className={css.name}>
            {name && surname ? `${name} ${surname}` : 'Not available'}
          </p>
        </div>
        <Link to="/admin">
          <Button>
            <img src={admin} alt="admin" className={css.resetButton} />
          </Button>
        </Link>
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