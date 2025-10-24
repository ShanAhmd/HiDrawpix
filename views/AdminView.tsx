import React, { useState, useEffect, useMemo } from 'react';
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
    const statusTextStyles: { [key in OrderStatus]: string } = {
        Pending: 'text-amber',
        'In Progress': 'text-blue',
        Completed: 'text-accent',
        Cancelled: 'text-error',
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
        <div className="space-y-4">
            {orders.length > 0 ? (
                orders.map(order => (
                    <div key={order.id} className="glass-card p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                                <h4 className="font-bold text-lg text-text-primary">{order.service}</h4>
                                <p className="text-sm text-text-secondary">For: {order.customerName} ({order.email})</p>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                                    className={`p-2 rounded bg-black bg-opacity-30 text-xs border-none appearance-none ${statusTextStyles[order.status]}`}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <div className="flex gap-2 text-xs">
                                    <button
                                        onClick={() => handleOpenDeliveryModal(order)}
                                        className="font-medium text-accent hover:underline disabled:text-gray-500 disabled:cursor-not-allowed disabled:no-underline"
                                        disabled={order.status === 'Completed' || order.status === 'Cancelled'}
                                    >
                                        Deliver
                                    </button>
                                    <button
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="font-medium text-error hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white border-opacity-10 text-sm text-text-secondary space-y-2">
                            <p><strong className="text-text-primary">Date:</strong> {order.createdAt?.toDate().toLocaleDateString()}</p>
                            <p><strong className="text-text-primary">Description:</strong> {order.details}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                                {order.fileURL && (
                                    <a href={order.fileURL} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline text-xs flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                        View Attached File
                                    </a>
                                )}
                                {order.deliveryFileURL && (
                                    <a href={order.deliveryFileURL} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline text-xs flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                        View Delivered File
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="glass-card p-8 text-center text-text-secondary">
                    <p>No orders found.</p>
                </div>
            )}
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