import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from './firebase';

// Registrar usuário
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Salvar dados do usuário no database
    await set(ref(database, `users/${user.uid}`), {
      email: user.email,
      name: userData.name,
      phone: userData.phone,
      plan: 'free',
      planExpiry: null,
      messagesUsed: 0,
      messagesLimit: 20,
      numbersConnected: 0,
      numbersLimit: 1,
      createdAt: new Date().toISOString(),
      isActive: true
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login do usuário
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout do usuário
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verificar se é admin
export const isAdmin = (email) => {
  const adminEmails = ['freefiremaxdojis@gmail.com'];
  return adminEmails.includes(email);
};

// Obter dados do usuário
export const getUserData = async (uid) => {
  try {
    const snapshot = await get(ref(database, `users/${uid}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    return null;
  }
};

// Atualizar dados do usuário
export const updateUserData = async (uid, data) => {
  try {
    await set(ref(database, `users/${uid}`), data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};