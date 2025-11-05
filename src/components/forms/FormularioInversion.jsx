/**
 * Formulario para agregar/editar inversiones en stocks y ETFs
 * Soporta inversiones fraccionarias y tipo de cambio USD/PEN
 */

import React, { useState, useEffect } from 'react';
import FinnhubService from '../../utils/finnhubService.js';

const FormularioInversion = ({ investment, stockSymbol, stockName, currentPrice, exchangeRate, onSave, onClose }) => {
  const [inputMode, setInputMode] = useState('amount'); // 'amount' o 'shares'
  const [formData, setFormData] = useState({
    shares: investment?.shares || '',
    investmentAmountUSD: investment?.shares && investment?.purchasePrice ? (investment.shares * investment.purchasePrice).toFixed(2) : '',
    purchasePrice: investment?.purchasePrice || currentPrice || '',
    purchaseDate: investment?.purchaseDate || new Date().toISOString().split('T')[0],
    exchangeRate: investment?.exchangeRate || exchangeRate || '',
    notes: investment?.notes || '',
  });

  const [errors, setErrors] = useState({});
  const [loadingExchangeRate, setLoadingExchangeRate] = useState(false);

  // Cargar tipo de cambio al montar si no existe
  useEffect(() => {
    if (!formData.exchangeRate) {
      loadExchangeRate();
    }
  }, []);

  const loadExchangeRate = async () => {
    setLoadingExchangeRate(true);
    try {
      const rate = await FinnhubService.getExchangeRate('USD', 'PEN');
      if (rate) {
        setFormData(prev => ({ ...prev, exchangeRate: rate.toFixed(4) }));
      } else {
        // Fallback a tipo de cambio aproximado
        setFormData(prev => ({ ...prev, exchangeRate: '3.75' }));
      }
    } catch (error) {
      console.error('Error cargando tipo de cambio:', error);
      setFormData(prev => ({ ...prev, exchangeRate: '3.75' }));
    } finally {
      setLoadingExchangeRate(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    // Calcular automáticamente según el modo
    if (name === 'investmentAmountUSD' && inputMode === 'amount') {
      const amount = parseFloat(value) || 0;
      const price = parseFloat(formData.purchasePrice) || 0;
      if (price > 0) {
        updatedData.shares = (amount / price).toFixed(6);
      }
    } else if (name === 'shares' && inputMode === 'shares') {
      const shares = parseFloat(value) || 0;
      const price = parseFloat(formData.purchasePrice) || 0;
      updatedData.investmentAmountUSD = (shares * price).toFixed(2);
    } else if (name === 'purchasePrice') {
      // Recalcular según el modo activo
      if (inputMode === 'amount') {
        const amount = parseFloat(formData.investmentAmountUSD) || 0;
        const price = parseFloat(value) || 0;
        if (price > 0) {
          updatedData.shares = (amount / price).toFixed(6);
        }
      } else {
        const shares = parseFloat(formData.shares) || 0;
        const price = parseFloat(value) || 0;
        updatedData.investmentAmountUSD = (shares * price).toFixed(2);
      }
    }

    setFormData(updatedData);

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleModeChange = (mode) => {
    setInputMode(mode);
    // Mantener consistencia al cambiar de modo
    if (mode === 'amount' && formData.shares && formData.purchasePrice) {
      const amount = parseFloat(formData.shares) * parseFloat(formData.purchasePrice);
      setFormData(prev => ({ ...prev, investmentAmountUSD: amount.toFixed(2) }));
    } else if (mode === 'shares' && formData.investmentAmountUSD && formData.purchasePrice) {
      const shares = parseFloat(formData.investmentAmountUSD) / parseFloat(formData.purchasePrice);
      setFormData(prev => ({ ...prev, shares: shares.toFixed(6) }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const shares = parseFloat(formData.shares);
    if (!formData.shares || shares <= 0) {
      newErrors.shares = 'Debes ingresar una cantidad válida de acciones';
    }

    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Debes ingresar un precio de compra válido';
    }

    if (!formData.exchangeRate || parseFloat(formData.exchangeRate) <= 0) {
      newErrors.exchangeRate = 'Debes ingresar un tipo de cambio válido';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Debes seleccionar una fecha';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const shares = parseFloat(formData.shares);
    const purchasePrice = parseFloat(formData.purchasePrice);
    const exchangeRate = parseFloat(formData.exchangeRate);
    const totalInvestedUSD = shares * purchasePrice;
    const totalInvestedPEN = totalInvestedUSD * exchangeRate;

    const investmentData = {
      id: investment?.id || Date.now(),
      symbol: stockSymbol,
      name: stockName,
      shares,
      purchasePrice,
      purchaseDate: formData.purchaseDate,
      exchangeRate,
      totalInvested: totalInvestedUSD,
      totalInvestedPEN,
      notes: formData.notes,
      createdAt: investment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(investmentData);
  };

  const totalInvestedUSD = (parseFloat(formData.shares) || 0) * (parseFloat(formData.purchasePrice) || 0);
  const totalInvestedPEN = totalInvestedUSD * (parseFloat(formData.exchangeRate) || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💰</span>
          <div>
            <h3 className="font-bold text-gray-800">{stockSymbol}</h3>
            <p className="text-sm text-gray-600">{stockName}</p>
          </div>
        </div>
        {currentPrice && (
          <p className="text-sm text-gray-700 mt-2">
            📊 Precio actual: <span className="font-bold">${currentPrice.toFixed(2)}</span>
          </p>
        )}
      </div>

      {/* Selector de modo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ¿Cómo quieres calcular tu inversión?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleModeChange('amount')}
            className={`px-4 py-3 rounded-xl border-2 transition-all ${
              inputMode === 'amount'
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            💵 Por Monto (USD)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('shares')}
            className={`px-4 py-3 rounded-xl border-2 transition-all ${
              inputMode === 'shares'
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            📊 Por Acciones
          </button>
        </div>
      </div>

      {/* Campo principal según modo */}
      {inputMode === 'amount' ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ¿Cuánto quieres invertir? (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500">$</span>
            <input
              type="number"
              name="investmentAmountUSD"
              value={formData.investmentAmountUSD}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              placeholder="Ej: 100.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            💡 Ingresa el monto en dólares que quieres invertir
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cantidad de Acciones / Shares
          </label>
          <input
            type="number"
            name="shares"
            value={formData.shares}
            onChange={handleChange}
            step="0.000001"
            min="0.000001"
            placeholder="Ej: 10 o 0.166667"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
              errors.shares ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.shares && (
            <p className="text-red-600 text-sm mt-1">{errors.shares}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            💡 Puedes ingresar fracciones de acciones (ej: 0.166667)
          </p>
        </div>
      )}

      {/* Precio de compra */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Precio de Compra (USD por acción)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3 text-gray-500">$</span>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            placeholder="Ej: 450.50"
            className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
              errors.purchasePrice ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.purchasePrice && (
          <p className="text-red-600 text-sm mt-1">{errors.purchasePrice}</p>
        )}
      </div>

      {/* Acciones calculadas (solo en modo monto) */}
      {inputMode === 'amount' && formData.shares && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800 mb-1">
            📊 Acciones que comprarás:
          </p>
          <p className="text-2xl font-bold text-green-900">
            {parseFloat(formData.shares).toFixed(6)} acciones
          </p>
        </div>
      )}

      {/* Tipo de cambio */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tipo de Cambio USD/PEN
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-3 text-gray-500">S/</span>
            <input
              type="number"
              name="exchangeRate"
              value={formData.exchangeRate}
              onChange={handleChange}
              step="0.0001"
              min="0.0001"
              placeholder="Ej: 3.75"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                errors.exchangeRate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={loadExchangeRate}
            disabled={loadingExchangeRate}
            className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Actualizar tipo de cambio"
          >
            {loadingExchangeRate ? '⏳' : '🔄'}
          </button>
        </div>
        {errors.exchangeRate && (
          <p className="text-red-600 text-sm mt-1">{errors.exchangeRate}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          💡 1 USD = S/ {formData.exchangeRate || '0'} PEN
        </p>
      </div>

      {/* Fecha de compra */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Fecha de Compra
        </label>
        <input
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
            errors.purchaseDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.purchaseDate && (
          <p className="text-red-600 text-sm mt-1">{errors.purchaseDate}</p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notas (opcional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Ej: Compra inicial de ETF diversificado"
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Resumen de inversión */}
      {totalInvestedUSD > 0 && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90 mb-1">Inversión en Dólares</p>
            <p className="text-3xl font-bold">${totalInvestedUSD.toFixed(2)} USD</p>
            <p className="text-xs opacity-80 mt-2">
              {parseFloat(formData.shares).toFixed(6)} acciones × ${formData.purchasePrice} por acción
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90 mb-1">Inversión en Soles</p>
            <p className="text-3xl font-bold">S/ {totalInvestedPEN.toFixed(2)} PEN</p>
            <p className="text-xs opacity-80 mt-2">
              ${totalInvestedUSD.toFixed(2)} × S/ {formData.exchangeRate} tipo de cambio
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs text-yellow-800">
              💰 <strong>Esta cantidad se deducirá de tu efectivo disponible</strong> (S/ {totalInvestedPEN.toFixed(2)})
            </p>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium"
        >
          {investment ? 'Actualizar' : 'Registrar Inversión'}
        </button>
      </div>
    </form>
  );
};

export default FormularioInversion;
