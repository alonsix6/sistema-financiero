/**
 * Recurrences View - Recurring payments and income management
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { Card, Button, Badge, EmptyState } from '../ui';
import { PageTitle, Grid } from '../layout';
import { CATEGORIAS, formatCurrency } from '../../utils/constants';

const RecurrencesView = ({
  recurrencias,
  tarjetas,
  onAddRecurrencia,
  onEditRecurrencia
}) => {
  // Separate income and expense recurrences
  const ingresos = recurrencias.filter(r => r.tipo === 'ingreso');
  const gastos = recurrencias.filter(r => r.tipo === 'gasto');

  // Calculate totals
  const totalIngresosActivos = ingresos.filter(r => r.activo).reduce((sum, r) => sum + r.monto, 0);
  const totalGastosActivos = gastos.filter(r => r.activo).reduce((sum, r) => sum + r.monto, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageTitle
        title="Recurrencias"
        subtitle="Pagos e ingresos automaticos"
        action={
          <Button onClick={onAddRecurrencia} icon={Icons.Plus}>
            Nueva Recurrencia
          </Button>
        }
      />

      {/* Info Card */}
      <Card className="glass-card bg-accent/10 dark:bg-accent/20 border border-accent/20 dark:border-accent/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/10 dark:bg-accent/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icons.Info size={20} className="text-accent" />
          </div>
          <div>
            <p className="font-semibold text-accent dark:text-accent-light">
              Las recurrencias se procesan automaticamente
            </p>
            <p className="text-sm text-accent dark:text-accent/70">
              Cuando llega el dia configurado, la transaccion se registra automaticamente.
              No necesitas agregarlas manualmente.
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <Grid cols={3}>
        <Card className="glass-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Icons.ArrowUpCircle size={24} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalIngresosActivos)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos Mensuales</p>
          <p className="text-xs text-gray-400 mt-1">{ingresos.filter(r => r.activo).length} activos</p>
        </Card>
        <Card className="glass-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Icons.ArrowDownCircle size={24} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalGastosActivos)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gastos Mensuales</p>
          <p className="text-xs text-gray-400 mt-1">{gastos.filter(r => r.activo).length} activos</p>
        </Card>
        <Card className="glass-card text-center">
          <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
            totalIngresosActivos - totalGastosActivos >= 0
              ? 'bg-accent/10'
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            <Icons.Scale size={24} className={
              totalIngresosActivos - totalGastosActivos >= 0
                ? 'text-accent'
                : 'text-red-500'
            } />
          </div>
          <p className={`text-2xl font-bold ${
            totalIngresosActivos - totalGastosActivos >= 0
              ? 'text-accent'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(totalIngresosActivos - totalGastosActivos)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Balance Recurrente</p>
        </Card>
      </Grid>

      {recurrencias.length === 0 ? (
        <Card className="glass-card">
          <EmptyState
            icon={Icons.RefreshCcw}
            title="Sin recurrencias configuradas"
            description="Agrega salarios, suscripciones y otros pagos automaticos"
            action={
              <Button onClick={onAddRecurrencia} icon={Icons.Plus}>
                Crear Recurrencia
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Income Recurrences */}
          {ingresos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.ArrowUpCircle size={20} className="text-green-500" />
                Ingresos Recurrentes ({ingresos.length})
              </h3>
              <Grid cols={2}>
                {ingresos.map(rec => (
                  <RecurrenceCard
                    key={rec.id}
                    recurrencia={rec}
                    tarjetas={tarjetas}
                    onEdit={() => onEditRecurrencia(rec)}
                    type="income"
                  />
                ))}
              </Grid>
            </div>
          )}

          {/* Expense Recurrences */}
          {gastos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.ArrowDownCircle size={20} className="text-red-500" />
                Gastos Recurrentes ({gastos.length})
              </h3>
              <Grid cols={2}>
                {gastos.map(rec => (
                  <RecurrenceCard
                    key={rec.id}
                    recurrencia={rec}
                    tarjetas={tarjetas}
                    onEdit={() => onEditRecurrencia(rec)}
                    type="expense"
                  />
                ))}
              </Grid>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Recurrence Card Component
const RecurrenceCard = ({ recurrencia, tarjetas, onEdit, type }) => {
  const isIncome = type === 'income';
  const categoriaConfig = CATEGORIAS.find(c => c.valor === recurrencia.categoria);
  const IconComponent = isIncome
    ? Icons.Briefcase
    : Icons[categoriaConfig?.iconName] || Icons.Receipt;

  const tarjeta = recurrencia.tarjetaId && recurrencia.tarjetaId !== 'Efectivo'
    ? tarjetas.find(t => t.id === parseInt(recurrencia.tarjetaId))
    : null;

  return (
    <Card
      className={`glass-card border-l-4 ${
        !recurrencia.activo
          ? 'border-gray-300 opacity-60'
          : isIncome
          ? 'border-green-500'
          : 'border-red-500'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isIncome
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            <IconComponent
              size={24}
              className={isIncome ? 'text-green-600' : 'text-red-600'}
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {recurrencia.descripcion}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cada dia <span className="font-bold">{recurrencia.dia}</span> del mes
            </p>
          </div>
        </div>
        <Badge variant={recurrencia.activo ? 'success' : 'neutral'}>
          {recurrencia.activo ? (
            <>
              <Icons.CheckCircle size={12} className="mr-1" />
              Activo
            </>
          ) : (
            'Inactivo'
          )}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Monto</span>
          <span className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '-'} {formatCurrency(recurrencia.monto)}
          </span>
        </div>
        {!isIncome && (
          <>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Categoria</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {recurrencia.categoria}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Metodo</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                {tarjeta ? (
                  <>
                    <Icons.CreditCard size={14} className="text-accent" />
                    {tarjeta.nombre}
                  </>
                ) : (
                  <>
                    <Icons.Banknote size={14} className="text-green-500" />
                    Efectivo
                  </>
                )}
              </span>
            </div>
          </>
        )}
      </div>

      <Button
        onClick={onEdit}
        variant="ghost"
        fullWidth
        icon={Icons.Edit}
      >
        Editar
      </Button>
    </Card>
  );
};

export default RecurrencesView;
