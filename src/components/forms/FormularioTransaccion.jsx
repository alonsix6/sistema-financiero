/**
 * Formulario para crear/editar transacciones (ingresos y gastos)
 */

import React, { useState } from 'react';
import { CATEGORIAS, TIPOS_INGRESO } from '../../utils/constants.js';
import Calculations from '../../utils/calculations.js';

const FormularioTransaccion = ({ tipo, tarjetas, onSave, onClose, transaccionEditar }) => {
  const [formData, setFormData] = useState(transaccionEditar || {
    monto: '',
    categoria: tipo === 'Gasto' ? 'Alimentación' : 'Salario',
    descripcion: '',
    metodoPago: 'Efectivo',
    fecha: new Date().toISOString().split('T')[0],
    tipo,
    pagarEnCuotas: false,
    numeroCuotas: 12,
    tieneIntereses: false,
    tea: 60
  });

  const opcionesCuotas = [2, 3, 6, 12, 18, 24, 36];
  const tarjetaSeleccionada = tarjetas.find(t => t.id === parseInt(formData.metodoPago));

  const calcularPrimeraCuota = () => {
    if (!tarjetaSeleccionada || !formData.fecha) return '-';
    const fecha = new Date(formData.fecha + 'T12:00:00');
    fecha.setMonth(fecha.getMonth() + 1);
    const fechaCobro = Calculations.calcularFechaCobro(
      fecha.toISOString().split('T')[0],
      tarjetaSeleccionada.fechaCierre,
      tarjetaSeleccionada.fechaPago
    );
    return fechaCobro.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calcularUltimaCuota = () => {
    if (!tarjetaSeleccionada || !formData.fecha || !formData.numeroCuotas) return '-';
    const fecha = new Date(formData.fecha + 'T12:00:00');
    fecha.setMonth(fecha.getMonth() + formData.numeroCuotas);
    const fechaCobro = Calculations.calcularFechaCobro(
      fecha.toISOString().split('T')[0],
      tarjetaSeleccionada.fechaCierre,
      tarjetaSeleccionada.fechaPago
    );
    return fechaCobro.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transaccion = {
      ...formData,
      id: transaccionEditar?.id || Date.now(),
      monto: parseFloat(formData.monto)
    };

    // Validación de límite de crédito para gastos con tarjeta
    if (transaccion.tipo === 'Gasto' && transaccion.metodoPago !== 'Efectivo') {
      const disponible = tarjetaSeleccionada.limite - tarjetaSeleccionada.saldoActual;

      if (transaccion.monto > disponible) {
        alert(`⚠️ Límite de crédito excedido\n\nDisponible: S/ ${disponible.toFixed(2)}\nMonto: S/ ${transaccion.monto.toFixed(2)}\nFaltante: S/ ${(transaccion.monto - disponible).toFixed(2)}\n\n💡 Necesitas pagar tu tarjeta o reducir el monto.`);
        return;
      }
    }

    // Si es compra en cuotas, agregar información adicional
    if (transaccion.tipo === 'Gasto' && transaccion.pagarEnCuotas && transaccion.metodoPago !== 'Efectivo') {
      const cuotasData = Calculations.crearTransaccionConCuotas(
        transaccion,
        formData.numeroCuotas,
        tarjetaSeleccionada,
        formData.tieneIntereses,
        formData.tea
      );
      onSave(cuotasData);
    } else {
      // Transacción normal sin cuotas
      delete transaccion.pagarEnCuotas;
      delete transaccion.numeroCuotas;
      delete transaccion.tieneIntereses;
      delete transaccion.tea;
      onSave(transaccion);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Monto (S/) *</label>
        <input
          type="number"
          value={formData.monto}
          onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
          step="0.01"
          className="w-full px-4 py-3 border rounded-xl text-2xl font-bold"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {tipo === 'Gasto' ? 'Categoría' : 'Tipo'} *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(tipo === 'Gasto' ? CATEGORIAS : TIPOS_INGRESO).map((cat) => (
            <button
              key={cat.valor}
              type="button"
              onClick={() => setFormData({ ...formData, categoria: cat.valor })}
              className={`p-4 rounded-xl border-2 ${
                formData.categoria === cat.valor ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <span className="text-3xl block">{cat.icono}</span>
              <span className="text-xs">{cat.valor}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
        <input
          type="text"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          className="w-full px-4 py-3 border rounded-xl"
          required
        />
      </div>

      {tipo === 'Gasto' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
            <select
              value={formData.metodoPago}
              onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value, pagarEnCuotas: false })}
              className="w-full px-4 py-3 border rounded-xl"
            >
              <option value="Efectivo">💵 Efectivo</option>
              {tarjetas.map(t => (
                <option key={t.id} value={t.id}>💳 {t.nombre}</option>
              ))}
            </select>
          </div>

          {formData.metodoPago !== 'Efectivo' && !transaccionEditar && (
            <div className="border-t pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pagarEnCuotas}
                  onChange={(e) => setFormData({ ...formData, pagarEnCuotas: e.target.checked })}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">💳 Pagar en cuotas</span>
              </label>

              {formData.pagarEnCuotas && (
                <>
                  <label className="flex items-center gap-3 cursor-pointer mt-3 ml-8">
                    <input
                      type="checkbox"
                      checked={formData.tieneIntereses}
                      onChange={(e) => setFormData({ ...formData, tieneIntereses: e.target.checked })}
                      className="w-4 h-4 text-amber-600"
                    />
                    <span className="text-sm">
                      {formData.tieneIntereses ? '📈 Con intereses (TEA)' : '✨ Sin intereses'}
                    </span>
                  </label>

                  {formData.tieneIntereses && (
                    <div className="mt-3 ml-8 bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <label className="block text-sm font-semibold mb-2 text-amber-900">
                        Tasa Efectiva Anual (TEA)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.1"
                          value={formData.tea}
                          onChange={(e) => setFormData({ ...formData, tea: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-3 py-2 border-2 border-amber-300 rounded-lg text-lg font-bold focus:border-amber-500"
                        />
                        <span className="text-sm font-bold text-amber-900">%</span>
                      </div>
                      <p className="text-xs text-amber-700 mt-2">
                        ℹ️ TEA típica en Perú: 40-90% para tarjetas de crédito
                      </p>
                    </div>
                  )}
                </>
              )}

              {formData.pagarEnCuotas && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Número de cuotas:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {opcionesCuotas.map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setFormData({ ...formData, numeroCuotas: n })}
                          className={`py-2.5 rounded-lg font-semibold transition-all ${
                            formData.numeroCuotas === n
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {n}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.monto && formData.numeroCuotas && (() => {
                    const monto = parseFloat(formData.monto);
                    let cuotasData;

                    if (formData.tieneIntereses && formData.tea > 0) {
                      cuotasData = Calculations.calcularCuotaConIntereses(monto, formData.tea, formData.numeroCuotas);
                    } else {
                      const montoPorCuota = Math.round((monto / formData.numeroCuotas) * 100) / 100;
                      cuotasData = {
                        montoPorCuota: montoPorCuota,
                        montoTotal: monto,
                        interesTotal: 0
                      };
                    }

                    return (
                      <div className="p-4 bg-white rounded-lg border border-blue-200">
                        <p className="text-sm font-bold text-gray-800 mb-3">📊 Vista Previa de Cuotas:</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">💳 Cuota mensual:</span>
                            <span className="font-bold text-gray-900">
                              S/ {cuotasData.montoPorCuota.toFixed(2)}
                            </span>
                          </div>

                          {formData.tieneIntereses && (
                            <>
                              <div className="flex justify-between text-amber-700">
                                <span>📈 Total con intereses:</span>
                                <span className="font-bold">S/ {cuotasData.montoTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-amber-700">
                                <span>💰 Intereses totales:</span>
                                <span className="font-bold">S/ {cuotasData.interesTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-amber-700">
                                <span>📊 TEA aplicada:</span>
                                <span className="font-bold">{formData.tea.toFixed(1)}%</span>
                              </div>
                            </>
                          )}

                          {!formData.tieneIntereses && (
                            <div className="flex justify-between text-green-700">
                              <span>✨ Total a pagar:</span>
                              <span className="font-bold">S/ {cuotasData.montoTotal.toFixed(2)}</span>
                            </div>
                          )}

                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-gray-600">📅 Primera cuota:</span>
                            <span className="font-semibold text-blue-600">{calcularPrimeraCuota()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">📅 Última cuota:</span>
                            <span className="font-semibold text-blue-600">{calcularUltimaCuota()}</span>
                          </div>
                        </div>
                        <div className={`mt-3 p-2 rounded border ${formData.tieneIntereses ? 'bg-amber-50 border-amber-200' : 'bg-yellow-50 border-yellow-200'}`}>
                          <p className={`text-xs ${formData.tieneIntereses ? 'text-amber-800' : 'text-yellow-800'}`}>
                            ⚠️ Se bloqueará {formData.tieneIntereses ? `S/ ${cuotasData.montoTotal.toFixed(2)}` : `S/ ${monto.toFixed(2)}`} de tu línea de crédito
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
        <input
          type="date"
          value={formData.fecha}
          onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border rounded-xl"
        />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border rounded-xl">
          Cancelar
        </button>
        <button type="submit" className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl">
          {transaccionEditar ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>
  );
};

export default FormularioTransaccion;
