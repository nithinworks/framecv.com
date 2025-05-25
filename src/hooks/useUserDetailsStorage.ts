
import { useState, useEffect } from "react";

interface StoredUserData {
  name: string;
  email: string;
  timestamp: number;
}

const STORAGE_KEY = "portfolio_user_details";
const STORAGE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

export const useUserDetailsStorage = () => {
  const [storedData, setStoredData] = useState<StoredUserData | null>(null);

  const loadStoredUserData = (): StoredUserData | null => {
    try {
      const storedDataString = localStorage.getItem(STORAGE_KEY);
      if (storedDataString) {
        const userData: StoredUserData = JSON.parse(storedDataString);
        const now = Date.now();
        
        // Check if data hasn't expired
        if (now - userData.timestamp < STORAGE_EXPIRY) {
          return userData;
        } else {
          // Clear expired data
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading stored user data:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  };

  const saveUserData = (name: string, email: string): void => {
    const userDataToStore: StoredUserData = {
      name: name.trim(),
      email: email.trim(),
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userDataToStore));
    setStoredData(userDataToStore);
  };

  const clearStoredData = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    setStoredData(null);
  };

  return {
    storedData,
    loadStoredUserData,
    saveUserData,
    clearStoredData
  };
};
