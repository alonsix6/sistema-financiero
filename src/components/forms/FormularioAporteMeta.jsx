/**
 * Formulario para aportar o retirar dinero de una meta
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import Calculations from '../../utils/calculations.js';

const FormularioAporteMeta = ({ meta, disponibleParaAhorrar, onAportar, onClose }) => {
  const [tipoOperacion, setTipoOperacion] = useState('aportar'); // 'aportar' o 'retirar'
  const [monto, setMonto] = useState('');

  const progreso = Calculations.calcularProgresoMeta(meta);
  const montoPendiente = meta.montoObjetivo - meta.montoAhorrado;

  const handleSubmit = (e) => {
    e.preventDefault();
    const montoNumerico = parseFloat(monto);

    if (tipoOperacion === 'aportar') {
      if (montoNumerico > disponibleParaAhorrar) {
        alert('No tienes suficiente dinero disponible para aportar esta cantidad.');
        return;
      }
      onAportar(montoNumerico);
    } else {
      if (montoNumerico > meta.montoAhorrado) {
        alert('No puedes retirar más de lo que tienes ahorrado en esta meta.');
        return;
      }
      onAportar(-montoNumerico);
    }
  };

  return (
    <div className="space-y-6">
      {/* Información de la Meta */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{meta.nombre}</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ahorrado:</span>
            <span className="font-bold text-green-600">S/ {meta.montoAhorrado.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Objetivo:</span>
            <span className="font-bold text-gray-800">S/ {meta.montoObjetivo.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Falta:</span>
            <span className="font-bold text-orange-600">S/ {montoPendiente.toFixed(2)}</span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{progreso.porcentaje}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progreso.porcentaje, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Dinero Disponible */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Disponible para ahorrar</p>
            <p className="text-xs text-gray-500">
              (Efectivo - Deudas de tarjetas - Dinero en otras metas)
            </p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            S/ {disponibleParaAhorrar.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Selector de Tipo de Operación */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setTipoOperacion('aportar')}
          className={`py-4 rounded-xl border-2 font-semibold transition-all ${
            tipoOperacion === 'aportar'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          Aportar
        </button>
        <button
          type="button"
          onClick={() => setTipoOperacion('retirar')}
          className={`py-4 rounded-xl border-2 font-semibold transition-all ${
            tipoOperacion === 'retirar'
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          Retirar
        </button>
      </div>

      {/* Formulario de Monto */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto a {tipoOperacion === 'aportar' ? 'aportar' : 'retirar'} (S/)
          </label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            step="0.01"
            max={tipoOperacion === 'aportar' ? disponibleParaAhorrar : meta.montoAhorrado}
            className="w-full px-4 py-3 border rounded-xl text-2xl font-bold"
            placeholder="0.00"
            required
          />
        </div>

        {/* Sugerencias de Montos */}
        {tipoOperacion === 'aportar' && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Sugerencias:</p>
            <div className="grid grid-cols-3 gap-2">
              {disponibleParaAhorrar > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setMonto((disponibleParaAhorrar * 0.25).toFixed(2))}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-semibold"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonto((disponibleParaAhorrar * 0.5).toFixed(2))}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-semibold"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonto(disponibleParaAhorrar.toFixed(2))}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-semibold"
                  >
                    Todo
                  </button>
                </>
              )}
              {montoPendiente > 0 && montoPendiente <= disponibleParaAhorrar && (
                <button
                  type="button"
                  onClick={() => setMonto(montoPendiente.toFixed(2))}
                  className="col-span-3 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-semibold"
                >
                  Completar Meta (S/ {montoPendiente.toFixed(2)})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Vista Previa */}
        {monto && parseFloat(monto) > 0 && (
          <div className={`p-4 rounded-xl border-2 ${
            tipoOperacion === 'aportar' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <p className="text-sm font-semibold text-gray-800 mb-2">Vista Previa:</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ahorrado actual:</span>
                <span className="font-semibold">S/ {meta.montoAhorrado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {tipoOperacion === 'aportar' ? 'Aporte:' : 'Retiro:'}
                </span>
                <span className={`font-semibold ${tipoOperacion === 'aportar' ? 'text-green-600' : 'text-red-600'}`}>
                  {tipoOperacion === 'aportar' ? '+' : '-'} S/ {parseFloat(monto).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-800 font-semibold">Nuevo saldo:</span>
                <span className="font-bold text-blue-600">
                  S/ {(meta.montoAhorrado + (tipoOperacion === 'aportar' ? parseFloat(monto) : -parseFloat(monto))).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Progreso:</span>
                <span className="font-semibold text-blue-600">
                  {(((meta.montoAhorrado + (tipoOperacion === 'aportar' ? parseFloat(monto) : -parseFloat(monto))) / meta.montoObjetivo) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border rounded-xl hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`flex-1 px-6 py-3 text-white rounded-xl ${
              tipoOperacion === 'aportar'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {tipoOperacion === 'aportar' ? 'Aportar' : 'Retirar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioAporteMeta;
