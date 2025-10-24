import React, { useState, useEffect } from 'react';
import {
  auth,
  signOut,
  listenToOrders,
  listenToPortfolioItems,
  listenToOffers,
  updateOrderStatus,
  deleteOrder,
  addPortfolioItem,
  deletePortfolioItem,
  updatePortfolioItemStatus,
  addOffer,
  deleteOffer,
  updateOfferStatus,
  uploadImage
} from '../services/firebase';
import { Order, PortfolioItem, Offer, OrderStatus } from '../types';
import DeliveryModal from '../components/DeliveryModal';
import AdminModal from '../components/AdminModal';

type Tab = 'orders' | 'portfolio' | 'offers';

const AdminView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        setLoading(true);
        const unsubOrders = listenToOrders(setOrders);
        const unsubPortfolio = listenToPortfolioItems(setPortfolioItems);
        const unsubOffers = listenToOffers(setOffers);
        
        // This is a rough way to know when initial data is loaded.
        // A more robust solution might involve checking each collection's first load.
        setTimeout(() => setLoading(false), 1500);

        return () => {
            unsubOrders();
            unsubPortfolio();
            unsubOffers();
        };
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    const openDeliveryModal = (order: Order) => {
        setSelectedOrder(order);
        setIsDeliveryModalOpen(true);
    };

    // Render functions for tabs
    const renderOrders = () => (
        <div className="space-y-4">
            {orders.map(order => (
                <div key={order.id} className="glass-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <p className="font-bold text-lg">{order.service} 
                        {order.price && <span className="text-accent font-semibold ml-2">{order.price}</span>}
                        <span className="text-sm font-normal text-text-secondary"> for {order.customerName}</span></p>
                        <p className="text-sm text-accent break-all">{order.id}</p>
                        <p className="text-sm">{order.email} | {order.contactNumber}</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                         <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-black bg-opacity-20 p-2 rounded-md flex-grow md:flex-grow-0"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <button onClick={() => openDeliveryModal(order)} className="bg-accent text-primary-bg px-3 py-2 rounded-md text-sm font-semibold disabled:bg-gray-600" disabled={order.status === 'Completed'}>Deliver</button>
                        <button onClick={() => window.confirm('Are you sure you want to delete this order?') && deleteOrder(order.id)} className="bg-error text-white px-3 py-2 rounded-md text-sm font-semibold">&times;</button>
                    </div>
                </div>
            ))}
        </div>
    );

    const PortfolioForm = ({onClose}: {onClose: () => void}) => {
        const [title, setTitle] = useState('');
        const [description, setDescription] = useState('');
        const [file, setFile] = useState<File | null>(null);
        const [loading, setLoading] = useState(false);
        const inputStyles = "w-full p-2 bg-white bg-opacity-10 border border-transparent rounded focus:outline-none focus:ring-2 focus:ring-accent";


        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!file) return;
            setLoading(true);
            try {
                const imageURL = await uploadImage(file, 'portfolio-images');
                await addPortfolioItem({ title, description, imageURL, status: 'Show' });
                onClose();
            } catch (error) {
                console.error("Error adding portfolio item", error);
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className={inputStyles}/>
                <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className={inputStyles}/>
                <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} required accept="image/*" className={`${inputStyles} p-2 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-primary-bg hover:file:bg-opacity-90`}/>
                <button type="submit" disabled={loading} className="w-full bg-accent text-primary-bg py-2 rounded disabled:bg-gray-500">{loading ? 'Uploading...' : 'Add Item'}</button>
            </form>
        );
    };

    const renderPortfolio = () => (
        <div>
            <button onClick={() => setIsPortfolioModalOpen(true)} className="bg-accent text-primary-bg px-4 py-2 rounded-md mb-4 font-semibold">Add New Item</button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolioItems.map(item => (
                    <div key={item.id} className="glass-card p-2 relative">
                        <img src={item.imageURL} alt={item.title} className="w-full h-48 object-cover rounded"/>
                        <div className="p-2">
                            <h4 className="font-bold">{item.title}</h4>
                            <p className="text-sm text-text-secondary truncate">{item.description}</p>
                            <div className="flex justify-between items-center mt-2">
                                <button onClick={() => updatePortfolioItemStatus(item.id, item.status === 'Show' ? 'Hide' : 'Show')} className={`px-2 py-1 text-xs rounded font-semibold ${item.status === 'Show' ? 'bg-accent text-primary-bg' : 'bg-gray-500 text-white'}`}>{item.status}</button>
                                <button onClick={() => window.confirm('Are you sure you want to delete this item?') && deletePortfolioItem(item)} className="bg-error text-white px-2 py-1 rounded text-xs font-semibold">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <AdminModal isOpen={isPortfolioModalOpen} onClose={() => setIsPortfolioModalOpen(false)} title="Add Portfolio Item">
                <PortfolioForm onClose={() => setIsPortfolioModalOpen(false)} />
            </AdminModal>
        </div>
    );
    
    const OfferForm = ({onClose}: {onClose: () => void}) => {
        const [title, setTitle] = useState('');
        const [description, setDescription] = useState('');
        const [price, setPrice] = useState('');
        const [loading, setLoading] = useState(false);
        const inputStyles = "w-full p-2 bg-white bg-opacity-10 border border-transparent rounded focus:outline-none focus:ring-2 focus:ring-accent";

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            try {
                await addOffer({ title, description, price, status: 'Active' });
                onClose();
            } catch (error) {
                console.error("Error adding offer", error);
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className={inputStyles}/>
                <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className={inputStyles}/>
                <input type="text" placeholder="Price (e.g., $49 or 20% Off)" value={price} onChange={e => setPrice(e.target.value)} required className={inputStyles}/>
                <button type="submit" disabled={loading} className="w-full bg-accent text-primary-bg py-2 rounded disabled:bg-gray-500">{loading ? 'Adding...' : 'Add Offer'}</button>
            </form>
        );
    };

    const renderOffers = () => (
         <div>
            <button onClick={() => setIsOfferModalOpen(true)} className="bg-accent text-primary-bg px-4 py-2 rounded-md mb-4 font-semibold">Add New Offer</button>
            <div className="space-y-4">
                {offers.map(offer => (
                    <div key={offer.id} className="glass-card p-4 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold">{offer.title} - <span className="text-accent">{offer.price}</span></h4>
                            <p className="text-sm text-text-secondary">{offer.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                             <button onClick={() => updateOfferStatus(offer.id, offer.status === 'Active' ? 'Inactive' : 'Active')} className={`px-2 py-1 text-xs rounded font-semibold ${offer.status === 'Active' ? 'bg-accent text-primary-bg' : 'bg-gray-500 text-white'}`}>{offer.status}</button>
                             <button onClick={() => window.confirm('Are you sure you want to delete this offer?') && deleteOffer(offer.id)} className="bg-error text-white px-2 py-1 rounded text-xs font-semibold">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            <AdminModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} title="Add New Offer">
                <OfferForm onClose={() => setIsOfferModalOpen(false)} />
            </AdminModal>
        </div>
    );


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
                <div>
                  <button onClick={handleSignOut} className="bg-error text-white px-4 py-2 rounded-md font-semibold">Sign Out</button>
                </div>
            </div>

            <div className="flex border-b border-white border-opacity-20 mb-6 overflow-x-auto">
                <button onClick={() => setActiveTab('orders')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'orders' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}>Orders ({orders.length})</button>
                <button onClick={() => setActiveTab('portfolio')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'portfolio' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}>Portfolio ({portfolioItems.length})</button>
                <button onClick={() => setActiveTab('offers')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'offers' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}>Offers ({offers.length})</button>
            </div>
            
            {loading ? 
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                </div> : (
                <div>
                    {activeTab === 'orders' && renderOrders()}
                    {activeTab === 'portfolio' && renderPortfolio()}
                    {activeTab === 'offers' && renderOffers()}
                </div>
            )}

            {isDeliveryModalOpen && selectedOrder && (
                <DeliveryModal
                    isOpen={isDeliveryModalOpen}
                    onClose={() => setIsDeliveryModalOpen(false)}
                    order={selectedOrder}
                />
            )}

        </div>
    );
};

export default AdminView;