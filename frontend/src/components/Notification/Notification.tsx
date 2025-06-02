import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, removeNotification, RootState } from '../../store';
import css from './Notification.module.css';
import { FC, useEffect } from 'react';
import { NOTIFICATION_TYPES } from '../../constants/error-messages';
import SupportEmail from '../SupportEmail/SupportEmail';

const Notification: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications,
  );

  useEffect(() => {
    const timers = notifications.map(notification =>
      setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration || 5000),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, dispatch]);

  if (!notifications.length) {
    return null;
  }

  return (
    <div className={css.notificationContainer}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`${css.notification} ${css[notification.type]}`}
          onClick={() => {
            dispatch(removeNotification(notification.id));
          }}>
          {notification.notificationType ===
          NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL ? (
            <div className={css.bannedMessage}>
              <span>{notification.message}</span>
              <SupportEmail />
            </div>
          ) : (
            (notification.message as string)
          )}
        </div>
      ))}
    </div>
  );
};

export default Notification;