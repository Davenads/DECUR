/**
 * Browser storage utility functions with TypeScript
 */

/**
 * Type-safe local storage functions
 */
export const localStorageUtil = {
  /**
   * Gets an item from localStorage with type safety
   * @param key - The key to retrieve
   * @returns The parsed value or null if not found
   */
  getItem: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch (error) {
      console.error(`Error retrieving ${key} from localStorage:`, error);
      return null;
    }
  },

  /**
   * Sets an item in localStorage with type safety
   * @param key - The key to set
   * @param value - The value to store
   */
  setItem: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing ${key} in localStorage:`, error);
    }
  },

  /**
   * Removes an item from localStorage
   * @param key - The key to remove
   */
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  /**
   * Clears all items from localStorage
   */
  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

/**
 * Type-safe session storage functions
 */
export const sessionStorageUtil = {
  /**
   * Gets an item from sessionStorage with type safety
   * @param key - The key to retrieve
   * @returns The parsed value or null if not found
   */
  getItem: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch (error) {
      console.error(`Error retrieving ${key} from sessionStorage:`, error);
      return null;
    }
  },

  /**
   * Sets an item in sessionStorage with type safety
   * @param key - The key to set
   * @param value - The value to store
   */
  setItem: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing ${key} in sessionStorage:`, error);
    }
  },

  /**
   * Removes an item from sessionStorage
   * @param key - The key to remove
   */
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from sessionStorage:`, error);
    }
  },

  /**
   * Clears all items from sessionStorage
   */
  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }
};