import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Order, OrderStatus, PortfolioItem, Offer } from '../types';
import { 
  listenToOrders, updateOrderStatus, auth, signOut, 
  listenToPortfolioItems, addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
  listenToOffers, addOffer, updateOffer, deleteOffer,
  uploadImage
} from '../services/firebase';
import AdminModal from '../components/AdminModal';

type AdminTab = 'orders' | 'portfolio' | 'offers';

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [notification, setNotification] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  // Portfolio State
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [isPortfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);

  // Offers State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [isOfferModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  
  const [error, setError] = useState('');

  // --- Effects for Data Fetching ---
  useEffect(() => {
    const unsubOrders = listenToOrders((newOrders) => {
      setOrders(currentOrders => {
         if (!isInitialLoad.current && newOrders.length > currentOrders.length) {
          const oldOrderIds = new Set(currentOrders.map(o => o.id));
          const addedOrder = newOrders.find(o => !oldOrderIds.has(o.id));
          if(addedOrder) {
              setNotification(`New order for ${addedOrder.service} from ${addedOrder.customerName}!`);
              setTimeout(() => setNotification(null), 5000);
          }
        }
        isInitialLoad.current = false;
        return newOrders;
      });
      setOrdersLoading(false);
    });

    const unsubPortfolio = listenToPortfolioItems(setPortfolioItems);
    setPortfolioLoading(false);

    const unsubOffers = listenToOffers(setOffers);
    setOffersLoading(false);

    return () => {
      unsubOrders();
      unsubPortfolio();
      unsubOffers();
    };
  }, []);

  // --- Handlers ---
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  const openPortfolioModal = (item: PortfolioItem | null = null) => {
    setEditingPortfolioItem(item);
    setPortfolioModalOpen(true);
  };

  const openOfferModal = (offer: Offer | null = null) => {
    setEditingOffer(offer);
    setOfferModalOpen(true);
  };
  
  // --- Memoized Displays ---
  const displayedOrders = useMemo(() => {
    const filtered = orders.filter(order => statusFilter === 'All' || order.status === statusFilter);
    return [...filtered].sort((a, b) => {
      const dateA = a.createdAt?.toMillis() || 0;
      const dateB = b.createdAt?.toMillis() || 0;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [orders, statusFilter, sortOrder]);


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
          <button onClick={handleSignOut} className="bg-error text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
            Sign Out
          </button>
        </div>

        {error && <p className="text-center text-error mb-4">{error}</p>}

        <div className="glass-card p-6">
          {/* TABS */}
          <div className="border-b border-white border-opacity-20 mb-6">
            <nav className="-mb-px flex space-x-6">
              {(['orders', 'portfolio', 'offers'] as AdminTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab 
                      ? 'border-accent text-accent' 
                      : 'border-transparent text-text-secondary hover:text-white hover:border-gray-300'}`
                  }
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* CONTENT */}
          <div className={activeTab === 'orders' ? 'block' : 'hidden'}>
            <OrdersManagement 
              orders={displayedOrders} 
              loading={ordersLoading}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          </div>
          <div className={activeTab === 'portfolio' ? 'block' : 'hidden'}>
            <PortfolioManagement
              items={portfolioItems}
              loading={portfolioLoading}
              onEdit={openPortfolioModal}
            />
          </div>
          <div className={activeTab === 'offers' ? 'block' : 'hidden'}>
            <OffersManagement
              offers={offers}
              loading={offersLoading}
              onEdit={openOfferModal}
            />
          </div>
        </div>
      </div>
      
      {/* MODALS */}
      <PortfolioModal 
        isOpen={isPortfolioModalOpen}
        onClose={() => setPortfolioModalOpen(false)}
        item={editingPortfolioItem}
      />
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setOfferModalOpen(false)}
        offer={editingOffer}
      />
    </>
  );
};

// Sub-components for each tab for better organization

const OrdersManagement = ({ orders, loading, statusFilter, setStatusFilter, sortOrder, setSortOrder }) => {
  const statusOptions: OrderStatus[] = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  const statusStyles: { [key in OrderStatus]: string } = {
    Pending: 'bg-amber bg-opacity-20 text-amber', 'In Progress': 'bg-blue bg-opacity-20 text-blue',
    Completed: 'bg-accent bg-opacity-20 text-accent', Cancelled: 'bg-error bg-opacity-20 text-error',
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try { await updateOrderStatus(orderId, newStatus); } catch (err) { console.error(err); }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none w-full sm:w-48 p-2 pr-8 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-accent text-white">
                <option value="All" className="bg-primary-bg">All Statuses</option>
                {statusOptions.map(s => <option key={s} value={s} className="bg-primary-bg">{s}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
        <button onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 hover:bg-opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent text-white flex items-center justify-center sm:justify-start">
            <span>Sort by Date ({sortOrder === 'desc' ? 'Newest' : 'Oldest'})</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`ml-2 transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? <div className="flex justify-center h-48 items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div></div> : orders.length === 0 ? <p className="text-text-secondary text-center py-12">No orders found.</p> : (
          <table className="w-full text-left min-w-[900px]">
            <thead><tr className="border-b border-white border-opacity-20"><th className="p-3">Customer</th><th className="p-3">Service</th><th className="p-3">Contact</th><th className="p-3">Details</th><th className="p-3">Date</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                  <td className="p-3 align-top"><p className="font-semibold">{o.customerName}</p><p className="text-sm text-text-secondary">{o.email}</p></td>
                  <td className="p-3 align-top">{o.service}</td>
                  <td className="p-3 align-top">{o.contactNumber}</td>
                  <td className="p-3 align-top max-w-xs whitespace-pre-wrap"><p>{o.details}</p>{o.fileURL && <a href={o.fileURL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-accent font-semibold hover:underline">View Attachment</a>}</td>
                  <td className="p-3 align-top">{o.createdAt?.toDate().toLocaleString() || 'N/A'}</td>
                  <td className="p-3 align-top">
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value as OrderStatus)} className={`w-full p-2 rounded-md border-transparent focus:outline-none focus:ring-2 focus:ring-accent text-sm font-semibold ${statusStyles[o.status]}`} style={{ backgroundColor: 'transparent' }}>
                      {statusOptions.map(s => <option key={s} value={s} className="bg-primary-bg text-text-primary">{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

const PortfolioManagement = ({ items, loading, onEdit }) => {
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      await deletePortfolioItem(id);
    }
  };
  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => onEdit(null)} className="bg-accent text-primary-bg py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">Add New Item</button>
      </div>
      <div className="overflow-x-auto">
        {loading ? <div className="flex justify-center h-48 items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div></div> : items.length === 0 ? <p className="text-text-secondary text-center py-12">No portfolio items found.</p> : (
          <table className="w-full text-left">
             <thead><tr className="border-b border-white border-opacity-20"><th className="p-3">Image</th><th className="p-3">Title</th><th className="p-3">Description</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
             <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                  <td className="p-3"><img src={item.imageURL} alt={item.title} className="w-24 h-16 object-cover rounded-md"/></td>
                  <td className="p-3 align-top">{item.title}</td>
                  <td className="p-3 align-top max-w-sm whitespace-pre-wrap">{item.description}</td>
                  <td className="p-3 align-top"><span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Show' ? 'bg-accent text-primary-bg' : 'bg-gray-500 text-white'}`}>{item.status}</span></td>
                  <td className="p-3 align-top">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(item)} className="text-blue hover:underline">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-error hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
             </tbody>
          </table>
        )}
      </div>
    </>
  );
};

const OffersManagement = ({ offers, loading, onEdit }) => {
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      await deleteOffer(id);
    }
  };
  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => onEdit(null)} className="bg-accent text-primary-bg py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">Add New Offer</button>
      </div>
      <div className="overflow-x-auto">
        {loading ? <div className="flex justify-center h-48 items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div></div> : offers.length === 0 ? <p className="text-text-secondary text-center py-12">No offers found.</p> : (
          <table className="w-full text-left">
             <thead><tr className="border-b border-white border-opacity-20"><th className="p-3">Title</th><th className="p-3">Price</th><th className="p-3">Description</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
             <tbody>
              {offers.map(offer => (
                <tr key={offer.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                  <td className="p-3 align-top">{offer.title}</td>
                  <td className="p-3 align-top">{offer.price}</td>
                  <td className="p-3 align-top max-w-sm whitespace-pre-wrap">{offer.description}</td>
                  <td className="p-3 align-top"><span className={`px-2 py-1 rounded-full text-xs ${offer.status === 'Active' ? 'bg-accent text-primary-bg' : 'bg-gray-500 text-white'}`}>{offer.status}</span></td>
                  <td className="p-3 align-top">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(offer)} className="text-blue hover:underline">Edit</button>
                      <button onClick={() => handleDelete(offer.id)} className="text-error hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
             </tbody>
          </table>
        )}
      </div>
    </>
  );
};

