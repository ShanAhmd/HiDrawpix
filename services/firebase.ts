
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    User,
    createUserWithEmailAndPassword
} from 'firebase/auth';
// FIX: Changed import path from 'firebase/firestore' to '@firebase/firestore' to resolve module export errors.
import { 
    getFirestore, 
    collection, 
    addDoc, 
    Timestamp, 
    doc, 
    getDoc, 
    query, 
    orderBy, 
    onSnapshot,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from '@firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Order, OrderStatus, PortfolioItem, Offer } from '../types';

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// FIX: Called getFirestore directly as required by Firebase v9.
const db = getFirestore(app);
const storage = getStorage(app);

const ordersCollection = collection(db, 'orders');
const portfolioCollection = collection(db, 'portfolio');
const offersCollection = collection(db, 'specialOffers');


// --- File Upload Function ---
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
      const storageRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
  } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Could not upload image.");
  }
};

// --- Order Functions ---

export const addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(ordersCollection, {
      ...orderData,
      status: 'Pending',
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding order: ", error);
    throw new Error("Could not place order.");
  }
};

export const getOrderStatus = async (orderId: string): Promise<Order | null> => {
    try {
        const orderDocRef = doc(db, 'orders', orderId);
        const docSnapshot = await getDoc(orderDocRef);
        if (!docSnapshot.exists()) {
            return null;
        }
        return { id: docSnapshot.id, ...docSnapshot.data() } as Order;
    } catch (error) {
        console.error("Error getting order status:", error);
        throw new Error("Could not fetch order status.");
    }
}

export const listenToOrders = (callback: (orders: Order[]) => void) => {
    const q = query(ordersCollection, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
        const orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Order));
        callback(orders);
    });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await updateDoc(orderDocRef, { status });
  } catch (error) {
    console.error("Error updating order status: ", error);
    throw new Error("Could not update order status.");
  }
};

// --- Portfolio Functions ---
export const listenToPortfolioItems = (callback: (items: PortfolioItem[]) => void) => {
    const q = query(portfolioCollection, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
        callback(items);
    });
};

export const addPortfolioItem = (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => {
    return addDoc(portfolioCollection, { ...item, createdAt: serverTimestamp() });
};

export const updatePortfolioItem = (id: string, item: Partial<PortfolioItem>) => {
    return updateDoc(doc(db, 'portfolio', id), item);
};

export const deletePortfolioItem = (id: string) => {
    return deleteDoc(doc(db, 'portfolio', id));
};


// --- Offer Functions ---
export const listenToOffers = (callback: (items: Offer[]) => void) => {
    const q = query(offersCollection, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
        callback(items);
    });
};

export const addOffer = (offer: Omit<Offer, 'id' | 'createdAt'>) => {
    return addDoc(offersCollection, { ...offer, createdAt: serverTimestamp() });
};

export const updateOffer = (id: string, offer: Partial<Offer>) => {
    return updateDoc(doc(db, 'specialOffers', id), offer);
};

export const deleteOffer = (id: string) => {
    return deleteDoc(doc(db, 'specialOffers', id));
};


// --- Auth Functions ---

export { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword };
export type { User };