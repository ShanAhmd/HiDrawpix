import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User
} from "firebase/auth";
// FIX: Replaced named imports with a namespace import for firestore functions to resolve module resolution issues.
import * as firestore from "firebase/firestore";
import {
  getStorage,
  ref,
  deleteObject
} from "firebase/storage";
import { Order, PortfolioItem, Offer, OrderStatus } from '../types';

// IMPORTANT: The Firebase config is now hardcoded with your project's credentials.
const firebaseConfig = {
  apiKey: "AIzaSyBybr54q7CGz3SvRQ0LMFPq6bST4uQmiZ0",
  authDomain: "hi-drawpix.firebaseapp.com",
  projectId: "hi-drawpix",
  storageBucket: "hi-drawpix.firebasestorage.app",
  messagingSenderId: "1028714121791",
  appId: "1:1028714121791:web:dce4707a92bb9982fcc68a",
  measurementId: "G-8K4BREDZJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// FIX: Added `firestore.` prefix
const db = firestore.getFirestore(app);
const storage = getStorage(app);

// Export auth functions and types
export {
  auth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  storage,
};
export type { User };


// Firestore collections
// FIX: Added `firestore.` prefix
const ordersCollection = firestore.collection(db, "orders");
// FIX: Added `firestore.` prefix
const portfolioCollection = firestore.collection(db, "portfolio");
// FIX: Added `firestore.` prefix
const offersCollection = firestore.collection(db, "offers");

// Order functions
export const addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'price' | 'deliveryFileURL'>): Promise<string> => {
    // FIX: Added `firestore.` prefix
    const docRef = await firestore.addDoc(ordersCollection, {
        ...orderData,
        status: 'Pending',
        // FIX: Added `firestore.` prefix
        createdAt: firestore.serverTimestamp(),
    });
    return docRef.id;
};

export const getOrderStatus = async (orderId: string): Promise<Order | null> => {
    // FIX: Added `firestore.` prefix
    const docRef = firestore.doc(db, 'orders', orderId);
    // FIX: Added `firestore.` prefix
    const docSnap = await firestore.getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data } as Order;
    }
    return null;
};

export const listenToOrders = (callback: (orders: Order[]) => void) => {
    // FIX: Added `firestore.` prefix
    const q = firestore.query(ordersCollection, firestore.orderBy('createdAt', 'desc'));
    // FIX: Added `firestore.` prefix
    return firestore.onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        callback(orders);
    });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    // FIX: Added `firestore.` prefix
    const docRef = firestore.doc(db, 'orders', orderId);
    // FIX: Added `firestore.` prefix
    await firestore.updateDoc(docRef, { status });
};

export const deleteOrder = async (orderId: string): Promise<void> => {
    // FIX: Added `firestore.` prefix
    const docRef = firestore.doc(db, 'orders', orderId);
    // FIX: Added `firestore.` prefix
    await firestore.deleteDoc(docRef);
};

export const setOrderAsCompleted = async (orderId: string, deliveryFileURL: string, price: string): Promise<void> => {
    // FIX: Added `firestore.` prefix
    const docRef = firestore.doc(db, 'orders', orderId);
    // FIX: Added `firestore.` prefix
    await firestore.updateDoc(docRef, {
        status: 'Completed',
        deliveryFileURL,
        price,
    });
};


// Portfolio functions
export const listenToPortfolioItems = (callback: (items: PortfolioItem[]) => void) => {
    // FIX: Added `firestore.` prefix
    const q = firestore.query(portfolioCollection);
    // FIX: Added `firestore.` prefix
    return firestore.onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
        callback(items);
    });
};

export const addPortfolioItem = async (itemData: Omit<PortfolioItem, 'id'>): Promise<void> => {
    // FIX: Added `firestore.` prefix
    await firestore.addDoc(portfolioCollection, itemData);
};

export const deletePortfolioItem = async (item: PortfolioItem): Promise<void> => {
    // Delete the document from Firestore
    // FIX: Added `firestore.` prefix
    const docRef = firestore.doc(db, 'portfolio', item.id);
    // FIX: Added `firestore.` prefix
    await firestore.deleteDoc(docRef);
    // Delete the image from Storage
    try {
        const imageRef = ref(storage, item.imageURL);
        await deleteObject(imageRef);
    } catch(error) {
        console.error("Error deleting portfolio image from storage:", error);
    }
};

export const updatePortfolioItemStatus = async (itemId: string, status: 'Show' | 'Hide'): Promise<void> => {
    // FIX: Added `firestore.` prefix
    const docRef = firestore.doc(db, 'portfolio', itemId);
    // FIX: Added `firestore.` prefix
    await firestore.updateDoc(docRef, { status });
};

// Offer functions
export const listenToOffers = (callback: (offers: Offer[]) => void) => {
    // FIX: Added `firestore.` prefix
    const q = firestore.query(offersCollection);
    // FIX: Added `firestore.` prefix
    return firestore.onSnapshot(q, (snapshot) => {
        const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
        callback(offers);
    });
};

export const addOffer = async (offerData: Omit<Offer, 'id'>): Promise<void> => {
    // FIX: Added `firestore.` prefix
    await firestore.addDoc(offersCollection, offerData);
};

export const deleteOffer = async (offerId: string): Promise<void> => {
    // FIX: Added `firestore.` prefix
    const docRef = firestore.doc(db, 'offers', offerId);
    // FIX: Added `firestore.` prefix
    await firestore.deleteDoc(docRef);
};

export const updateOfferStatus = async (offerId: string, status: 'Active' | 'Inactive'): Promise<void> => {
    // FIX: Added `firestore.` prefix
    const docRef = firestore.doc(db, 'offers', offerId);
    // FIX: Added `firestore.` prefix
    await firestore.updateDoc(docRef, { status });
};