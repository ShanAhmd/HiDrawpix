
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    User,
    createUserWithEmailAndPassword
} from 'firebase/auth';
// FIX: Switched to named imports for Firebase v9 modular SDK to resolve all Firestore errors.
import { 
    getFirestore,
    collection,
    addDoc,
    Timestamp,
    query,
    where,
    getDocs,
    orderBy,
    onSnapshot,
    doc,
    updateDoc
} from 'firebase/firestore';
import { Order, OrderStatus } from '../types';

// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// FIX: Called getFirestore directly as required by Firebase v9.
const db = getFirestore(app);

// FIX: Called collection directly as required by Firebase v9.
const ordersCollection = collection(db, 'orders');

// --- Order Functions ---

export const addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
  try {
    // FIX: Called addDoc and Timestamp directly as required by Firebase v9.
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
        // FIX: Called query, where, and getDocs directly as required by Firebase v9.
        const q = query(ordersCollection, where('__name__', '==', orderId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Order;
    } catch (error) {
        console.error("Error getting order status:", error);
        throw new Error("Could not fetch order status.");
    }
}

export const listenToOrders = (callback: (orders: Order[]) => void) => {
    // FIX: Called query, orderBy, and onSnapshot directly as required by Firebase v9.
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
    // FIX: Called doc and updateDoc directly as required by Firebase v9.
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, { status });
  } catch (error) {
    console.error("Error updating order status: ", error);
    throw new Error("Could not update order status.");
  }
};


// --- Auth Functions ---

export { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword };
export type { User };
