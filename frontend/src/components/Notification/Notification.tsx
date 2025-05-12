import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, removeNotification, RootState } from '../../store';
import css from './Notification.module.css';

const Notification: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications,
  );

  useEffect(() => {
    const timers = notifications.map((notification) =>
      setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration || 6000)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, dispatch]);

  if (!notifications.length) return null;

  return (
    <div className={css.notificationContainer}>
      {notifications.map((notification: { id: string; type: string; message: React.ReactNode }) => (
        <div
          key={notification.id}
          className={`${css.notification} ${css[notification.type]}`}
          onClick={() => dispatch(removeNotification(notification.id))}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};


export default Notification;
