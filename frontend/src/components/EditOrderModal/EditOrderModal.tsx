import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  AppDispatch,
  closeEditModal,
  updateEditForm,
  updateOrder,
} from '../../store';
import { EditOrderModalProps } from '../../interfaces/editForm';

const EditOrderModal: FC<EditOrderModalProps> = ({
  editingOrder,
  editForm,
  token,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    dispatch(updateEditForm({ [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !token) return;
    await dispatch(updateOrder(editingOrder.id));
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
      width: '400px',
    },
    input: {
      width: '100%',
      padding: '5px',
      marginBottom: '10px',
    },
    button: {
      marginLeft: '10px',
    },
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <h3>Edit Order</h3>
        <form onSubmit={handleEditSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={editForm.name || ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Surname:</label>
            <input
              type="text"
              name="surname"
              value={editForm.surname || ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={editForm.email || ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={editForm.phone || ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Age:</label>
            <input
              type="number"
              name="age"
              value={editForm.age || ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Course:</label>
            <select
              name="course"
              value={editForm.course || ''}
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
              value={editForm.course_format || ''}
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
              value={editForm.course_type || ''}
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
          <div>
            <label>Status:</label>
            <select
              name="status"
              value={editForm.status || ''}
              onChange={handleEditChange}
              style={modalStyles.input}>
              <option value="">Select Status</option>
              <option value="In work">In work</option>
              <option value="New">New</option>
              <option value="Aggre">Aggre</option>
              <option value="Disaggre">Disaggre</option>
              <option value="Dubbing">Dubbing</option>
            </select>
          </div>
          <div>
            <label>Sum:</label>
            <input
              type="number"
              name="sum"
              value={editForm.sum || ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Already Paid:</label>
            <input
              type="number"
              name="alreadyPaid"
              value={editForm.alreadyPaid || ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div>
            <label>Group:</label>
            <input
              type="text"
              name="group"
              value={editForm.group || ''}
              onChange={handleEditChange}
              style={modalStyles.input}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <button type="submit">Submit</button>
            <button
              type="button"
              onClick={() => dispatch(closeEditModal())}
              style={modalStyles.button}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;