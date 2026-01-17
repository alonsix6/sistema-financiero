/**
 * Home View - Dashboard overview with stats and quick actions
 */

import React, { useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Card, GradientCard, StatCard, Button, Badge, ProgressRing } from '../ui';
import { Section, Grid } from '../layout';
import { CATEGORIAS, formatCurrency, formatDate } from '../../utils/constants';

const HomeView = ({
  userData,
  resumen,
  cashflowTotal,
  efectivoDisponible,
  proximosPagos,
  gastosPorCategoria,
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  onFilterThisMonth,
  onAddTransaction,
  onPayCard,
  darkMode
}) => {
  // Calculate totals for the chart
  const totalGastos = useMemo(() => {
    return Object.values(gastosPorCategoria).reduce((sum, val) => sum + val, 0);
  }, [gastosPorCategoria]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Period Filter */}
      <Card className="glass-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
            <Icons.Calendar size={20} className="text-accent" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Filtrar Periodo
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => onFechaInicioChange(e.target.value)}
              className="input-glass"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => onFechaFinChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="input-glass"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={onFilterThisMonth}
              variant="secondary"
              fullWidth
              icon={Icons.CalendarCheck}
            >
              Este Mes
            </Button>
          </div>
        </div>
      </Card>

      {/* Period Summary */}
      <Section title="Resumen del Periodo" icon={Icons.BarChart3}>
        <Grid cols={4} gap={4}>
          <StatCard
            label="Ingresos"
            value={formatCurrency(resumen.ingresos)}
            icon={Icons.ArrowUpCircle}
            gradient="green"
          />
          <StatCard
            label="Gastos"
            value={formatCurrency(resumen.gastos)}
            icon={Icons.ArrowDownCircle}
            gradient="pink"
          />
          <StatCard
            label="Balance"
            value={formatCurrency(resumen.balance)}
            icon={Icons.Wallet}
            gradient={resumen.balance >= 0 ? 'accent' : 'orange'}
          />
          <StatCard
            label="Tasa de Ahorro"
            value={`${resumen.tasaAhorro}%`}
            icon={Icons.Percent}
            gradient="purple"
          />
        </Grid>
      </Section>

      {/* Available Cash */}
      <Section>
        <GradientCard gradient="green" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 flex items-center gap-2 mb-2">
                <Icons.Wallet size={16} />
                Efectivo Disponible
              </p>
              <p className="text-4xl md:text-5xl font-bold mb-2">
                {formatCurrency(efectivoDisponible)}
              </p>
              <p className="text-sm opacity-80 flex items-center gap-2">
                <Icons.CheckCircle size={14} />
                Dinero que puedes mover ahora
              </p>
            </div>
            <div className="hidden md:block">
              <ProgressRing
                value={efectivoDisponible > 0 ? 100 : 0}
                max={100}
                size={100}
                strokeWidth={8}
                color="#ffffff"
                bgColor="rgba(255,255,255,0.2)"
              >
                <Icons.Banknote size={32} className="text-white/80" />
              </ProgressRing>
            </div>
          </div>
        </GradientCard>
      </Section>

      {/* Total Cashflow */}
      <Section title="Cashflow Total" subtitle="Todo el historico" icon={Icons.Activity}>
        <Grid cols={3}>
          <GradientCard gradient="green">
            <p className="text-sm opacity-80 mb-1">Total Ingresos</p>
            <p className="text-2xl md:text-3xl font-bold">
              {formatCurrency(cashflowTotal.ingresosTotal)}
            </p>
          </GradientCard>
          <GradientCard gradient="purple">
            <p className="text-sm opacity-80 mb-1">Total Gastos</p>
            <p className="text-2xl md:text-3xl font-bold">
              {formatCurrency(cashflowTotal.gastosTotal)}
            </p>
          </GradientCard>
          <GradientCard gradient={cashflowTotal.cashflowNeto >= 0 ? 'teal' : 'orange'}>
            <p className="text-sm opacity-80 mb-1">Cashflow Neto</p>
            <p className="text-2xl md:text-3xl font-bold">
              {formatCurrency(cashflowTotal.cashflowNeto)}
            </p>
            <p className="text-xs opacity-80 mt-2 flex items-center gap-1">
              {cashflowTotal.cashflowNeto >= 0 ? (
                <>
                  <Icons.TrendingUp size={12} />
                  Superavit
                </>
              ) : (
                <>
                  <Icons.TrendingDown size={12} />
                  Deficit
                </>
              )}
            </p>
          </GradientCard>
        </Grid>
      </Section>

      {/* Upcoming Card Payments */}
      {proximosPagos.length > 0 && (
        <Section title="Proximos Pagos" icon={Icons.CreditCard}>
          <Card className="glass-card" padding="none">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {proximosPagos.map((pago, idx) => {
                const urgencyConfig = {
                  alta: { color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: Icons.AlertCircle, iconColor: 'text-red-500' },
                  media: { color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: Icons.Clock, iconColor: 'text-amber-500' },
                  baja: { color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', icon: Icons.CheckCircle, iconColor: 'text-green-500' }
                };
                const config = urgencyConfig[pago.urgencia];
                const UrgencyIcon = config.icon;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 ${config.color} first:rounded-t-3xl last:rounded-b-3xl border-l-4`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${config.color}`}>
                        <UrgencyIcon size={20} className={config.iconColor} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {pago.tarjeta}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {pago.diasRestantes === 0 ? 'HOY' :
                           pago.diasRestantes === 1 ? 'Manana' :
                           `En ${pago.diasRestantes} dias`} - {pago.fecha.toLocaleDateString('es-PE')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(pago.saldo)}
                        </p>
                      </div>
                      <Button
                        onClick={() => onPayCard(pago.tarjetaId)}
                        variant="ghost"
                        size="sm"
                        icon={Icons.CreditCard}
                      >
                        Pagar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Section>
      )}

      {/* Expenses by Category */}
      {Object.keys(gastosPorCategoria).length > 0 && (
        <Section title="Gastos por Categoria" subtitle="Periodo seleccionado" icon={Icons.PieChart}>
          <Card className="glass-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories List */}
              <div className="space-y-3">
                {Object.entries(gastosPorCategoria)
                  .sort(([, a], [, b]) => b - a)
                  .map(([categoria, monto]) => {
                    const categoriaConfig = CATEGORIAS.find(c => c.valor === categoria) || CATEGORIAS[CATEGORIAS.length - 1];
                    const IconComponent = Icons[categoriaConfig.iconName] || Icons.MoreHorizontal;
                    const percentage = totalGastos > 0 ? (monto / totalGastos) * 100 : 0;

                    return (
                      <div key={categoria} className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${categoriaConfig.color}20` }}
                        >
                          <IconComponent size={18} style={{ color: categoriaConfig.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {categoria}
                            </span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatCurrency(monto)}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: categoriaConfig.color
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Summary */}
              <div className="flex flex-col items-center justify-center p-6">
                <ProgressRing
                  value={100}
                  max={100}
                  size={160}
                  strokeWidth={12}
                  color="#FF2D55"
                  bgColor={darkMode ? '#374151' : '#E5E7EB'}
                >
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalGastos)}
                    </p>
                  </div>
                </ProgressRing>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {Object.keys(gastosPorCategoria).length} categorias
                </p>
              </div>
            </div>
          </Card>
        </Section>
      )}

      {/* Quick Actions */}
      <Section title="Acciones Rapidas" icon={Icons.Zap}>
        <Grid cols={2}>
          <Card
            className="glass-card-hover cursor-pointer text-center"
            onClick={() => onAddTransaction('Gasto')}
            hover
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
              <Icons.ArrowDownCircle size={32} className="text-red-500" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              Registrar Gasto
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Agregar un nuevo gasto
            </p>
          </Card>
          <Card
            className="glass-card-hover cursor-pointer text-center"
            onClick={() => onAddTransaction('Ingreso')}
            hover
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
              <Icons.ArrowUpCircle size={32} className="text-green-500" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              Registrar Ingreso
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Agregar un nuevo ingreso
            </p>
          </Card>
        </Grid>
      </Section>
    </div>
  );
};

export default HomeView;
