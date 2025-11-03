/**
 * Módulo de almacenamiento en LocalStorage
 * Maneja la persistencia de datos encriptados
 */

import Security from './security.js';

const STORAGE_KEY = 'finanzas_data';

const Storage = {
  /**
   * Guarda datos encriptados en localStorage
   * @param {Object} data - Datos a guardar
   * @param {string} pin - PIN para encriptar
   */
  saveData: (data, pin) => {
    const encrypted = Security.encrypt(data, pin);
    localStorage.setItem(STORAGE_KEY, encrypted);
  },

  /**
   * Carga y desencripta datos desde localStorage
   * @param {string} pin - PIN para desencriptar
   * @returns {Object|null} Datos desencriptados o null
   */
  loadData: (pin) => {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    return Security.decrypt(encrypted, pin);
  },

  /**
   * Verifica si existe configuración inicial
   * @returns {boolean} True si hay datos guardados
   */
  isSetup: () => localStorage.getItem(STORAGE_KEY) !== null
};

export default Storage;
