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

    const handleDocumentClick = () => {
      notifications.forEach(notification => {
        dispatch(removeNotification(notification.id));
      });
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      timers.forEach(clearTimeout);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [notifications, dispatch]);

  if (!notifications.length) {
    return null;
  }

  return (
    <div className={css.notificationContainer}>
      {notifications.map(notification => {
        const message =
          typeof notification.message === 'string'
            ? notification.message
            : 'An error occurred. Please try again.';
        return (
          <div
            key={notification.id}
            className={`${css.notification} ${css[notification.type]}`}
            onClick={() => {
              dispatch(removeNotification(notification.id));
            }}>
            {notification.notificationType ===
            NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL ? (
              <div>
                <span>{notification.message}</span>
                <SupportEmail />
              </div>
            ) : (
              message
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Notification;