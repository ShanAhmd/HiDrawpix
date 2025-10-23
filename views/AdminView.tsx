
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Order, OrderStatus } from '../types';
import { listenToOrders, updateOrderStatus, auth, signOut } from '../services/firebase';

const AdminView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [notification, setNotification] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToOrders((newOrders) => {
      setOrders(currentOrders => {
        if (!isInitialLoad.current && newOrders.length > currentOrders.length) {
          const oldOrderIds = new Set(currentOrders.map(o => o.id));
          const addedOrders = newOrders.filter(o => !oldOrderIds.has(o.id));

          if(addedOrders.length > 0) {
              const newOrder = addedOrders[0];
              setNotification(`New order for ${newOrder.service} from ${newOrder.customerName}!`);
              setTimeout(() => {
                  setNotification(null);
              }, 5000);
          }
        }
        
        isInitialLoad.current = false;
        return newOrders;
      });
      setLoading(false);
    });

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

  const displayedOrders = useMemo(() => {
    const filtered = orders.filter(order => 
      statusFilter === 'All' || order.status === statusFilter
    );
    
    return [...filtered].sort((a, b) => {
      const dateA = a.createdAt?.toMillis() || 0;
      const dateB = b.createdAt?.toMillis() || 0;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [orders, statusFilter, sortOrder]);


  const statusOptions: OrderStatus[] = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  const statusStyles: { [key in OrderStatus]: string } = {
    Pending: 'bg-amber bg-opacity-20 text-amber',
    'In Progress': 'bg-blue bg-opacity-20 text-blue',
    Completed: 'bg-accent bg-opacity-20 text-accent',
    Cancelled: 'bg-error bg-opacity-20 text-error',
  };

  return (
    <>
      {notification && (
        <div className="fixed top-24 right-8 z-50 glass-card bg-accent text-primary-bg p-4 shadow-lg animate-fade-in-down w-full max-w-sm">
             <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mr-3"><path d="M6 22h12a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M12 18v-6"></path><path d="m15 15-3 3-3-3"></path></svg>
                <div>
                    <h4 className="font-bold">New Order Received!</h4>
                    <p className="text-sm">{notification}</p>
                </div>
             </div>
        </div>
      )}
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

        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative">
                  <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
                      className="appearance-none w-full sm:w-48 p-2 pr-8 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-accent text-white"
                  >
                      <option value="All" className="bg-primary-bg">All Statuses</option>
                      {statusOptions.map(status => (
                          <option key={status} value={status} className="bg-primary-bg">{status}</option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>

              <button
                  onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="p-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 hover:bg-opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent text-white flex items-center justify-center sm:justify-start"
              >
                  <span>Sort by Date ({sortOrder === 'desc' ? 'Newest' : 'Oldest'})</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`ml-2 transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                </div>
            ) : displayedOrders.length === 0 ? (
              <p className="text-text-secondary text-center py-12">
                {statusFilter === 'All' ? 'No orders found.' : `No orders match the filter "${statusFilter}".`}
              </p>
            ) : (
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="border-b border-white border-opacity-20">
                    <th className="p-3">Customer</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                      <td className="p-3 align-top">
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-sm text-text-secondary">{order.email}</p>
                      </td>
                      <td className="p-3 align-top">{order.service}</td>
                      <td className="p-3 align-top">{order.contactNumber}</td>
                      <td className="p-3 align-top max-w-xs whitespace-pre-wrap">
                        <p>{order.details}</p>
                        {order.fileURL && (
                          <a 
                            href={order.fileURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-accent font-semibold hover:underline"
                          >
                            View Attachment
                          </a>
                        )}
                      </td>
                      <td className="p-3 align-top">{order.createdAt?.toDate().toLocaleString() || 'N/A'}</td>
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
      </div>
    </>
  );
};

export default AdminView;
