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
    console.log('Notifications updated:', notifications);
    const timers = notifications.map(notification =>
      setTimeout(() => {
        console.log(`Removing notification: ${notification.id}`);
        dispatch(removeNotification(notification.id));
      }, notification.duration || 3000),
    );

    return () => {
      console.log('Cleaning up timers for notifications:', notifications);
      timers.forEach(clearTimeout);
    };
  }, [notifications, dispatch]);

  if (!notifications.length) {
    console.log('No notifications to render');
    return null;
  }

  return (
    <div className={css.notificationContainer}>
      {notifications.map(
        (notification: {
          id: string;
          type: string;
          message: React.ReactNode;
        }) => (
          <div
            key={notification.id}
            className={`${css.notification} ${css[notification.type]}`}
            onClick={() => {
              console.log(`Manually removing notification: ${notification.id}`);
              dispatch(removeNotification(notification.id));
            }}>
            {notification.message}
          </div>
        ),
      )}
    </div>
  );
};

export default Notification;
