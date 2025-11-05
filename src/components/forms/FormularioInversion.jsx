/**
 * Formulario para agregar/editar inversiones en stocks y ETFs
 */

import React, { useState } from 'react';

const FormularioInversion = ({ investment, stockSymbol, stockName, currentPrice, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    shares: investment?.shares || '',
    purchasePrice: investment?.purchasePrice || currentPrice || '',
    purchaseDate: investment?.purchaseDate || new Date().toISOString().split('T')[0],
    notes: investment?.notes || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.shares || parseFloat(formData.shares) <= 0) {
      newErrors.shares = 'Debes ingresar una cantidad válida de acciones';
    }

    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Debes ingresar un precio de compra válido';
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
    const totalInvested = shares * purchasePrice;

    const investmentData = {
      id: investment?.id || Date.now(),
      symbol: stockSymbol,
      name: stockName,
      shares,
      purchasePrice,
      purchaseDate: formData.purchaseDate,
      totalInvested,
      notes: formData.notes,
      createdAt: investment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(investmentData);
  };

  const totalInvested = (parseFloat(formData.shares) || 0) * (parseFloat(formData.purchasePrice) || 0);

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

      {/* Cantidad de acciones */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cantidad de Acciones / Shares
        </label>
        <input
          type="number"
          name="shares"
          value={formData.shares}
          onChange={handleChange}
          step="0.001"
          min="0"
          placeholder="Ej: 10"
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
            errors.shares ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.shares && (
          <p className="text-red-600 text-sm mt-1">{errors.shares}</p>
        )}
      </div>

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
            min="0"
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
      {totalInvested > 0 && (
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Total a Invertir</p>
          <p className="text-3xl font-bold">${totalInvested.toFixed(2)}</p>
          <p className="text-xs opacity-80 mt-2">
            {formData.shares} acciones × ${formData.purchasePrice} por acción
          </p>
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
