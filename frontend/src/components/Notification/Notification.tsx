import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { removeNotification } from '../../store/slices/notificationSlice';
import css from './Notification.module.css';

const Notification: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications,
  );

  useEffect(() => {
    notifications.forEach((notification: { id: string }) => {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [notifications, dispatch]);

  return (
    <div className={css.notificationContainer}>
      {notifications.map(
        (notification: { id: string; type: string; message: string }) => (
          <div
            key={notification.id}
            className={`${css.notification} ${css[notification.type]}`}
            onClick={() => dispatch(removeNotification(notification.id))}>
            {notification.message}
          </div>
        ),
      )}
    </div>
  );
};

export default Notification;
