import React, { useState, useEffect } from 'react';
import {
  auth,
  signOut,
  listenToOrders,
  updateOrderStatus,
  deleteOrder,
  listenToPortfolioItems,
  addPortfolioItem,
  deletePortfolioItem,
  updatePortfolioItemStatus,
  listenToOffers,
  addOffer,
  deleteOffer,
  updateOfferStatus,
  uploadImage
} from '../services/firebase';
import { Order, PortfolioItem, Offer, OrderStatus } from '../types';
import DeliveryModal from '../components/DeliveryModal';
import AdminModal from '../components/AdminModal';

const AdminView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'orders' | 'portfolio' | 'offers'>('orders');
    
    // Data states
    const [orders, setOrders] = useState<Order[]>([]);
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Form states
    const [portfolioForm, setPortfolioForm] = useState<Omit<PortfolioItem, 'id' | 'imageURL'>>({ title: '', description: '', status: 'Show' });
    const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
    const [offerForm, setOfferForm] = useState<Omit<Offer, 'id'>>({ title: '', description: '', price: '', status: 'Active' });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    
    useEffect(() => {
        setLoading(true);
        const unsubOrders = listenToOrders(setOrders);
        const unsubPortfolio = listenToPortfolioItems(setPortfolioItems);
        const unsubOffers = listenToOffers(setOffers);
        setLoading(false);

        return () => {
            unsubOrders();
            unsubPortfolio();
            unsubOffers();
        };
    }, []);

    const handleLogout = () => {
        signOut(auth);
    };

    const handleOpenDeliveryModal = (order: Order) => {
        setSelectedOrder(order);
        setIsDeliveryModalOpen(true);
    };

    const resetPortfolioForm = () => {
        setPortfolioForm({ title: '', description: '', status: 'Show' });
        setPortfolioFile(null);
        setFormError('');
    }

    const resetOfferForm = () => {
        setOfferForm({ title: '', description: '', price: '', status: 'Active' });
        setFormError('');
    }
    
    const handleDeleteOrder = async (orderId: string) => {
        if (window.confirm('Are you sure you want to delete this order? This action is irreversible.')) {
            try {
                await deleteOrder(orderId);
            } catch (e) {
                alert('Failed to delete order.');
                console.error(e);
            }
        }
    };

    const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, status);
        } catch (e) {
            alert('Failed to update status.');
            console.error(e);
        }
    };
    
    const handlePortfolioSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!portfolioForm.title || !portfolioFile) {
            setFormError('Title and image are required.');
            return;
        }
        setFormLoading(true);
        setFormError('');
        try {
            const imageURL = await uploadImage(portfolioFile, 'portfolio-images');
            await addPortfolioItem({ ...portfolioForm, imageURL });
            setIsPortfolioModalOpen(false);
            resetPortfolioForm();
        } catch (err) {
            setFormError('Failed to add portfolio item.');
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeletePortfolioItem = async (item: PortfolioItem) => {
        if (window.confirm('Are you sure you want to delete this portfolio item?')) {
            try {
                await deletePortfolioItem(item);
            } catch (err) {
                alert('Failed to delete portfolio item.');
                console.error(err);
            }
        }
    };

    const handleOfferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!offerForm.title || !offerForm.price) {
            setFormError('Title and price are required.');
            return;
        }
        setFormLoading(true);
        setFormError('');
        try {
            await addOffer(offerForm);
            setIsOfferModalOpen(false);
            resetOfferForm();
        } catch (err) {
            setFormError('Failed to add offer.');
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteOffer = async (offerId: string) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            try {
                await deleteOffer(offerId);
            } catch (err) {
                alert('Failed to delete offer.');
                console.error(err);
            }
        }
    };
    
    const inputStyles = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";
    const statusStyles: { [key in OrderStatus]: string } = {
        Pending: 'bg-amber text-amber',
        'In Progress': 'bg-blue text-blue',
        Completed: 'bg-accent text-accent',
        Cancelled: 'bg-error text-error',
    };
    const tabButton = (key: 'orders' | 'portfolio' | 'offers', label: string) => (
        <button
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${activeTab === key ? 'bg-accent text-primary-bg shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
        >
            {label}
        </button>
    );

    const renderOrders = () => (
      <div className="overflow-x-auto glass-card p-4">
        <table className="w-full text-sm text-left text-text-secondary">
          <thead className="text-xs text-text-primary uppercase bg-black bg-opacity-20">
            <tr>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Service</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-white border-opacity-10 hover:bg-black hover:bg-opacity-10">
                <td className="px-6 py-4">{order.customerName}<br/><span className="text-xs">{order.contactNumber} | {order.email}</span></td>
                <td className="px-6 py-4">{order.service}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                    className={`p-1 rounded bg-black bg-opacity-20 text-xs border-none ${statusStyles[order.status]}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-xs">{order.createdAt?.toDate().toLocaleDateString()}</td>
                <td className="px-6 py-4 space-x-2 text-xs">
                  <button onClick={() => handleOpenDeliveryModal(order)} className="font-medium text-accent hover:underline disabled:text-gray-500" disabled={order.status === 'Completed' || order.status === 'Cancelled'}>Deliver</button>
                  <button onClick={() => handleDeleteOrder(order.id)} className="font-medium text-error hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    
    const renderPortfolio = () => (
        <div className="glass-card p-4">
            <div className="flex justify-end mb-4">
                <button onClick={() => { resetPortfolioForm(); setIsPortfolioModalOpen(true); }} className="bg-accent text-primary-bg py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90">Add New Item</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolioItems.map(item => (
                    <div key={item.id} className="bg-black bg-opacity-20 rounded-lg p-2 relative">
                        <img src={item.imageURL} alt={item.title} className="w-full h-40 object-cover rounded"/>
                        <div className="p-2">
                            <h4 className="font-bold text-text-primary">{item.title}</h4>
                            <p className="text-xs text-text-secondary mb-2">{item.description}</p>
                            <div className="flex justify-between items-center">
                                <select value={item.status} onChange={(e) => updatePortfolioItemStatus(item.id, e.target.value as 'Show' | 'Hide')} className="bg-black bg-opacity-20 text-xs p-1 rounded border-none">
                                    <option value="Show">Show</option>
                                    <option value="Hide">Hide</option>
                                </select>
                                <button onClick={() => handleDeletePortfolioItem(item)} className="text-error hover:underline text-xs">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderOffers = () => (
         <div className="glass-card p-4">
            <div className="flex justify-end mb-4">
                <button onClick={() => { resetOfferForm(); setIsOfferModalOpen(true); }} className="bg-accent text-primary-bg py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90">Add New Offer</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.map(offer => (
                    <div key={offer.id} className="bg-black bg-opacity-20 rounded-lg p-4">
                         <h4 className="font-bold text-accent">{offer.title}</h4>
                         <p className="text-lg font-bold">{offer.price}</p>
                         <p className="text-sm text-text-secondary my-2 flex-grow">{offer.description}</p>
                         <div className="flex justify-between items-center mt-4">
                            <select value={offer.status} onChange={(e) => updateOfferStatus(offer.id, e.target.value as 'Active' | 'Inactive')} className="bg-black bg-opacity-20 text-xs p-1 rounded border-none">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <button onClick={() => handleDeleteOffer(offer.id)} className="text-error hover:underline text-xs">Delete</button>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div></div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-112px)]">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-text-primary">Admin Dashboard</h2>
                <button onClick={handleLogout} className="bg-error text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90">Sign Out</button>
            </div>
            
            <div className="mb-8 p-1 rounded-full bg-black bg-opacity-20 flex items-center space-x-1 max-w-sm">
                {tabButton('orders', 'Orders')}
                {tabButton('portfolio', 'Portfolio')}
                {tabButton('offers', 'Offers')}
            </div>

            <div>
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'portfolio' && renderPortfolio()}
                {activeTab === 'offers' && renderOffers()}
            </div>
            
            {isDeliveryModalOpen && selectedOrder && (
                <DeliveryModal isOpen={isDeliveryModalOpen} onClose={() => setIsDeliveryModalOpen(false)} order={selectedOrder} />
            )}

            <AdminModal isOpen={isPortfolioModalOpen} onClose={() => setIsPortfolioModalOpen(false)} title="Add Portfolio Item">
                <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                    <input type="text" placeholder="Title" value={portfolioForm.title} onChange={e => setPortfolioForm(p => ({...p, title: e.target.value}))} className={inputStyles} required />
                    <textarea placeholder="Description" value={portfolioForm.description} onChange={e => setPortfolioForm(p => ({...p, description: e.target.value}))} className={inputStyles} rows={3}></textarea>
                    <input type="file" onChange={e => setPortfolioFile(e.target.files ? e.target.files[0] : null)} className={`${inputStyles} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-primary-bg hover:file:bg-opacity-90`} required />
                    <select value={portfolioForm.status} onChange={e => setPortfolioForm(p => ({...p, status: e.target.value as 'Show' | 'Hide'}))} className={inputStyles}>
                        <option value="Show">Show</option>
                        <option value="Hide">Hide</option>
                    </select>
                    {formError && <p className="text-sm text-error text-center">{formError}</p>}
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={() => setIsPortfolioModalOpen(false)} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700">Cancel</button>
                        <button type="submit" disabled={formLoading} className="py-2 px-4 rounded-lg bg-accent text-primary-bg hover:bg-opacity-90 disabled:bg-gray-500">{formLoading ? 'Saving...' : 'Save Item'}</button>
                    </div>
                </form>
            </AdminModal>

            <AdminModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} title="Add Special Offer">
                <form onSubmit={handleOfferSubmit} className="space-y-4">
                    <input type="text" placeholder="Offer Title" value={offerForm.title} onChange={e => setOfferForm(p => ({...p, title: e.target.value}))} className={inputStyles} required />
                    <input type="text" placeholder="Price (e.g., $49 or 10% Off)" value={offerForm.price} onChange={e => setOfferForm(p => ({...p, price: e.target.value}))} className={inputStyles} required />
                    <textarea placeholder="Description" value={offerForm.description} onChange={e => setOfferForm(p => ({...p, description: e.target.value}))} className={inputStyles} rows={3}></textarea>
                    <select value={offerForm.status} onChange={e => setOfferForm(p => ({...p, status: e.target.value as 'Active' | 'Inactive'}))} className={inputStyles}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    {formError && <p className="text-sm text-error text-center">{formError}</p>}
                     <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={() => setIsOfferModalOpen(false)} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700">Cancel</button>
                        <button type="submit" disabled={formLoading} className="py-2 px-4 rounded-lg bg-accent text-primary-bg hover:bg-opacity-90 disabled:bg-gray-500">{formLoading ? 'Saving...' : 'Save Offer'}</button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default AdminView;
