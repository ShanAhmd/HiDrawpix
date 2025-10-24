import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User
} from "firebase/auth";
// FIX: Replaced namespace import with named imports to match Firebase v9+ modular SDK usage.
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
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
// FIX: Removed `firestore.` prefix
const db = getFirestore(app);
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
// FIX: Removed `firestore.` prefix
const ordersCollection = collection(db, "orders");
// FIX: Removed `firestore.` prefix
const portfolioCollection = collection(db, "portfolio");
// FIX: Removed `firestore.` prefix
const offersCollection = collection(db, "offers");

// Storage functions
export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// Order functions
export const addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'price' | 'deliveryFileURL'>): Promise<string> => {
    // FIX: Removed `firestore.` prefix
    const docRef = await addDoc(ordersCollection, {
        ...orderData,
        status: 'Pending',
        // FIX: Removed `firestore.` prefix
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const getOrderStatus = async (orderId: string): Promise<Order | null> => {
    // FIX: Removed `firestore.` prefix
    const docRef = doc(db, 'orders', orderId);
    // FIX: Removed `firestore.` prefix
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data } as Order;
    }
    return null;
};

export const listenToOrders = (callback: (orders: Order[]) => void) => {
    // FIX: Removed `firestore.` prefix
    const q = query(ordersCollection, orderBy('createdAt', 'desc'));
    // FIX: Removed `firestore.` prefix
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        callback(orders);
    });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    // FIX: Removed `firestore.` prefix
    const docRef = doc(db, 'orders', orderId);
    // FIX: Removed `firestore.` prefix
    await updateDoc(docRef, { status });
};

export const deleteOrder = async (orderId: string): Promise<void> => {
    // FIX: Removed `firestore.` prefix
    const docRef = doc(db, 'orders', orderId);
    // FIX: Removed `firestore.` prefix
    await deleteDoc(docRef);
};

export const setOrderAsCompleted = async (orderId: string, deliveryFileURL: string, price: string): Promise<void> => {
    // FIX: Removed `firestore.` prefix
    const docRef = doc(db, 'orders', orderId);
    // FIX: Removed `firestore.` prefix
    await updateDoc(docRef, {
        status: 'Completed',
        deliveryFileURL,
        price,
    });
};


// Portfolio functions
export const listenToPortfolioItems = (callback: (items: PortfolioItem[]) => void) => {
    // FIX: Removed `firestore.` prefix
    const q = query(portfolioCollection);
    // FIX: Removed `firestore.` prefix
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
        callback(items);
    });
};

export const addPortfolioItem = async (itemData: Omit<PortfolioItem, 'id'>): Promise<void> => {
    // FIX: Removed `firestore.` prefix
    await addDoc(portfolioCollection, itemData);
};

export const deletePortfolioItem = async (item: PortfolioItem): Promise<void> => {
    // Delete the document from Firestore
    // FIX: Removed `firestore.` prefix
    const docRef = doc(db, 'portfolio', item.id);
    // FIX: Removed `firestore.` prefix
    await deleteDoc(docRef);
    // Delete the image from Storage
    try {
        const imageRef = ref(storage, item.imageURL);
        await deleteObject(imageRef);
    } catch(error) {
        console.error("Error deleting portfolio image from storage:", error);
    }
};

export const updatePortfolioItemStatus = async (itemId: string, status: 'Show' | 'Hide'): Promise<void> => {
    // FIX: Removed `firestore.` prefix
    const docRef = doc(db, 'portfolio', itemId);
    // FIX: Removed `firestore.` prefix
    await updateDoc(docRef, { status });
};

// Offer functions
export const listenToOffers = (callback: (offers: Offer[]) => void) => {
    // FIX: Removed `firestore.` prefix
    const q = query(offersCollection);
    // FIX: Removed `firestore.` prefix
    return onSnapshot(q, (snapshot) => {
        const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
        callback(offers);
    });
};

export const addOffer = async (offerData: Omit<Offer, 'id'>): Promise<void> => {
    // FIX: Removed `firestore.` prefix
    await addDoc(offersCollection, offerData);
};

export const deleteOffer = async (offerId: string): Promise<void> => {
    // FIX: Removed `firestore.` prefix
    const docRef = doc(db, 'offers', offerId);
    // FIX: Removed `firestore.` prefix
    await deleteDoc(docRef);
};

export const updateOfferStatus = async (offerId: string, status: 'Active' | 'Inactive'): Promise<void> => {
    // FIX: Removed `firestore.` prefix
    const docRef = doc(db, 'offers', offerId);
    // FIX: Removed `firestore.` prefix
    await updateDoc(docRef, { status });
};
