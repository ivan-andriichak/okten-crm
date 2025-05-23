import { FC } from 'react';
import css from './SupportEmail.module.css';
import Button from '../Button/Button';
import { SUPPORT_INFO } from '../../config/config';

const SupportEmail: FC = () => {
  const supportInfo = SUPPORT_INFO;

  return (
    <div className={css.container}>
      <Button className={css.button}>
        <a href={`mailto:${supportInfo.email}`} className={css.link}>
          {supportInfo.email}
        </a>
      </Button>
      <p className={css.phone}>Phone: {supportInfo.phone}</p>
      <p className={css.name}>Name: {supportInfo.name}</p>
    </div>
  );
};

export default SupportEmail;
