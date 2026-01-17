/**
 * Formulario para crear/editar transacciones (ingresos y gastos)
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {tipo === 'Gasto' ? 'Categoria' : 'Tipo'} *
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {(tipo === 'Gasto' ? CATEGORIAS : TIPOS_INGRESO).map((cat) => {
            const IconComponent = Icons[cat.iconName] || Icons.MoreHorizontal;
            return (
              <button
                key={cat.valor}
                type="button"
                onClick={() => setFormData({ ...formData, categoria: cat.valor })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.categoria === cat.valor
                    ? 'border-accent bg-accent/10 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div
                  className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <IconComponent size={20} style={{ color: cat.color }} />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.valor}</span>
              </button>
            );
          })}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metodo de Pago *</label>
            <select
              value={formData.metodoPago}
              onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value, pagarEnCuotas: false })}
              className="input-glass"
            >
              <option value="Efectivo">Efectivo</option>
              {tarjetas.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          {formData.metodoPago !== 'Efectivo' && !transaccionEditar && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pagarEnCuotas}
                  onChange={(e) => setFormData({ ...formData, pagarEnCuotas: e.target.checked })}
                  className="w-5 h-5 text-accent rounded"
                />
                <div className="flex items-center gap-2">
                  <Icons.Calendar size={18} className="text-accent" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pagar en cuotas</span>
                </div>
              </label>

              {formData.pagarEnCuotas && (
                <>
                  <label className="flex items-center gap-3 cursor-pointer mt-3 ml-8">
                    <input
                      type="checkbox"
                      checked={formData.tieneIntereses}
                      onChange={(e) => setFormData({ ...formData, tieneIntereses: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="text-sm flex items-center gap-2">
                      {formData.tieneIntereses ? (
                        <>
                          <Icons.TrendingUp size={16} className="text-amber-600" />
                          Con intereses (TEA)
                        </>
                      ) : (
                        <>
                          <Icons.Sparkles size={16} className="text-green-600" />
                          Sin intereses
                        </>
                      )}
                    </span>
                  </label>

                  {formData.tieneIntereses && (
                    <div className="mt-3 ml-8 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                      <label className="block text-sm font-semibold mb-2 text-amber-900 dark:text-amber-200">
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
                          className="w-24 px-3 py-2 border-2 border-amber-300 dark:border-amber-700 rounded-lg text-lg font-bold focus:border-amber-500 bg-white dark:bg-gray-800"
                        />
                        <span className="text-sm font-bold text-amber-900 dark:text-amber-200">%</span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 flex items-center gap-1">
                        <Icons.Info size={12} />
                        TEA tipica en Peru: 40-90% para tarjetas de credito
                      </p>
                    </div>
                  )}
                </>
              )}

              {formData.pagarEnCuotas && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Numero de cuotas:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {opcionesCuotas.map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setFormData({ ...formData, numeroCuotas: n })}
                          className={`py-2.5 rounded-lg font-semibold transition-all ${
                            formData.numeroCuotas === n
                              ? 'bg-accent text-white shadow-md'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                          <Icons.BarChart3 size={16} className="text-accent" />
                          Vista Previa de Cuotas
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <Icons.CreditCard size={14} />
                              Cuota mensual
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              S/ {cuotasData.montoPorCuota.toFixed(2)}
                            </span>
                          </div>

                          {formData.tieneIntereses && (
                            <>
                              <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                                <span className="flex items-center gap-2">
                                  <Icons.TrendingUp size={14} />
                                  Total con intereses
                                </span>
                                <span className="font-bold">S/ {cuotasData.montoTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                                <span className="flex items-center gap-2">
                                  <Icons.Coins size={14} />
                                  Intereses totales
                                </span>
                                <span className="font-bold">S/ {cuotasData.interesTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                                <span className="flex items-center gap-2">
                                  <Icons.Percent size={14} />
                                  TEA aplicada
                                </span>
                                <span className="font-bold">{formData.tea.toFixed(1)}%</span>
                              </div>
                            </>
                          )}

                          {!formData.tieneIntereses && (
                            <div className="flex justify-between items-center text-green-700 dark:text-green-400">
                              <span className="flex items-center gap-2">
                                <Icons.Sparkles size={14} />
                                Total a pagar
                              </span>
                              <span className="font-bold">S/ {cuotasData.montoTotal.toFixed(2)}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <Icons.CalendarCheck size={14} />
                              Primera cuota
                            </span>
                            <span className="font-semibold text-accent">{calcularPrimeraCuota()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <Icons.CalendarX size={14} />
                              Ultima cuota
                            </span>
                            <span className="font-semibold text-accent">{calcularUltimaCuota()}</span>
                          </div>
                        </div>
                        <div className={`mt-3 p-3 rounded-lg border flex items-start gap-2 ${formData.tieneIntereses ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'}`}>
                          <Icons.AlertTriangle size={16} className={formData.tieneIntereses ? 'text-amber-600 flex-shrink-0 mt-0.5' : 'text-yellow-600 flex-shrink-0 mt-0.5'} />
                          <p className={`text-xs ${formData.tieneIntereses ? 'text-amber-800 dark:text-amber-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                            Se bloqueara {formData.tieneIntereses ? `S/ ${cuotasData.montoTotal.toFixed(2)}` : `S/ ${monto.toFixed(2)}`} de tu linea de credito
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

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Icons.X size={18} />
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-accent to-accent-light text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Icons.Check size={18} />
          {transaccionEditar ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>
  );
};

export default FormularioTransaccion;
