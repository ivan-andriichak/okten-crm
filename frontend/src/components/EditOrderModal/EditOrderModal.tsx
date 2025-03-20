import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addGroup,
  AppDispatch,
  closeEditModal,
  fetchGroups,
  updateEditForm,
  updateOrder,
} from '../../store';
import { EditOrderModalProps } from '../../interfaces/editForm';
import { Order, OrderState } from '../../interfaces/order';
import Button from '../Button/Button';

// Тип для стану Redux
interface RootState {
  orders: OrderState;
  auth: { token: string | null };
}

const EditOrderModal = ({
  editingOrder,
  editForm,
  token,
}: EditOrderModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector((state: RootState) => state.orders.groups) || [];
  const loading = useSelector((state: RootState) => state.orders.loading);
  const error = useSelector((state: RootState) => state.orders.error);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    if (token && groups.length === 0) {
      dispatch(fetchGroups()); // Завантажуємо групи при відкритті модального вікна
    }
  }, [dispatch, token, groups.length]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const parsedValue = value === '' ? null : value;
    dispatch(updateEditForm({ [name]: parsedValue }));
  };

  const handleAddGroup = () => {
    if (!newGroupName) {
      alert('Please enter a group name');
      return;
    }
    if (groups.includes(newGroupName)) {
      alert('Group name must be unique');
      return;
    }
    dispatch(addGroup(newGroupName)).then(() => {
      dispatch(updateEditForm({ group: newGroupName }));
      setNewGroupName('');
    });
  };

  const handleSelectGroup = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGroup = e.target.value;
    dispatch(updateEditForm({ group: selectedGroup }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !token) return;

    const updates: Partial<Order> = {
      name: editForm.name,
      surname: editForm.surname,
      email: editForm.email,
      phone: editForm.phone,
      age:
        editForm.age === null
          ? null
          : editForm.age
            ? parseInt(editForm.age, 10)
            : null,
      course: editForm.course,
      course_format: editForm.course_format ?? editingOrder.course_format,
      course_type: editForm.course_type ?? editingOrder.course_type,
      status: editForm.status ?? editingOrder.status,
      sum:
        editForm.sum === null
          ? null
          : editForm.sum
            ? parseFloat(editForm.sum)
            : null,
      alreadyPaid:
        editForm.alreadyPaid === null
          ? null
          : editForm.alreadyPaid
            ? parseFloat(editForm.alreadyPaid)
            : null,
      group: editForm.group,
    };

    await dispatch(updateOrder({ id: editingOrder.id, updates }));
  };

  const modalStyles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '5px',
      width: '600px',
      display: 'flex',
      flexDirection: 'row' as const,
      gap: '20px',
    },
    column: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
    },
    input: {
      width: '100%',
      padding: '5px',
      marginBottom: '5px',
    },
    button: {
      marginLeft: '10px',
    },
    groupContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '5px',
    },
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <div style={modalStyles.column}>
          <h3>Edit Order</h3>
          <div style={modalStyles.groupContainer}>
            <label>Group:</label>
            <select
              name="group"
              value={editForm.group ?? ''}
              onChange={handleSelectGroup}
              style={modalStyles.input}
              disabled={loading}>
              <option value="">Select Group</option>
              {groups.map(group => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="New group name"
                style={modalStyles.input}
                disabled={loading}
              />
              <Button
                variant="primary"
                onClick={handleAddGroup}
                disabled={loading}>
                ADD
              </Button>
            </div>
            {error && <span style={{ color: 'red' }}>{error}</span>}
          </div>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={editForm.name ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Surname:</label>
            <input
              type="text"
              name="surname"
              value={editForm.surname ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={editForm.email ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={editForm.phone ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Age:</label>
            <input
              type="number"
              name="age"
              value={editForm.age ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
        </div>
        <div style={modalStyles.column}>
          <div>
            <label>Status:</label>
            <select
              name="status"
              value={editForm.status ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}>
              <option value="">Select Status</option>
              <option value="In work">In work</option>
              <option value="New">New</option>
              <option value="Aggre">Agree</option>
              <option value="Disaggre">Disaggre</option>
              <option value="Dubbing">Dubbing</option>
            </select>
          </div>
          <div>
            <label>Sum:</label>
            <input
              type="number"
              name="sum"
              value={editForm.sum ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Already Paid:</label>
            <input
              type="number"
              name="alreadyPaid"
              value={editForm.alreadyPaid ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Course:</label>
            <select
              name="course"
              value={editForm.course ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}>
              <option value="">Select Course</option>
              <option value="FS">FS</option>
              <option value="QACX">QACX</option>
              <option value="JCX">JCX</option>
              <option value="JSCX">JSCX</option>
              <option value="FE">FE</option>
              <option value="PCX">PCX</option>
            </select>
          </div>
          <div>
            <label>Course Format:</label>
            <select
              name="course_format"
              value={editForm.course_format ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}>
              <option value="">Select Format</option>
              <option value="static">Static</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label>Course Type:</label>
            <select
              name="course_type"
              value={editForm.course_type ?? ''}
              onChange={handleEditChange}
              style={modalStyles.input}>
              <option value="">Select Type</option>
              <option value="pro">Pro</option>
              <option value="minimal">Minimal</option>
              <option value="premium">Premium</option>
              <option value="incubator">Incubator</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <div style={{ marginTop: '10px' }}>
            <Button
              variant="primary"
              type="submit"
              onClick={handleEditSubmit}
              disabled={loading}>
              Submit
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={() => dispatch(closeEditModal())}
              style={modalStyles.button}
              disabled={loading}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { EditOrderModal };