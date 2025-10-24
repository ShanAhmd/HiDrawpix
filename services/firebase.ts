import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User
} from "firebase/auth";
// FIX: Replaced named imports from 'firebase/firestore' with a namespace import.
// This can resolve module loading errors caused by bundler or environment configuration issues.
import * as firestore from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { Order, PortfolioItem, Offer, OrderStatus } from './types';

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
const db = firestore.getFirestore(app);
const storage = getStorage(app);

// Export auth functions and types
export {
  auth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};
export type { User };


// Firestore collections
const ordersCollection = firestore.collection(db, "orders");
const portfolioCollection = firestore.collection(db, "portfolio");
const offersCollection = firestore.collection(db, "offers");

// Storage functions
export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// Order functions
export const addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'price' | 'deliveryFileURL'>): Promise<string> => {
    const docRef = await firestore.addDoc(ordersCollection, {
        ...orderData,
        status: 'Pending',
        createdAt: firestore.serverTimestamp(),
    });
    return docRef.id;
};

export const getOrderStatus = async (orderId: string): Promise<Order | null> => {
    const docRef = firestore.doc(db, 'orders', orderId);
    const docSnap = await firestore.getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data } as Order;
    }
    return null;
};

export const listenToOrders = (callback: (orders: Order[]) => void) => {
    const q = firestore.query(ordersCollection, firestore.orderBy('createdAt', 'desc'));
    return firestore.onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        callback(orders);
    });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    const docRef = firestore.doc(db, 'orders', orderId);
    await firestore.updateDoc(docRef, { status });
};

export const deleteOrder = async (orderId: string): Promise<void> => {
    const docRef = firestore.doc(db, 'orders', orderId);
    await firestore.deleteDoc(docRef);
};

export const setOrderAsCompleted = async (orderId: string, deliveryFileURL: string, price: string): Promise<void> => {
    const docRef = firestore.doc(db, 'orders', orderId);
    await firestore.updateDoc(docRef, {
        status: 'Completed',
        deliveryFileURL,
        price,
    });
};


// Portfolio functions
export const listenToPortfolioItems = (callback: (items: PortfolioItem[]) => void) => {
    const q = firestore.query(portfolioCollection);
    return firestore.onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
        callback(items);
    });
};

export const addPortfolioItem = async (itemData: Omit<PortfolioItem, 'id'>): Promise<void> => {
    await firestore.addDoc(portfolioCollection, itemData);
};

export const deletePortfolioItem = async (item: PortfolioItem): Promise<void> => {
    // Delete the document from Firestore
    const docRef = firestore.doc(db, 'portfolio', item.id);
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
    const docRef = firestore.doc(db, 'portfolio', itemId);
    await firestore.updateDoc(docRef, { status });
};

// Offer functions
export const listenToOffers = (callback: (offers: Offer[]) => void) => {
    const q = firestore.query(offersCollection);
    return firestore.onSnapshot(q, (snapshot) => {
        const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
        callback(offers);
    });
};

export const addOffer = async (offerData: Omit<Offer, 'id'>): Promise<void> => {
    await firestore.addDoc(offersCollection, offerData);
};

export const deleteOffer = async (offerId: string): Promise<void> => {
    const docRef = firestore.doc(db, 'offers', offerId);
    await firestore.deleteDoc(docRef);
};

export const updateOfferStatus = async (offerId: string, status: 'Active' | 'Inactive'): Promise<void> => {
    const docRef = firestore.doc(db, 'offers', offerId);
    await firestore.updateDoc(docRef, { status });
};