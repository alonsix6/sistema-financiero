/**
 * Formulario para crear/editar tarjetas de crédito
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { BANCOS } from '../../utils/constants.js';

const FormularioTarjeta = ({ tarjeta, onSave, onClose, onDelete, transacciones = [] }) => {
  const [formData, setFormData] = useState(tarjeta || {
    nombre: '',
    banco: 'BCP',
    ultimos4: '',
    limite: '',
    fechaCierre: '',
    fechaPago: '',
    saldoActual: 0
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validar fechas
    const cierre = parseInt(formData.fechaCierre);
    const pago = parseInt(formData.fechaPago);

    if (isNaN(cierre) || cierre < 1 || cierre > 31) {
      newErrors.fechaCierre = { text: 'El día de cierre debe estar entre 1 y 31', isWarning: false };
    }

    if (isNaN(pago) || pago < 1 || pago > 31) {
      newErrors.fechaPago = { text: 'El día de pago debe estar entre 1 y 31', isWarning: false };
    }

    // Advertir sobre días no válidos en todos los meses
    if (cierre > 28 && !newErrors.fechaCierre) {
      newErrors.fechaCierre = { text: `El día ${cierre} no existe en todos los meses. Se ajustará automáticamente.`, isWarning: true };
    }

    if (pago > 28 && !newErrors.fechaPago) {
      newErrors.fechaPago = { text: `El día ${pago} no existe en todos los meses. Se ajustará automáticamente.`, isWarning: true };
    }

    // Validar límite
    const limite = parseFloat(formData.limite);
    if (isNaN(limite) || limite <= 0) {
      newErrors.limite = { text: 'El límite debe ser mayor a 0', isWarning: false };
    }

    setErrors(newErrors);

    // Solo bloquear si hay errores críticos (no advertencias)
    return !Object.keys(newErrors).some(key =>
      !newErrors[key].isWarning
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave({
      ...formData,
      id: tarjeta?.id || Date.now(),
      limite: parseFloat(formData.limite),
      fechaCierre: parseInt(formData.fechaCierre),
      fechaPago: parseInt(formData.fechaPago),
      saldoActual: parseFloat(tarjeta?.saldoActual || 0)
    });
  };

  const handleDelete = () => {
    if (!tarjeta) return;

    // Verificar si hay transacciones asociadas
    const transaccionesAsociadas = transacciones.filter(t =>
      (t.metodoPago && parseInt(t.metodoPago) === tarjeta.id) ||
      (t.tarjetaId && t.tarjetaId === tarjeta.id)
    );

    if (transaccionesAsociadas.length > 0) {
      const mensaje = `ADVERTENCIA: Esta tarjeta tiene ${transaccionesAsociadas.length} transacción(es) asociada(s).\n\n` +
        `Si eliminas esta tarjeta:\n` +
        `- Las transacciones NO se eliminarán\n` +
        `- Los cálculos podrían verse afectados\n` +
        `- Se perderá el historial de la tarjeta\n\n` +
        `¿Estás seguro de que quieres eliminar "${tarjeta.nombre}"?`;

      if (!confirm(mensaje)) return;
    } else {
      if (!confirm(`¿Eliminar la tarjeta "${tarjeta.nombre}"?`)) return;
    }

    onDelete(tarjeta.id);
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
            onChange={(e) => setFormData({ ...formData, ultimos4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            maxLength="4"
            placeholder="1234"
            className="w-full px-4 py-3 border rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Límite (S/) *</label>
          <input
            type="number"
            value={formData.limite}
            onChange={(e) => setFormData({ ...formData, limite: e.target.value })}
            step="0.01"
            min="0"
            className={`w-full px-4 py-3 border rounded-xl ${errors.limite && !errors.limite.isWarning ? 'border-red-500' : ''}`}
            required
          />
          {errors.limite && <p className="text-xs text-red-600 mt-1">{errors.limite.text}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Día Cierre *</label>
          <input
            type="number"
            value={formData.fechaCierre}
            onChange={(e) => setFormData({ ...formData, fechaCierre: e.target.value })}
            min="1"
            max="31"
            placeholder="15"
            className={`w-full px-4 py-3 border rounded-xl ${errors.fechaCierre && !errors.fechaCierre.isWarning ? 'border-red-500' : ''}`}
            required
          />
          {errors.fechaCierre && (
            <p className={`text-xs mt-1 ${errors.fechaCierre.isWarning ? 'text-yellow-600' : 'text-red-600'}`}>
              {errors.fechaCierre.text}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Día Pago *</label>
          <input
            type="number"
            value={formData.fechaPago}
            onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
            min="1"
            max="31"
            placeholder="5"
            className={`w-full px-4 py-3 border rounded-xl ${errors.fechaPago && !errors.fechaPago.isWarning ? 'border-red-500' : ''}`}
            required
          />
          {errors.fechaPago && (
            <p className={`text-xs mt-1 ${errors.fechaPago.isWarning ? 'text-yellow-600' : 'text-red-600'}`}>
              {errors.fechaPago.text}
            </p>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
        <Icons.Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800">
          <strong>Nota:</strong> Si configuras un día mayor a 28, el sistema ajustará automáticamente la fecha en meses que no tengan ese día (ej: 31 en febrero se ajustará al último día del mes).
        </p>
      </div>

      {tarjeta && (
        <div className="pt-4 border-t">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium"
          >
            <Icons.Trash2 size={18} className="inline mr-2" />Eliminar Tarjeta
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
