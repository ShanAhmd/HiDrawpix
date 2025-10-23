import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { listenToOrders, updateOrderStatus, auth, signOut } from '../services/firebase';

const AdminView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToOrders((newOrders) => {
      setOrders(newOrders);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      setError('Failed to update order status. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  const statusOptions: OrderStatus[] = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  const statusStyles: { [key in OrderStatus]: string } = {
    Pending: 'bg-amber bg-opacity-20 text-amber',
    'In Progress': 'bg-blue bg-opacity-20 text-blue',
    Completed: 'bg-accent bg-opacity-20 text-accent',
    Cancelled: 'bg-error bg-opacity-20 text-error',
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
        <button
          onClick={handleSignOut}
          className="bg-error text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {error && <p className="text-center text-error mb-4">{error}</p>}

      <div className="glass-card p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Live Orders</h2>
        {loading ? (
          <p className="text-text-secondary text-center">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-text-secondary text-center">No orders found.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white border-opacity-20">
                <th className="p-3">Customer</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Email</th>
                <th className="p-3">Details</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                  <td className="p-3 align-top">{order.customerName}</td>
                  <td className="p-3 align-top">{order.contactNumber}</td>
                  <td className="p-3 align-top">{order.email}</td>
                  <td className="p-3 align-top max-w-xs whitespace-pre-wrap">{order.details}</td>
                  <td className="p-3 align-top">{order.createdAt.toDate().toLocaleString()}</td>
                  <td className="p-3 align-top">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`w-full p-2 rounded-md border-transparent focus:outline-none focus:ring-2 focus:ring-accent text-sm font-semibold ${statusStyles[order.status]}`}
                      style={{ backgroundColor: 'transparent' }}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status} className="bg-primary-bg text-text-primary">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminView;
