import { FC, useEffect, useState } from 'react';
import { api } from '../../services/api';

const SupportEmail: FC = () => {
  const [supportEmail, setSupportEmail] = useState(
    localStorage.getItem('supportEmail') || 'support@example.com',
  );

  useEffect(() => {
    api
      .get('/support')
      .then(response => {
        const email = response.data.supportEmail || 'support@example.com';
        setSupportEmail(email);
        localStorage.setItem('supportEmail', email);
      })
      .catch(() => {
        setSupportEmail('support@example.com');
      });
  }, []);

  return <a href={`mailto:${supportEmail}`}>{supportEmail}</a>;
};

export default SupportEmail;