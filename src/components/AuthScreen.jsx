/**
 * AuthScreen - Apple-style PIN authentication screen
 * Simplified version using native numeric keyboard
 */

import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Shield, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { MASTER_PIN } from '../utils/constants.js';
import Storage from '../utils/storage.js';

const AuthScreen = ({ onAuth }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  const isSetup = !Storage.isSetup();

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle PIN verification
  const verifyPin = (inputPin) => {
    if (inputPin === MASTER_PIN) {
      setSuccess(true);
      setError('');

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
        inputRef.current?.focus();
      }, 500);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
    setError('');

    if (value.length === 6) {
      verifyPin(value);
    }
  };

  // Handle tap on PIN display to focus input
  const handlePinDisplayClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gradient-start via-gradient-mid to-gradient-end flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-accent to-accent-light rounded-[2rem] flex items-center justify-center shadow-glow mx-auto">
              <Wallet size={48} className="text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-accent/30 rounded-[2rem] blur-2xl mx-auto -z-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSetup ? 'Bienvenido' : 'Hola de nuevo'}
          </h1>
          <p className="text-gray-500">
            {isSetup ? 'Configura tu PIN de acceso' : 'Ingresa tu PIN para continuar'}
          </p>
        </div>

        {/* Hidden Input for native keyboard */}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onChange={handleChange}
          maxLength={6}
          autoComplete="one-time-code"
          className="sr-only"
          disabled={success}
        />

        {/* PIN Display - Clickable */}
        <div
          onClick={handlePinDisplayClick}
          className={`
            flex justify-center gap-3 mb-8 cursor-pointer
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
                w-12 h-14 rounded-2xl border-2 transition-all duration-200
                flex items-center justify-center
                ${success
                  ? 'bg-income border-income'
                  : i < pin.length
                    ? 'bg-accent border-accent'
                    : i === pin.length
                      ? 'border-accent bg-white/80'
                      : 'border-gray-300 bg-white/50'
                }
              `}
            >
              {i < pin.length && (
                <div className={`w-3 h-3 rounded-full bg-white`} />
              )}
            </div>
          ))}
        </div>

        {/* Hint */}
        {!error && !success && pin.length === 0 && (
          <p className="text-center text-sm text-gray-400 mb-6 animate-fade-in">
            Toca los círculos para ingresar tu PIN
          </p>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-expense mb-6 animate-fade-in">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center justify-center gap-2 text-income mb-6 animate-fade-in">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Acceso correcto</span>
          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-12 text-gray-400 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
