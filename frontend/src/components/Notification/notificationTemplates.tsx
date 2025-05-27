import React from 'react';
import SupportEmail from '../SupportEmail/SupportEmail';

type TemplateMap = {
  [key: string]: (params?: any) => React.ReactNode;
};

export const notificationTemplates: TemplateMap = {
  USER_BANNED: () => (
    <>
      Ваш акаунт заблоковано. Зверніться до підтримки: <SupportEmail />
</>
),
SESSION_EXPIRED: () => <>Сесія закінчилась. Увійдіть знову.</>,
PASSWORD_WEAK: () => (
  <>
    Пароль повинен містити великі, малі літери, цифри та спецсимволи.
</>
),
// Додайте інші шаблони
};
