// Firebase imports
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    User 
} from 'firebase/auth';
// FIX: Reverted to @firebase/firestore as the project's dependency setup seems to require it.
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from '@firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from 'firebase/storage';
import { Order, PortfolioItem, Offer, OrderStatus } from '../types';

// Your web app's Firebase configuration
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
const app: FirebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Re-export auth functions and types for convenience
export { auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
export type { User };


// Firestore collection references
const ordersCollection = collection(db, 'orders');
const portfolioCollection = collection(db, 'portfolio');
const offersCollection = collection(db, 'offers');


// --- Order Functions ---

export const addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(ordersCollection, {
        ...orderData,
        status: 'Pending',
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const getOrderStatus = async (orderId: string): Promise<Order | null> => {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
};

export const setOrderAsCompleted = async (orderId: string, deliveryFileURL: string, price: string): Promise<void> => {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
        status: 'Completed',
        deliveryFileURL: deliveryFileURL,
        completedAt: serverTimestamp(),
        price: price,
    });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { status });
};

export const deleteOrder = async (orderId: string): Promise<void> => {
    const docRef = doc(db, 'orders', orderId);
    await deleteDoc(docRef);
};

export const listenToOrders = (callback: (orders: Order[]) => void): (() => void) => {
    const q = query(ordersCollection, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        callback(orders);
    });
};

// --- Storage Functions ---

export const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};

const deleteFileByUrl = async (url: string) => {
    try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
    } catch (error) {
        if ((error as any).code !== 'storage/object-not-found') {
             console.error("Error deleting file from storage:", error);
        }
    }
};

// --- Portfolio Functions ---

export const listenToPortfolioItems = (callback: (items: PortfolioItem[]) => void): (() => void) => {
    const q = query(portfolioCollection, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
        callback(items);
    });
};

export const addPortfolioItem = async (item: Omit<PortfolioItem, 'id' | 'createdAt'>): Promise<void> => {
    await addDoc(portfolioCollection, { ...item, createdAt: serverTimestamp() });
};

export const updatePortfolioItemStatus = async (itemId: string, status: 'Show' | 'Hide'): Promise<void> => {
    const docRef = doc(db, 'portfolio', itemId);
    await updateDoc(docRef, { status });
};

export const deletePortfolioItem = async (item: PortfolioItem): Promise<void> => {
    // Delete Firestore document
    const docRef = doc(db, 'portfolio', item.id);
    await deleteDoc(docRef);
    // Delete image from Storage
    await deleteFileByUrl(item.imageURL);
};

// --- Offer Functions ---

export const listenToOffers = (callback: (offers: Offer[]) => void): (() => void) => {
    const q = query(offersCollection, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
        callback(offers);
    });
};

export const addOffer = async (offer: Omit<Offer, 'id' | 'createdAt'>): Promise<void> => {
    await addDoc(offersCollection, { ...offer, createdAt: serverTimestamp() });
};

export const updateOfferStatus = async (offerId: string, status: 'Active' | 'Inactive'): Promise<void> => {
    const docRef = doc(db, 'offers', offerId);
    await updateDoc(docRef, { status });
};

export const deleteOffer = async (offerId: string): Promise<void> => {
    const docRef = doc(db, 'offers', offerId);
    await deleteDoc(docRef);
};