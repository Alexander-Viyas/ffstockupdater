import { db, storage } from '../firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDocs 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Utility to convert File to Data URL / Base64 for instant cross-device sync & preview
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Helper for uploading image (uses Firebase Storage if configured, or Data URL fallback)
export const processAndUploadImage = async (file) => {
  if (!file) return null;

  try {
    // Attempt Firebase Storage upload
    const storageRef = ref(storage, `stock_images/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (err) {
    console.warn('Firebase Storage not configured or failed, falling back to compressed Data URL:', err);
    // Fallback: Read as Data URL so image is stored centrally in Firestore document
    return await fileToDataUrl(file);
  }
};

// --- Products Real-Time Subscriptions & Operations ---
export const subscribeProducts = (onDataChange) => {
  try {
    const productsRef = collection(db, 'products');
    return onSnapshot(productsRef, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      onDataChange(products);
    }, (error) => {
      console.error('Products snapshot error:', error);
    });
  } catch (e) {
    console.error('Failed to subscribe to products:', e);
    return () => {};
  }
};

export const saveProductToCloud = async (product) => {
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, product);
  } catch (err) {
    console.error('Error saving product to Cloud:', err);
  }
};

export const deleteProductFromCloud = async (productId) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    console.error('Error deleting product from Cloud:', err);
  }
};

// --- Daily Updates Real-Time Subscriptions & Operations ---
export const subscribeDailySections = (onDataChange) => {
  try {
    const sectionsRef = collection(db, 'daily_sections');
    return onSnapshot(sectionsRef, (snapshot) => {
      const sections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      onDataChange(sections);
    }, (error) => {
      console.error('Daily sections snapshot error:', error);
    });
  } catch (e) {
    console.error('Failed to subscribe to daily sections:', e);
    return () => {};
  }
};

export const saveDailySectionToCloud = async (section) => {
  try {
    const docRef = doc(db, 'daily_sections', section.id);
    await setDoc(docRef, section);
  } catch (err) {
    console.error('Error saving daily section to Cloud:', err);
  }
};

export const deleteDailySectionFromCloud = async (sectionId) => {
  try {
    await deleteDoc(doc(db, 'daily_sections', sectionId));
  } catch (err) {
    console.error('Error deleting section from Cloud:', err);
  }
};

// --- Settings Operations ---
export const subscribeSettings = (onDataChange) => {
  try {
    const settingsDocRef = doc(db, 'app_settings', 'config');
    return onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        onDataChange(docSnap.data());
      }
    }, (error) => {
      console.error('Settings snapshot error:', error);
    });
  } catch (e) {
    console.error('Failed to subscribe to settings:', e);
    return () => {};
  }
};

export const saveSettingsToCloud = async (settings) => {
  try {
    const settingsDocRef = doc(db, 'app_settings', 'config');
    await setDoc(settingsDocRef, settings);
  } catch (err) {
    console.error('Error saving settings to Cloud:', err);
  }
};