const PortfolioModal = ({ isOpen, onClose, item }) => {
    // FIX: Explicitly type formData state to ensure `status` is of type 'Show' | 'Hide'.
    const [formData, setFormData] = useState<{ title: string; description: string; status: 'Show' | 'Hide' }>({ title: '', description: '', status: 'Show' });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const inputStyles = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";
    
    useEffect(() => {
        if(item) {
            setFormData({ title: item.title, description: item.description, status: item.status });
        } else {
            setFormData({ title: '', description: '', status: 'Show' });
        }
        setFile(null);
    }, [item, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageURL = item?.imageURL;
            if (file) {
                imageURL = await uploadImage(file, 'portfolio-images');
            }
            if (!imageURL) {
                alert("Please upload an image for new items.");
                setLoading(false);
                return;
            }

            const payload = { ...formData, imageURL };
            if (item) {
                await updatePortfolioItem(item.id, payload);
            } else {
                await addPortfolioItem(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminModal title={item ? 'Edit Portfolio Item' : 'Add Portfolio Item'} isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} required className={inputStyles} />
                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} required rows={3} className={inputStyles} />
                <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className={`${inputStyles} p-2`} accept="image/*" />
                <select value={formData.status} onChange={e => setFormData(p => ({...p, status: e.target.value as 'Show' | 'Hide'}))} className={`${inputStyles} appearance-none`}>
                    <option value="Show" className="bg-primary-bg">Show</option>
                    <option value="Hide" className="bg-primary-bg">Hide</option>
                </select>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700">Cancel</button>
                    <button type="submit" disabled={loading} className="py-2 px-4 rounded-lg bg-accent text-primary-bg hover:bg-opacity-90 disabled:bg-gray-500">{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </AdminModal>
    );
};

const OfferModal = ({ isOpen, onClose, offer }) => {
    // FIX: Explicitly type formData state to ensure `status` is of type 'Active' | 'Inactive'.
    const [formData, setFormData] = useState<{ title: string; description: string; price: string; status: 'Active' | 'Inactive' }>({ title: '', description: '', price: '', status: 'Active' });
    const [loading, setLoading] = useState(false);
    const inputStyles = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";
    
    useEffect(() => {
        if(offer) {
            setFormData({ title: offer.title, description: offer.description, price: offer.price, status: offer.status });
        } else {
            setFormData({ title: '', description: '', price: '', status: 'Active' });
        }
    }, [offer, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (offer) {
                await updateOffer(offer.id, formData);
            } else {
                await addOffer(formData);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
     return (
        <AdminModal title={offer ? 'Edit Offer' : 'Add Offer'} isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} required className={inputStyles} />
                <input type="text" placeholder="Price (e.g., $199)" value={formData.price} onChange={e => setFormData(p => ({...p, price: e.target.value}))} required className={inputStyles} />
                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} required rows={3} className={inputStyles} />
                <select value={formData.status} onChange={e => setFormData(p => ({...p, status: e.target.value as 'Active' | 'Inactive'}))} className={`${inputStyles} appearance-none`}>
                    <option value="Active" className="bg-primary-bg">Active</option>
                    <option value="Inactive" className="bg-primary-bg">Inactive</option>
                </select>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700">Cancel</button>
                    <button type="submit" disabled={loading} className="py-2 px-4 rounded-lg bg-accent text-primary-bg hover:bg-opacity-90 disabled:bg-gray-500">{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </AdminModal>
    );
};

export default AdminView;