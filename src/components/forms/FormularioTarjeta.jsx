/**
 * Formulario para crear/editar tarjetas de crédito
 */

import React, { useState } from 'react';
import { BANCOS } from '../../utils/constants.js';

const FormularioTarjeta = ({ tarjeta, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState(tarjeta || {
    nombre: '',
    banco: 'BCP',
    ultimos4: '',
    limite: '',
    fechaCierre: '',
    fechaPago: '',
    saldoActual: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: tarjeta?.id || Date.now(),
      limite: parseFloat(formData.limite),
      fechaCierre: parseInt(formData.fechaCierre),
      fechaPago: parseInt(formData.fechaPago),
      saldoActual: parseFloat(tarjeta?.saldoActual || 0)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Banco *</label>
          <select
            value={formData.banco}
            onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          >
            {BANCOS.map(b => <option key={b.nombre} value={b.nombre}>{b.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Últimos 4</label>
          <input
            type="text"
            value={formData.ultimos4}
            onChange={(e) => setFormData({ ...formData, ultimos4: e.target.value })}
            maxLength="4"
            className="w-full px-4 py-3 border rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Límite (S/) *</label>
          <input
            type="number"
            value={formData.limite}
            onChange={(e) => setFormData({ ...formData, limite: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Día Cierre *</label>
          <input
            type="number"
            value={formData.fechaCierre}
            onChange={(e) => setFormData({ ...formData, fechaCierre: e.target.value })}
            min="1"
            max="31"
            className="w-full px-4 py-3 border rounded-xl"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Día Pago *</label>
          <input
            type="number"
            value={formData.fechaPago}
            onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
            min="1"
            max="31"
            className="w-full px-4 py-3 border rounded-xl"
            required
          />
        </div>
      </div>

      {tarjeta && (
        <div className="pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              if (confirm(`¿Eliminar la tarjeta "${tarjeta.nombre}"?`)) onDelete(tarjeta.id);
            }}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium"
          >
            🗑️ Eliminar Tarjeta
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border rounded-xl">
          Cancelar
        </button>
        <button type="submit" className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl">
          Guardar
        </button>
      </div>
    </form>
  );
};

export default FormularioTarjeta;
