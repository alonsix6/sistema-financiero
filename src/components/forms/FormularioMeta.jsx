/**
 * Formulario para crear/editar metas de ahorro
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { CATEGORIAS_METAS } from '../../utils/constants.js';

const FormularioMeta = ({ meta, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState(meta || {
    nombre: '',
    categoria: 'Emergencias',
    montoObjetivo: '',
    montoAhorrado: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaObjetivo: '',
    activa: true
  });

  const categoriaSeleccionada = CATEGORIAS_METAS.find(c => c.valor === formData.categoria);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: meta?.id || Date.now(),
      montoObjetivo: parseFloat(formData.montoObjetivo),
      montoAhorrado: parseFloat(formData.montoAhorrado) || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre de la Meta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Meta *</label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Ej: Fondo de Emergencias, Viaje a Europa, Nuevo Auto..."
          className="w-full px-4 py-3 border rounded-xl"
          required
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIAS_METAS.map((cat) => {
            const IconComponent = Icons[cat.iconName] || Icons.Target;
            return (
              <button
                key={cat.valor}
                type="button"
                onClick={() => setFormData({ ...formData, categoria: cat.valor })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.categoria === cat.valor
                    ? 'border-accent bg-accent/10 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <IconComponent size={28} className="mx-auto mb-1 text-gray-600" />
                <span className="text-xs font-medium">{cat.valor}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monto Objetivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Monto Objetivo (S/) *</label>
        <input
          type="number"
          value={formData.montoObjetivo}
          onChange={(e) => setFormData({ ...formData, montoObjetivo: e.target.value })}
          step="0.01"
          className="w-full px-4 py-3 border rounded-xl text-2xl font-bold"
          placeholder="0.00"
          required
        />
      </div>

      {/* Monto Ya Ahorrado (solo al crear) */}
      {!meta && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Ya tienes algo ahorrado? (Opcional)
          </label>
          <input
            type="number"
            value={formData.montoAhorrado}
            onChange={(e) => setFormData({ ...formData, montoAhorrado: e.target.value })}
            step="0.01"
            className="w-full px-4 py-3 border rounded-xl"
            placeholder="0.00"
          />
        </div>
      )}

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
          <input
            type="date"
            value={formData.fechaInicio}
            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Objetivo (Opcional)
          </label>
          <input
            type="date"
            value={formData.fechaObjetivo}
            onChange={(e) => setFormData({ ...formData, fechaObjetivo: e.target.value })}
            min={formData.fechaInicio}
            className="w-full px-4 py-3 border rounded-xl"
          />
        </div>
      </div>

      {/* Estado (solo al editar) */}
      {meta && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            id="activa"
            checked={formData.activa}
            onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
            className="w-5 h-5 text-accent rounded"
          />
          <label htmlFor="activa" className="text-sm font-medium text-gray-700 cursor-pointer">
            Meta activa (si la desactivas, no se mostrará en el dashboard)
          </label>
        </div>
      )}

      {/* Vista Previa */}
      {formData.montoObjetivo && categoriaSeleccionada && (() => {
        const PreviewIcon = Icons[categoriaSeleccionada.iconName] || Icons.Target;
        return (
          <div className={`bg-gradient-to-br ${categoriaSeleccionada.color} rounded-xl p-6 text-white`}>
            <div className="flex items-center gap-3 mb-4">
              <PreviewIcon size={40} className="text-white/90" />
              <div>
                <p className="text-sm opacity-80">Vista Previa</p>
                <p className="text-xl font-bold">{formData.nombre || 'Tu Meta'}</p>
              </div>
            </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Objetivo:</span>
              <span className="font-bold">S/ {parseFloat(formData.montoObjetivo || 0).toFixed(2)}</span>
            </div>
            {formData.fechaObjetivo && (
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Fecha objetivo:</span>
                <span className="font-semibold">
                  {new Date(formData.fechaObjetivo + 'T00:00:00').toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
        );
      })()}

      {/* Botones */}
      <div className="flex gap-3">
        {meta && (
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Estás seguro de eliminar esta meta? Esta acción no se puede deshacer.')) {
                onDelete(meta.id);
              }
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
          >
            Eliminar
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 border rounded-xl hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent/90"
        >
          {meta ? 'Actualizar' : 'Crear Meta'}
        </button>
      </div>
    </form>
  );
};

export default FormularioMeta;
