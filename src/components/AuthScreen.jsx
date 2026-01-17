/**
 * AuthScreen - Apple-style PIN authentication screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, Delete, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { MASTER_PIN } from '../utils/constants.js';
import Storage from '../utils/storage.js';

const AuthScreen = ({ onAuth }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const isSetup = !Storage.isSetup();

  // Handle PIN verification
  const verifyPin = useCallback(() => {
    if (pin === MASTER_PIN) {
      setSuccess(true);
      setError('');

      // Small delay for animation
      setTimeout(() => {
        let data;
        if (isSetup) {
          data = {
            tarjetas: [],
            transacciones: [],
            recurrencias: [],
            metas: [],
            stockFavorites: [],
            stockInvestments: []
          };
          Storage.saveData(data, MASTER_PIN);
        } else {
          data = Storage.loadData(MASTER_PIN);
          if (!data) {
            setError('Error al cargar datos');
            setSuccess(false);
            setPin('');
            return;
          }
          // Ensure all arrays exist
          if (!data.recurrencias) data.recurrencias = [];
          if (!data.metas) data.metas = [];
          if (!data.stockFavorites) data.stockFavorites = [];
          if (!data.stockInvestments) data.stockInvestments = [];
        }
        onAuth(data);
      }, 500);
    } else {
      setError('PIN incorrecto');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 500);
    }
  }, [pin, isSetup, onAuth]);

  // Auto-verify when PIN is complete
  useEffect(() => {
    if (pin.length === 6) {
      verifyPin();
    }
  }, [pin, verifyPin]);

  // Handle key input
  const handleKeyPress = (key) => {
    if (success) return;

    if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
      setError('');
    } else if (pin.length < 6) {
      setPin(prev => prev + key);
      setError('');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (success) return;

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeyPress('delete');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, success]);

  const numpadKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'delete'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gradient-start via-gradient-mid to-gradient-end flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-accent to-accent-light rounded-[2rem] flex items-center justify-center shadow-glow-accent mx-auto">
              <Wallet size={48} className="text-white" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 w-24 h-24 bg-accent/30 rounded-[2rem] blur-2xl mx-auto -z-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSetup ? 'Bienvenido' : 'Hola de nuevo'}
          </h1>
          <p className="text-gray-500">
            {isSetup ? 'Configura tu PIN de acceso' : 'Ingresa tu PIN para continuar'}
          </p>
        </div>

        {/* PIN Display */}
        <div
          className={`
            flex justify-center gap-3 mb-8
            ${shake ? 'animate-shake' : ''}
          `}
          style={{
            animation: shake ? 'shake 0.5s ease-in-out' : 'none'
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`
                w-12 h-12 rounded-2xl border-2 transition-all duration-200
                flex items-center justify-center
                ${success
                  ? 'bg-green-500 border-green-500'
                  : i < pin.length
                    ? 'bg-accent border-accent'
                    : 'border-gray-300 dark:border-gray-600 bg-white/50'
                }
              `}
            >
              {i < pin.length && (
                <div className={`w-3 h-3 rounded-full ${success ? 'bg-white' : 'bg-white'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-500 mb-6 animate-fade-in">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center justify-center gap-2 text-green-500 mb-6 animate-fade-in">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Acceso correcto</span>
          </div>
        )}

        {/* Numpad */}
        <div className="glass-card rounded-3xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-3 gap-3">
            {numpadKeys.map((key, i) => (
              <div key={i} className="aspect-square">
                {key === null ? (
                  <div />
                ) : key === 'delete' ? (
                  <button
                    onClick={() => handleKeyPress('delete')}
                    disabled={success}
                    className="w-full h-full rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all duration-150 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Delete size={24} className="text-gray-600 dark:text-gray-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleKeyPress(key.toString())}
                    disabled={success}
                    className="w-full h-full rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 active:bg-gray-100 dark:active:bg-gray-600 transition-all duration-150 text-2xl font-semibold text-gray-800 dark:text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {key}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-8 text-gray-400 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Shield size={16} />
          <span className="text-xs">Datos encriptados localmente</span>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-gray-400 mt-4">
          FinApp v4.0
        </p>
      </div>

      {/* Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AuthScreen;
