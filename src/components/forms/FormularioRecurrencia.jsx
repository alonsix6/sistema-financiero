/**
 * Formulario para crear/editar recurrencias (pagos e ingresos automáticos)
 */

import React, { useState } from 'react';
import { CATEGORIAS } from '../../utils/constants.js';

const FormularioRecurrencia = ({ recurrencia, tarjetas, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState(recurrencia || {
    tipo: 'gasto',
    descripcion: '',
    monto: '',
    dia: '',
    categoria: 'Alimentación',
    tarjetaId: 'Efectivo',
    activo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: recurrencia?.id || Date.now(),
      monto: parseFloat(formData.monto),
      dia: parseInt(formData.dia)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          >
            <option value="ingreso">💰 Ingreso</option>
            <option value="gasto">💸 Gasto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Día del Mes *</label>
          <input
            type="number"
            value={formData.dia}
            onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
            min="1"
            max="31"
            className="w-full px-4 py-3 border rounded-xl"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
        <input
          type="text"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Ej: Salario Empresa X, Netflix, etc."
          className="w-full px-4 py-3 border rounded-xl"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Monto (S/) *</label>
        <input
          type="number"
          value={formData.monto}
          onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
          step="0.01"
          className="w-full px-4 py-3 border rounded-xl"
          required
        />
      </div>

      {formData.tipo === 'gasto' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl"
            >
              {CATEGORIAS.map(c => (
                <option key={c.valor} value={c.valor}>{c.icono} {c.valor}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
            <select
              value={formData.tarjetaId}
              onChange={(e) => setFormData({ ...formData, tarjetaId: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl"
            >
              <option value="Efectivo">💵 Efectivo</option>
              {tarjetas.map(t => (
                <option key={t.id} value={t.id}>💳 {t.nombre}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="activo"
          checked={formData.activo}
          onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
          className="w-5 h-5 text-blue-600"
        />
        <label htmlFor="activo" className="text-sm font-medium text-gray-700">
          Activo (se registrará automáticamente)
        </label>
      </div>

      {recurrencia && (
        <div className="pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Eliminar esta recurrencia?')) onDelete(recurrencia.id);
            }}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium"
          >
            🗑️ Eliminar Recurrencia
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border rounded-xl">
          Cancelar
        </button>
        <button type="submit" className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl">
          {recurrencia ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default FormularioRecurrencia;
