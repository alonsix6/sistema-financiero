/**
 * Installments View - Credit card installment purchases management
 */

import React, { useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Card, Button, Badge, ProgressBar, EmptyState } from '../ui';
import { PageTitle, Grid, Section } from '../layout';
import { formatCurrency, formatDate, BANCOS } from '../../utils/constants';

const InstallmentsView = ({
  transacciones,
  tarjetas,
  onPagarAdelantado,
  onVerHistorial
}) => {
  // Get all installment purchases
  const comprasEnCuotas = useMemo(() => {
    return transacciones
      .filter(t => t.esCuotas && t.cuotasInfo)
      .sort((a, b) => {
        // Sort by remaining installments and then by date
        if (a.cuotasInfo.cuotasRestantes === 0 && b.cuotasInfo.cuotasRestantes > 0) return 1;
        if (a.cuotasInfo.cuotasRestantes > 0 && b.cuotasInfo.cuotasRestantes === 0) return -1;
        return new Date(b.fecha) - new Date(a.fecha);
      });
  }, [transacciones]);

  // Get active installments (with remaining payments)
  const cuotasActivas = comprasEnCuotas.filter(c => c.cuotasInfo.cuotasRestantes > 0);
  const cuotasCompletadas = comprasEnCuotas.filter(c => c.cuotasInfo.cuotasRestantes === 0);

  // Calculate totals
  const totalPendiente = cuotasActivas.reduce((sum, c) =>
    sum + (c.cuotasInfo.cuotasRestantes * c.cuotasInfo.montoPorCuota), 0
  );
  const totalCuotasRestantes = cuotasActivas.reduce((sum, c) =>
    sum + c.cuotasInfo.cuotasRestantes, 0
  );

  // Get upcoming installments for next 30 days
  const cuotasProximas = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en30Dias = new Date(hoy);
    en30Dias.setDate(en30Dias.getDate() + 30);

    return cuotasActivas.flatMap(t => {
      const tarjeta = tarjetas.find(tj => tj.id === parseInt(t.metodoPago));
      return t.cuotasInfo.fechasCobro
        .filter(c => c.estado === 'pendiente' || c.estado === 'parcial')
        .map(c => ({
          ...c,
          transaccionId: t.id,
          descripcion: t.descripcion,
          tarjeta: tarjeta?.nombre || 'Tarjeta',
          tarjetaId: tarjeta?.id,
          total: t.cuotasInfo.numeroCuotas,
          fecha: new Date(c.fecha + 'T12:00:00')
        }))
        .filter(c => c.fecha >= hoy && c.fecha <= en30Dias);
    }).sort((a, b) => a.fecha - b.fecha);
  }, [cuotasActivas, tarjetas]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageTitle
        title="Cuotas"
        subtitle="Compras en cuotas sin intereses"
      />

      {/* Summary Cards */}
      <Grid cols={3}>
        <Card className="glass-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <Icons.Calendar size={24} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalCuotasRestantes}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cuotas Pendientes</p>
        </Card>
        <Card className="glass-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Icons.Wallet size={24} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalPendiente)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total por Pagar</p>
        </Card>
        <Card className="glass-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-accent/10 dark:bg-accent/20 rounded-xl flex items-center justify-center">
            <Icons.CreditCard size={24} className="text-accent" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {cuotasActivas.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Compras Activas</p>
        </Card>
      </Grid>

      {/* Upcoming Installments */}
      {cuotasProximas.length > 0 && (
        <Section title="Proximas Cuotas (30 dias)" icon={Icons.Clock}>
          <Card className="glass-card" padding="none">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {cuotasProximas.map((cuota, idx) => {
                const diasRestantes = Math.ceil((cuota.fecha - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = diasRestantes <= 7;
                const isParcial = cuota.estado === 'parcial';

                return (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isUrgent
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <Icons.Calendar size={20} className={
                          isUrgent ? 'text-red-500' : 'text-gray-500'
                        } />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {cuota.descripcion}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>Cuota {cuota.cuota}/{cuota.total}</span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1">
                            <Icons.CreditCard size={12} />
                            {cuota.tarjeta}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(isParcial ? cuota.montoPendiente : cuota.monto)}
                        {isParcial && (
                          <span className="text-xs text-amber-500 ml-1">(parcial)</span>
                        )}
                      </p>
                      <p className={`text-sm ${isUrgent ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                        {diasRestantes === 0 ? 'Hoy' :
                         diasRestantes === 1 ? 'Manana' :
                         `En ${diasRestantes} dias`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Section>
      )}

      {/* Active Installments */}
      {cuotasActivas.length === 0 ? (
        <Card className="glass-card">
          <EmptyState
            icon={Icons.Calendar}
            title="Sin compras en cuotas"
            description="Cuando registres una compra en cuotas, aparecera aqui"
          />
        </Card>
      ) : (
        <Section title="Compras en Cuotas Activas" icon={Icons.ShoppingCart}>
          <div className="space-y-4">
            {cuotasActivas.map(compra => {
              const tarjeta = tarjetas.find(t => t.id === parseInt(compra.metodoPago));
              const bancoConfig = BANCOS.find(b => b.nombre === tarjeta?.banco);
              const progreso = (compra.cuotasInfo.cuotasPagadas / compra.cuotasInfo.numeroCuotas) * 100;
              const montoPagado = compra.cuotasInfo.cuotasPagadas * compra.cuotasInfo.montoPorCuota;
              const montoPendiente = compra.cuotasInfo.cuotasRestantes * compra.cuotasInfo.montoPorCuota;

              return (
                <Card key={compra.id} className="glass-card">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                          <Icons.ShoppingCart size={20} className="text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {compra.descripcion}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {tarjeta?.nombre || 'Tarjeta'} - {formatDate(compra.fecha)}
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500 dark:text-gray-400">
                            {compra.cuotasInfo.cuotasPagadas}/{compra.cuotasInfo.numeroCuotas} cuotas pagadas
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {progreso.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-accent rounded-full transition-all duration-500"
                            style={{ width: `${progreso}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 text-right">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Por cuota</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(compra.cuotasInfo.montoPorCuota)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pendiente</p>
                        <p className="font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(montoPendiente)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onPagarAdelantado(compra)}
                        variant="primary"
                        size="sm"
                        icon={Icons.FastForward}
                      >
                        Adelantar
                      </Button>
                      <Button
                        onClick={() => onVerHistorial(compra)}
                        variant="ghost"
                        size="sm"
                        icon={Icons.History}
                      />
                    </div>
                  </div>

                  {/* Installments Timeline */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                      <Icons.List size={12} />
                      Timeline de Cuotas
                    </p>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {compra.cuotasInfo.fechasCobro.map((cuota, idx) => {
                        const isPagada = cuota.estado === 'pagada';
                        const isParcial = cuota.estado === 'parcial';
                        const isVencida = cuota.estado === 'vencida';

                        return (
                          <div
                            key={idx}
                            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                              isPagada
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                : isParcial
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                                : isVencida
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                            }`}
                            title={`Cuota ${cuota.cuota}: ${cuota.estado} - ${formatDate(cuota.fecha)}`}
                          >
                            {isPagada ? (
                              <Icons.Check size={14} />
                            ) : isParcial ? (
                              <Icons.Minus size={14} />
                            ) : isVencida ? (
                              <Icons.AlertCircle size={14} />
                            ) : (
                              cuota.cuota
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      )}

      {/* Completed Installments */}
      {cuotasCompletadas.length > 0 && (
        <Section title="Compras Completadas" icon={Icons.CheckCircle}>
          <Card className="glass-card">
            <div className="space-y-3">
              {cuotasCompletadas.slice(0, 5).map(compra => {
                const tarjeta = tarjetas.find(t => t.id === parseInt(compra.metodoPago));

                return (
                  <div
                    key={compra.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <Icons.CheckCircle size={20} className="text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {compra.descripcion}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {compra.cuotasInfo.numeroCuotas} cuotas - {tarjeta?.nombre}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(compra.monto)}
                      </p>
                      <Badge variant="success" size="sm">Completada</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Section>
      )}
    </div>
  );
};

export default InstallmentsView;
