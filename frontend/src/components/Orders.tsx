import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Order } from '../types/order';

interface OrdersResponse {
  orders: Order[];
  total: number;
  query: {
    page: number;
    limit: number;
    sort: string;
    order: 'ASC' | 'DESC';
  };
}

interface Group {
  id: string;
  name: string;
}

interface OrdersProps {
  token: string;
  role: 'admin' | 'manager';
  onLogout: () => void;
}


export interface OrderWithGroupId extends Order {
  groupId?: string;
}

const Orders: React.FC<OrdersProps> = ({ token, role, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editForm, setEditForm] = useState<Partial<OrderWithGroupId>>({});

  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const fetchOrders = async () => {
    try {
      const params: any = {
        page: 1,
        limit: 20,
        sort: sortBy,
        order,
      };
      if (search) {
        params.search = search;
      }
      const response = await axios.get<OrdersResponse>('http://localhost:3001/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });
      console.log('Response from backend:', response.data);
      setOrders(response.data.orders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get<Group[]>('http://localhost:3001/groups', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(response.data);
    } catch (err: any) {
      console.error('Error fetching groups:', err);
    }
  };

  const addGroup = async () => {
    if (!newGroupName) return;
    try {
      const response = await axios.post(
        'http://localhost:3001/groups',
        { name: newGroupName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroups((prev) => [...prev, response.data]);
      setNewGroupName('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add group');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchGroups();
  }, [token, sortBy, order, search]);

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
    setEditingOrder(order);
    setEditForm({
      ...order,
      groupId: order.groupEntity?.id || '',
    });
  };

  const closeEditModal = () => {
    setEditingOrder(null);
    setEditForm({});
    setError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const response = await axios.patch(
        `http://localhost:3001/orders/${editingOrder.id}/edit`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingOrder.id ? { ...order, ...response.data } : order
        )
      );
      closeEditModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Orders Page</h2>
      <p>Token: {token}</p>
      <p>Role: {role}</p>
      <button onClick={onLogout}>Logout</button>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, surname, or email"
          style={{ padding: '8px', width: '300px' }}
        />
      </div>

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
            <th style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
              Created At {sortBy === 'created_at' && (order === 'ASC' ? '↑' : '↓')}
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
          </thead>
          <tbody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.surname}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.phone}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.age}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.course}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.course_format}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.course_type}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.status}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.sum}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.alreadyPaid}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(order.created_at).toLocaleString()}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => toggleExpand(order.id)}>Details</button>
                  <button onClick={() => openEditModal(order)} style={{ marginLeft: '5px' }}>Edit</button>
                </td>
              </tr>
              {expandedOrderId === order.id && (
                <tr>
                  <td colSpan={14} style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>
                    <div>
                      <h4>Order Details</h4>
                      <p><strong>ID:</strong> {order.id}</p>
                      <p><strong>Name:</strong> {order.name}</p>
                      <p><strong>Surname:</strong> {order.surname}</p>
                      <p><strong>Email:</strong> {order.email}</p>
                      <p><strong>Phone:</strong> {order.phone}</p>
                      <p><strong>Age:</strong> {order.age}</p>
                      <p><strong>Course:</strong> {order.course}</p>
                      <p><strong>Course Format:</strong> {order.course_format}</p>
                      <p><strong>Course Type:</strong> {order.course_type}</p>
                      <p><strong>Status:</strong> {order.status}</p>
                      <p><strong>Sum:</strong> {order.sum}</p>
                      <p><strong>Already Paid:</strong> {order.alreadyPaid}</p>
                      <p><strong>Group:</strong> {order.groupEntity?.name || 'No group'}</p>
                      <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
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
                <select name="groupId" value={editForm.groupId || ''} onChange={handleEditChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }}>
                  <option value="">No Group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Add New Group:</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter new group name"
                  style={{ width: '70%', padding: '5px', marginRight: '10px' }}
                />
                <button type="button" onClick={addGroup}>Add</button>
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