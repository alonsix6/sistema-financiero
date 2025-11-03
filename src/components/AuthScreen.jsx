/**
 * Pantalla de autenticación con PIN
 */

import React, { useState, useEffect } from 'react';
import { MASTER_PIN } from '../utils/constants.js';
import Storage from '../utils/storage.js';

const AuthScreen = ({ onAuth }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const isSetup = !Storage.isSetup();

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === MASTER_PIN) {
        let data;
        if (isSetup) {
          data = { tarjetas: [], transacciones: [], recurrencias: [] };
          Storage.saveData(data, MASTER_PIN);
        } else {
          data = Storage.loadData(MASTER_PIN);
          if (!data) {
            setError('Error al cargar datos');
            setPin('');
            return;
          }
          if (!data.recurrencias) data.recurrencias = [];
        }
        onAuth(data);
      } else {
        setError('PIN incorrecto');
        setPin('');
      }
    }
  }, [pin, isSetup, onAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">₪</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSetup ? 'Bienvenido' : 'Hola Alonso'}
          </h1>
          <p className="text-gray-600">Sistema Financiero v3.1</p>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl border-2 transition-all ${
                i < pin.length ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => pin.length < 6 && setPin(pin + num.toString())}
              className="h-16 text-xl font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800"
            >
              {num}
            </button>
          ))}
          <div></div>
          <button
            onClick={() => pin.length < 6 && setPin(pin + '0')}
            className="h-16 text-xl font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800"
          >
            0
          </button>
          <button
            onClick={() => setPin(pin.slice(0, -1))}
            className="h-16 text-xl font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
