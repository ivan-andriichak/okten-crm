import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, createOrder } from '../../store';
import css from './PublicOrderForm.module.css';
import Button from '../Button/Button';

const PublicOrderForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    age: '',
    course: '',
    course_format: '',
    course_type: '',
    utm: '',
    msg: '',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    const utmString = [utmSource, utmMedium, utmCampaign]
      .filter(Boolean)
      .map(
        (param, idx) =>
          `${['utm_source', 'utm_medium', 'utm_campaign'][idx]}=${param}`,
      )
      .join('&');

    let generatedMsg = 'Заявка без маркетингових даних';
    if (utmSource || utmMedium || utmCampaign) {
      generatedMsg = `Заявка через ${utmSource || 'невідоме джерело'}${utmCampaign ? ` (${utmCampaign})` : ''}`;
    }

    setFormData(prev => ({
      ...prev,
      utm: utmString,
      msg: generatedMsg,
    }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? (value ? Number(value) : '') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneRegex = /^\+380\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setNotification({ type: 'error', message: 'Телефон має бути у форматі +380XXXXXXXXX' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setNotification({ type: 'error', message: 'Введіть коректний email' });
      return;
    }

    const ageNum = Number(formData.age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 60) {
      setNotification({ type: 'error', message: 'Вік має бути від 18 до 60' });
      return;
    }

    try {
      const orderData = {
        ...formData,
        age: ageNum,
      };
      await dispatch(createOrder(orderData)).unwrap();
      setNotification({ type: 'success', message: 'Заявка успішно створена!' });
      setFormData({
        name: '',
        surname: '',
        email: '',
        phone: '',
        age: '',
        course: '',
        course_format: '',
        course_type: '',
        utm: formData.utm,
        msg: formData.msg,
      });
    } catch (error) {
      console.error('Error:', error);
      setNotification({ type: 'error', message: 'Помилка при створенні заявки' });
    }
  };

  return (
    <div className={css.container}>
      <h2 className={css.heading}>Реєстрація на курс</h2>
      <form className={css.form} onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ім'я"
          required
          className={css.input}
        />
        <input
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          placeholder="Прізвище"
          required
          className={css.input}
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          required
          className={css.input}
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Телефон"
          required
          className={css.input}
        />
        <input
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Вік"
          type="number"
          className={css.input}
        />
        <select
          name="course"
          value={formData.course}
          onChange={handleChange}
          required
          className={css.select}>
          <option value="">Виберіть курс</option>
          <option value="FS">FS</option>
          <option value="QACX">QACX</option>
          <option value="JCX">JCX</option>
          <option value="JSCX">JSCX</option>
          <option value="FE">FE</option>
          <option value="PCX">PCX</option>
        </select>
        <select
          name="course_format"
          value={formData.course_format}
          onChange={handleChange}
          required
          className={css.select}>
          <option value="">Виберіть формат</option>
          <option value="static">Static</option>
          <option value="online">Online</option>
        </select>
        <select
          name="course_type"
          value={formData.course_type}
          onChange={handleChange}
          required
          className={css.select}>
          <option value="">Виберіть тип</option>
          <option value="pro">Pro</option>
          <option value="minimal">Minimal</option>
          <option value="premium">Premium</option>
          <option value="incubator">Incubator</option>
          <option value="vip">VIP</option>
        </select>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button type="submit" variant="primary">
            Відправити заявку
          </Button>
        </div>
      {notification && (
        <div
          className={
            notification.type === 'success'
              ? css.notificationSuccess
              : css.notificationError
          }
        >
          {notification.message}
        </div>
      )}
      </form>
    </div>
  );
};

export { PublicOrderForm };
