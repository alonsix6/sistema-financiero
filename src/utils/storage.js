/**
 * Módulo de almacenamiento en LocalStorage
 * Maneja la persistencia de datos encriptados y comprimidos
 */

import Security from './security.js';
import LZString from 'lz-string';

const STORAGE_KEY = 'finanzas_data';
const STORAGE_VERSION = '2.0'; // Versión con compresión
const VERSION_KEY = 'finanzas_version';

const Storage = {
  /**
   * Guarda datos encriptados y comprimidos en localStorage
   * @param {Object} data - Datos a guardar
   * @param {string} pin - PIN para encriptar
   */
  saveData: (data, pin) => {
    try {
      // Encriptar datos
      const encrypted = Security.encrypt(data, pin);

      // Comprimir datos encriptados
      const compressed = LZString.compressToUTF16(encrypted);

      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEY, compressed);
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);

      // Calcular y mostrar estadísticas de compresión en consola
      const originalSize = encrypted.length;
      const compressedSize = compressed.length;
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      console.log(`💾 Datos guardados - Compresión: ${ratio}% (${originalSize} → ${compressedSize} chars)`);
    } catch (error) {
      console.error('Error al guardar datos:', error);
      throw new Error('No se pudieron guardar los datos. El almacenamiento podría estar lleno.');
    }
  },

  /**
   * Carga, descomprime y desencripta datos desde localStorage
   * @param {string} pin - PIN para desencriptar
   * @returns {Object|null} Datos desencriptados o null
   */
  loadData: (pin) => {
    try {
      const compressed = localStorage.getItem(STORAGE_KEY);
      if (!compressed) return null;

      const version = localStorage.getItem(VERSION_KEY);

      // Si no hay versión o es la versión antigua (sin compresión)
      if (!version || version !== STORAGE_VERSION) {
        console.log('📦 Migrado datos antiguos a formato comprimido');
        // Intentar cargar datos antiguos sin comprimir
        const decrypted = Security.decrypt(compressed, pin);
        if (decrypted) {
          // Guardar en nuevo formato comprimido
          Storage.saveData(decrypted, pin);
          return decrypted;
        }
        return null;
      }

      // Descomprimir datos
      const decompressed = LZString.decompressFromUTF16(compressed);
      if (!decompressed) {
        console.error('Error al descomprimir datos');
        return null;
      }

      // Desencriptar datos
      return Security.decrypt(decompressed, pin);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      return null;
    }
  },

  /**
   * Verifica si existe configuración inicial
   * @returns {boolean} True si hay datos guardados
   */
  isSetup: () => localStorage.getItem(STORAGE_KEY) !== null,

  /**
   * Obtiene estadísticas de almacenamiento
   * @returns {Object} Estadísticas de uso de localStorage
   */
  getStorageStats: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return { used: 0, available: 5242880, percentage: 0 };

      const used = new Blob([data]).size;
      const available = 5242880; // 5MB típico de localStorage
      const percentage = ((used / available) * 100).toFixed(2);

      return {
        used,
        available,
        percentage,
        usedMB: (used / 1024 / 1024).toFixed(2),
        availableMB: (available / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  },

  /**
   * Limpia datos antiguos (para mantenimiento)
   */
  clearData: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    console.log('🗑️ Datos eliminados correctamente');
  }
};

export default Storage;
