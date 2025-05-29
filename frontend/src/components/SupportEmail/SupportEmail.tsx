import css from './SupportEmail.module.css';
import { SUPPORT_INFO } from '../../config/config';
import { FC } from 'react';

const SupportEmail: FC = () => {
  const supportInfo = SUPPORT_INFO;

  return (
    <div className={css.container}>
      <div className={css.supportCard}>
        <button className={css.button}>
          <a
            href={`mailto:${supportInfo.email}`}
            className={css.link}
          >
            {supportInfo.email}
          </a>
        </button>
        <div className={css.info}>
          <div className={css.phone}>📱 {supportInfo.phone}</div>
          <div className={css.name}>👤 {supportInfo.name}</div>
        </div>
      </div>
    </div>
  );
};

export default SupportEmail;