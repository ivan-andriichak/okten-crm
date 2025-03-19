import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, createOrder } from '../../store'; // Імпортуємо createOrder

const PublicOrderForm = () => {
  const dispatch = useDispatch<AppDispatch>();
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
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmString = [utmSource, utmMedium, utmCampaign]
      .filter(Boolean)
      .map((param, idx) => `${['utm_source', 'utm_medium', 'utm_campaign'][idx]}=${param}`)
      .join('&');
    if (utmString) {
      setFormData((prev) => ({ ...prev, utm: utmString }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? (value ? Number(value) : '') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
      };
      await dispatch(createOrder(orderData)).unwrap(); // Викликаємо createOrder
      alert('Заявка успішно створена!');
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
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Помилка при створенні заявки');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Реєстрація на курс</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Ім'я" required />
        <input name="surname" value={formData.surname} onChange={handleChange} placeholder="Прізвище" required />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" required />
        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Телефон" required />
        <input name="age" value={formData.age} onChange={handleChange} placeholder="Вік" type="number" />
        <select name="course" value={formData.course} onChange={handleChange} required>
          <option value="">Виберіть курс</option>
          <option value="FS">FS</option>
          <option value="QACX">QACX</option>
          <option value="JCX">JCX</option>
          <option value="JSCX">JSCX</option>
          <option value="FE">FE</option>
          <option value="PCX">PCX</option>
        </select>
        <select name="course_format" value={formData.course_format} onChange={handleChange} required>
          <option value="">Виберіть формат</option>
          <option value="static">Static</option>
          <option value="online">Online</option>
        </select>
        <select name="course_type" value={formData.course_type} onChange={handleChange} required>
          <option value="">Виберіть тип</option>
          <option value="pro">Pro</option>
          <option value="minimal">Minimal</option>
          <option value="premium">Premium</option>
          <option value="incubator">Incubator</option>
          <option value="vip">VIP</option>
        </select>
        <button type="submit">Відправити заявку</button>
      </form>
    </div>
  );
};

export default PublicOrderForm;