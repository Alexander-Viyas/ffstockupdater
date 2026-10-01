import { db } from '../firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDocs 
} from 'firebase/firestore';


// Fast local image compressor using Canvas — no network upload, instant results
// Resizes to max 600px and compresses to JPEG quality 0.7 (~20-50KB typically)
export const processAndUploadImage = (file) => {
  if (!file) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl); // free memory

      const MAX_SIZE = 600; // max width or height in pixels
      let { width, height } = img;

      // Scale down proportionally if larger than MAX_SIZE
      if (width > height) {
        if (width > MAX_SIZE) { height = Math.round(height * MAX_SIZE / width); width = MAX_SIZE; }
      } else {
        if (height > MAX_SIZE) { width = Math.round(width * MAX_SIZE / height); height = MAX_SIZE; }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG at 70% quality — fast & small enough for Firestore
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedDataUrl);
    };

    img.onerror = reject;
    img.src = objectUrl;
  });
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
