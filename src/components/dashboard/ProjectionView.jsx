/**
 * Projection View - Financial projection for 6 months
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { Card, Button, Badge, GradientCard } from '../ui';
import { PageTitle, Grid, Section } from '../layout';
import { formatCurrency } from '../../utils/constants';

const ProjectionView = ({
  proyeccion,
  proyeccionSimulada,
  efectivoDisponible,
  onOpenSimulador
}) => {
  const dataToShow = proyeccionSimulada || proyeccion;

  // Get status color for month
  const getStatusColor = (mes) => {
    if (mes.efectivo < 0) return 'danger';
    if (mes.efectivo < 1000) return 'warning';
    return 'success';
  };

  // Get gradient for month card
  const getGradient = (status) => {
    switch (status) {
      case 'danger': return 'from-red-500 to-red-600';
      case 'warning': return 'from-amber-500 to-orange-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageTitle
        title="Proyeccion Financiera"
        subtitle="Proximos 6 meses"
        action={
          <Button onClick={onOpenSimulador} icon={Icons.Wand2} variant="secondary">
            Simulador
          </Button>
        }
      />

      {/* Current Balance */}
      <Card className="glass-card bg-gradient-to-r from-accent/5 to-accent-light/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center">
            <Icons.Wallet size={28} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Efectivo Actual</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(efectivoDisponible)}
            </p>
          </div>
        </div>
      </Card>

      {/* Simulation Notice */}
      {proyeccionSimulada && (
        <Card className="glass-card bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
              <Icons.Wand2 size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-purple-900 dark:text-purple-100">
                Modo Simulacion Activo
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Los valores mostrados incluyen tu simulacion
              </p>
            </div>
            <Button onClick={onOpenSimulador} variant="ghost" size="sm">
              Modificar
            </Button>
          </div>
        </Card>
      )}

      {/* Monthly Projection */}
      <Section title="Proyeccion Mensual" icon={Icons.TrendingUp}>
        <div className="space-y-4">
          {dataToShow.meses.map((mes, idx) => {
            const status = getStatusColor(mes);
            const gradient = getGradient(status);
            const isNegative = mes.efectivo < 0;

            return (
              <Card
                key={idx}
                className={`overflow-hidden ${isNegative ? 'ring-2 ring-red-500/50' : ''}`}
                padding="none"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Month Header */}
                  <div className={`bg-gradient-to-br ${gradient} text-white p-4 md:p-6 md:w-48 flex-shrink-0`}>
                    <p className="text-sm opacity-80">
                      {new Date(mes.fecha).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">
                      {formatCurrency(mes.efectivo)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
                      {isNegative ? (
                        <>
                          <Icons.AlertTriangle size={14} />
                          Deficit
                        </>
                      ) : mes.efectivo < 1000 ? (
                        <>
                          <Icons.AlertCircle size={14} />
                          Ajustado
                        </>
                      ) : (
                        <>
                          <Icons.CheckCircle size={14} />
                          Saludable
                        </>
                      )}
                    </div>
                  </div>

                  {/* Month Details */}
                  <div className="flex-1 p-4 md:p-6 bg-white dark:bg-gray-900">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Income */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icons.ArrowUpCircle size={14} className="text-green-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Ingresos</span>
                        </div>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          +{formatCurrency(mes.ingresos)}
                        </p>
                      </div>

                      {/* Card Payments */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icons.CreditCard size={14} className="text-blue-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Tarjetas</span>
                        </div>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          -{formatCurrency(mes.pagos)}
                        </p>
                      </div>

                      {/* Installments */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icons.Calendar size={14} className="text-purple-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Cuotas</span>
                        </div>
                        <p className="font-semibold text-purple-600 dark:text-purple-400">
                          -{formatCurrency(mes.cuotas || 0)}
                        </p>
                      </div>

                      {/* Fixed Expenses */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icons.RefreshCcw size={14} className="text-orange-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Fijos</span>
                        </div>
                        <p className="font-semibold text-orange-600 dark:text-orange-400">
                          -{formatCurrency(mes.gastosFijos || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Installments Details */}
                    {mes.detalleCuotas && mes.detalleCuotas.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <Icons.List size={12} />
                          Detalle de Cuotas
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {mes.detalleCuotas.slice(0, 3).map((cuota, cuotaIdx) => (
                            <span
                              key={cuotaIdx}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"
                            >
                              {cuota.descripcion}: {formatCurrency(cuota.monto)}
                            </span>
                          ))}
                          {mes.detalleCuotas.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                              +{mes.detalleCuotas.length - 3} mas
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Summary */}
      <Section title="Resumen de Proyeccion" icon={Icons.BarChart3}>
        <Grid cols={3}>
          <Card className="glass-card text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Icons.TrendingUp size={24} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(dataToShow.meses.reduce((sum, m) => sum + m.ingresos, 0))}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos Proyectados</p>
          </Card>
          <Card className="glass-card text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Icons.TrendingDown size={24} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(dataToShow.meses.reduce((sum, m) => sum + m.pagos + (m.cuotas || 0) + (m.gastosFijos || 0), 0))}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gastos Proyectados</p>
          </Card>
          <Card className="glass-card text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
              dataToShow.meses[dataToShow.meses.length - 1]?.efectivo >= 0
                ? 'bg-accent/10'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <Icons.Wallet size={24} className={
                dataToShow.meses[dataToShow.meses.length - 1]?.efectivo >= 0
                  ? 'text-accent'
                  : 'text-red-500'
              } />
            </div>
            <p className={`text-2xl font-bold ${
              dataToShow.meses[dataToShow.meses.length - 1]?.efectivo >= 0
                ? 'text-accent'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(dataToShow.meses[dataToShow.meses.length - 1]?.efectivo || 0)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Efectivo Final (6 meses)</p>
          </Card>
        </Grid>
      </Section>

      {/* Alerts */}
      {dataToShow.meses.some(m => m.efectivo < 0) && (
        <Card className="glass-card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icons.AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-red-900 dark:text-red-100 mb-1">
                Alerta de Deficit
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                Se detectaron meses con saldo negativo en tu proyeccion.
                Considera reducir gastos o aumentar ingresos.
              </p>
              <div className="flex flex-wrap gap-2">
                {dataToShow.meses
                  .filter(m => m.efectivo < 0)
                  .map((mes, idx) => (
                    <Badge key={idx} variant="danger">
                      {new Date(mes.fecha).toLocaleDateString('es-PE', { month: 'short' })}: {formatCurrency(mes.efectivo)}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectionView;
