import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Order } from '../types/order';

interface OrdersResponse {
  orders: Order[];
  total: number;
  query: { page: number; limit: number; sort: string; order: 'ASC' | 'DESC' };
}

interface OrdersProps {
  token: string;
  role: 'admin' | 'manager';
  onLogout: () => void;
  currentUserId: string;
}

const Orders: React.FC<OrdersProps> = ({ token, role, onLogout, currentUserId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<Partial<Order>>({});
  const [commentText, setCommentText] = useState<string>('');

  const fetchOrders = async () => {
    try {
      const params: any = {
        page: 1,
        limit: 20,
        sort: sortBy,
        order,
        manager_id: role === 'manager' ? currentUserId : undefined,
      };
      const response = await axios.get<OrdersResponse>(
        'http://localhost:3001/orders',
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );
      console.log('Response from backend:', response.data);
      setOrders(response.data.orders);
    } catch (err: any) {
      console.error('Error fetching orders:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, sortBy, order]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('ASC');
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const openEditModal = (order: Order) => {
    const canEdit = !order.manager || order.manager.id === currentUserId;
    if (!canEdit) {
      setError('You can only edit orders without a manager or assigned to you');
      return;
    }
    setEditingOrder(order);
    setEditForm({ ...order });
  };

  const closeEditModal = () => {
    setEditingOrder(null);
    setEditForm({});
    setError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const allowedFields: Partial<Order> = {
      name: editForm.name,
      surname: editForm.surname,
      email: editForm.email,
      phone: editForm.phone,
      age: editForm.age,
      course: editForm.course,
      course_format: editForm.course_format,
      course_type: editForm.course_type,
      status: editForm.status,
      sum: editForm.sum,
      alreadyPaid: editForm.alreadyPaid,
      group: editForm.group,
      manager_id: editForm.manager?.id || null, // Змінено на manager_id
    };

    try {
      const response = await axios.patch(
        `http://localhost:3001/orders/${editingOrder.id}/edit`,
        allowedFields,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders(prev =>
        prev.map(order =>
          order.id === editingOrder.id ? { ...order, ...response.data } : order,
        ),
      );
      closeEditModal();
    } catch (err: any) {
      console.error('Edit error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update order');
    }
  };

  const handleCommentSubmit = async (orderId: string) => {
    if (!commentText) return;

    try {
      const response = await axios.post(
        `http://localhost:3001/orders/${orderId}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log('Comment response:', response.data);
      const newComment = response.data.comment || response.data;
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, comments: [...(order.comments || []), newComment] }
            : order,
        ),
      );
      setCommentText('');
    } catch (err: any) {
      console.error('Comment error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Orders Page</h2>
      <p>Token: {token}</p>
      <p>Role: {role}</p>
      <button onClick={onLogout}>Logout</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {orders.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('id')}>
              ID {sortBy === 'id' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
              Name {sortBy === 'name' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('surname')}>
              Surname {sortBy === 'surname' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('email')}>
              Email {sortBy === 'email' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('phone')}>
              Phone {sortBy === 'phone' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('age')}>
              Age {sortBy === 'age' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('course')}>
              Course {sortBy === 'course' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('course_format')}>
              Course Format {sortBy === 'course_format' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('course_type')}>
              Course Type {sortBy === 'course_type' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('status')}>
              Status {sortBy === 'status' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('sum')}>
              Sum {sortBy === 'sum' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('alreadyPaid')}>
              Already Paid {sortBy === 'alreadyPaid' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('group')}>
              Group {sortBy === 'group' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
              Created At {sortBy === 'created_at' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
          </thead>
          <tbody>
          {orders.map(order => (
            <React.Fragment key={order.id}>
              <tr onClick={() => toggleExpand(order.id)} style={{ cursor: 'pointer' }}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.name || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.surname || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.email || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.phone || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.age || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.course || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.course_format}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.course_type}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.status}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.sum || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.alreadyPaid || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.group || 'No group'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openEditModal(order);
                    }}>
                    Edit
                  </button>
                </td>
              </tr>
              {expandedOrderId === order.id && (
                <tr>
                  <td colSpan={15} style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>
                    <div>
                      <h4>Order Details</h4>
                      <p><strong>ID:</strong> {order.id}</p>
                      <p><strong>Name:</strong> {order.name || 'N/A'}</p>
                      <p><strong>Surname:</strong> {order.surname || 'N/A'}</p>
                      <p><strong>Email:</strong> {order.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {order.phone || 'N/A'}</p>
                      <p><strong>Age:</strong> {order.age || 'N/A'}</p>
                      <p><strong>Course:</strong> {order.course || 'N/A'}</p>
                      <p><strong>Course Format:</strong> {order.course_format}</p>
                      <p><strong>Course Type:</strong> {order.course_type}</p>
                      <p><strong>Status:</strong> {order.status}</p>
                      <p><strong>Sum:</strong> {order.sum || 'N/A'}</p>
                      <p><strong>Already Paid:</strong> {order.alreadyPaid || 'N/A'}</p>
                      <p><strong>Group (Text):</strong> {order.group || 'No group'}</p>
                      <p><strong>Group Entity:</strong> {order.groupEntity?.name || 'No group entity'}</p>
                      <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
                      <p><strong>Manager:</strong> {order.manager ? `${order.manager.name} ${order.manager.surname}` : 'None'}</p>
                      <p><strong>Comments:</strong></p>
                      {order.comments && order.comments.length > 0 ? (
                        order.comments.map((comment, index) => (
                          <div key={index}>
                            <p>
                              <strong>Message:</strong> {comment.text || 'N/A'}<br />
                              <strong>UTM:</strong> {comment.utm || 'N/A'}<br />
                              <strong>Author:</strong> {comment.author || 'Unknown'}<br />
                              <strong>Created At:</strong> {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p>No comments yet.</p>
                      )}
                      {(!order.manager || order.manager.id === currentUserId) && (
                        <div>
                          <input
                            type="text"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Add a comment"
                            style={{ width: '70%', padding: '5px', marginRight: '10px' }}
                          />
                          <button onClick={() => handleCommentSubmit(order.id)}>Submit Comment</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          </tbody>
        </table>
      ) : (
        <p>No orders found.</p>
      )}

      {editingOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '400px' }}>
            <h3>Edit Order</h3>
            <form onSubmit={handleEditSubmit}>
              <div>
                <label>Name:</label>
                <input type="text" name="name" value={editForm.name || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Surname:</label>
                <input type="text" name="surname" value={editForm.surname || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Email:</label>
                <input type="email" name="email" value={editForm.email || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Phone:</label>
                <input type="text" name="phone" value={editForm.phone || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Age:</label>
                <input type="number" name="age" value={editForm.age || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Course:</label>
                <select name="course" value={editForm.course || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }}>
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
                <select name="course_format" value={editForm.course_format || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }}>
                  <option value="">Select Format</option>
                  <option value="static">Static</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label>Course Type:</label>
                <select name="course_type" value={editForm.course_type || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }}>
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
                <select name="status" value={editForm.status || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }}>
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
                <input type="number" name="sum" value={editForm.sum || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Already Paid:</label>
                <input type="number" name="alreadyPaid" value={editForm.alreadyPaid || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Group:</label>
                <input type="text" name="group" value={editForm.group || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              </div>
              <div style={{ marginTop: '10px' }}>
                <button type="submit">Submit</button>
                <button type="button" onClick={closeEditModal} style={{ marginLeft: '10px' }}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;