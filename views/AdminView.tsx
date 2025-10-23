import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth, signInWithEmailAndPassword, signOut } from '../services/firebase';
import { listenToOrders, updateOrderStatus } from '../services/firebase';
import { Order, OrderStatus } from '../types';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputStyles = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 glass-card">
        <h2 className="text-2xl font-bold text-center text-text-primary">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className={inputStyles} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className={inputStyles} />
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-accent text-primary-bg py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all glowing-btn disabled:bg-gray-500 disabled:shadow-none">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = listenToOrders((newOrders) => {
            setOrders(newOrders);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status. Please try again.");
        }
    };
    
    const statusStyles: { [key in OrderStatus]: string } = {
        Pending: 'bg-amber text-black',
        'In Progress': 'bg-blue text-white',
        Completed: 'bg-accent text-primary-bg',
        Cancelled: 'bg-error text-white',
    };
    const statusOptions: OrderStatus[] = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-text-primary">Order Dashboard</h1>
                    <button onClick={() => signOut(auth)} className="bg-error text-white py-2 px-4 rounded-md hover:bg-opacity-90">
                        Logout
                    </button>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <p className="p-6 text-center text-text-secondary">Loading orders...</p>
                        ) : orders.length === 0 ? (
                            <p className="p-6 text-center text-text-secondary">No orders found.</p>
                        ) : (
                            <table className="w-full min-w-max table-auto">
                                <thead className="bg-black bg-opacity-20">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b border-white border-opacity-10">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-text-primary">{order.customerName}</div>
                                                <div className="text-sm text-text-secondary">{order.email}</div>
                                                <div className="text-sm text-text-secondary">{order.contactNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-secondary max-w-sm break-words">{order.details}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select 
                                                    value={order.status} 
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                    className={`p-2 rounded-md text-sm border-none outline-none appearance-none ${statusStyles[order.status]}`}
                                                >
                                                    {statusOptions.map(status => (
                                                        <option key={status} value={status} className="bg-primary-bg text-white">{status}</option>
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
            </div>
        </div>
    );
};


const AdminView: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
    </div>;
  }

  return user ? <AdminDashboard /> : <AdminLogin />;
};

export default AdminView;
