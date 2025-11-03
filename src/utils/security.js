/**
 * Módulo de seguridad y encriptación
 * Utiliza CryptoJS para encriptar/desencriptar datos sensibles
 */

import CryptoJS from 'crypto-js';

const Security = {
  /**
   * Encripta datos usando AES con el PIN como clave
   * @param {Object} data - Datos a encriptar
   * @param {string} pin - PIN de seguridad
   * @returns {string} Datos encriptados
   */
  encrypt: (data, pin) => {
    const key = CryptoJS.PBKDF2(pin, 'salt', { keySize: 256/32 });
    return CryptoJS.AES.encrypt(JSON.stringify(data), key.toString()).toString();
  },

  /**
   * Desencripta datos usando AES con el PIN como clave
   * @param {string} encryptedData - Datos encriptados
   * @param {string} pin - PIN de seguridad
   * @returns {Object|null} Datos desencriptados o null si falla
   */
  decrypt: (encryptedData, pin) => {
    try {
      const key = CryptoJS.PBKDF2(pin, 'salt', { keySize: 256/32 });
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key.toString());
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      return null;
    }
  }
};

export default Security;
