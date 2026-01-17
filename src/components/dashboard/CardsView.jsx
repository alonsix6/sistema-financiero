/**
 * Cards View - Credit card management
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { Card, Button, Badge, ProgressBar, EmptyState } from '../ui';
import { PageTitle, Grid } from '../layout';
import { BANCOS, formatCurrency } from '../../utils/constants';

const CardsView = ({
  tarjetas,
  transacciones,
  onAddCard,
  onEditCard,
  onPayCard,
  onAddExpense
}) => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageTitle
        title="Mis Tarjetas"
        action={
          <Button onClick={onAddCard} icon={Icons.Plus}>
            Nueva Tarjeta
          </Button>
        }
      />

      {tarjetas.length === 0 ? (
        <Card className="glass-card">
          <EmptyState
            icon={Icons.CreditCard}
            title="No tienes tarjetas"
            description="Agrega tu primera tarjeta de credito para comenzar a trackear tus gastos"
            action={
              <Button onClick={onAddCard} icon={Icons.Plus}>
                Agregar Tarjeta
              </Button>
            }
          />
        </Card>
      ) : (
        <Grid cols={2}>
          {tarjetas.map(tarjeta => {
            const utilizacion = tarjeta.limite > 0 ? (tarjeta.saldoActual / tarjeta.limite) * 100 : 0;
            const disponible = tarjeta.limite - tarjeta.saldoActual;
            const bancoConfig = BANCOS.find(b => b.nombre === tarjeta.banco) || BANCOS[BANCOS.length - 1];
            const BankIcon = Icons[bancoConfig.iconName] || Icons.CreditCard;

            // Get installment purchases for this card
            const comprasEnCuotas = transacciones.filter(t =>
              t.esCuotas &&
              parseInt(t.metodoPago) === tarjeta.id &&
              t.cuotasInfo.cuotasRestantes > 0
            );
            const totalEnCuotas = comprasEnCuotas.reduce((sum, c) =>
              sum + (c.cuotasInfo.cuotasRestantes * c.cuotasInfo.montoPorCuota), 0
            );
            const totalCuotasRestantes = comprasEnCuotas.reduce((sum, c) =>
              sum + c.cuotasInfo.cuotasRestantes, 0
            );

            return (
              <Card
                key={tarjeta.id}
                className={`bg-gradient-to-br ${bancoConfig.color} text-white overflow-hidden`}
                padding="none"
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <BankIcon size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm opacity-80">{tarjeta.banco}</p>
                        <h3 className="text-xl font-bold">{tarjeta.nombre}</h3>
                      </div>
                    </div>
                    <Badge variant="neutral" className="bg-white/20 text-white border-0">
                      {utilizacion.toFixed(1)}%
                    </Badge>
                  </div>

                  {/* Card Number */}
                  <p className="text-lg font-mono tracking-widest mb-6 opacity-90">
                    **** **** **** {tarjeta.ultimos4 || '****'}
                  </p>

                  {/* Usage Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-80">
                        Usado: {formatCurrency(tarjeta.saldoActual)}
                      </span>
                      <span className="opacity-80">
                        Disponible: {formatCurrency(disponible)}
                      </span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(utilizacion, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs opacity-70">
                      Limite: {formatCurrency(tarjeta.limite)}
                    </p>
                  </div>

                  {/* Installments Info */}
                  {comprasEnCuotas.length > 0 && (
                    <div className="pt-4 border-t border-white/20 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.Calendar size={14} className="opacity-80" />
                        <span className="text-xs font-semibold opacity-90">
                          Compras en cuotas
                        </span>
                      </div>
                      <p className="text-sm opacity-80 mb-2">
                        {formatCurrency(totalEnCuotas)} en {totalCuotasRestantes} cuotas restantes
                      </p>
                      <div className="space-y-1">
                        {comprasEnCuotas.slice(0, 2).map(compra => (
                          <p key={compra.id} className="text-xs opacity-70 truncate">
                            • {compra.descripcion}: {compra.cuotasInfo.cuotasRestantes}/{compra.cuotasInfo.numeroCuotas}
                          </p>
                        ))}
                        {comprasEnCuotas.length > 2 && (
                          <p className="text-xs opacity-60">
                            + {comprasEnCuotas.length - 2} mas...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex justify-between text-sm pt-4 border-t border-white/20">
                    <span className="flex items-center gap-2 opacity-80">
                      <Icons.CalendarCheck size={14} />
                      Cierre: dia {tarjeta.fechaCierre}
                    </span>
                    <span className="flex items-center gap-2 opacity-80">
                      <Icons.CreditCard size={14} />
                      Pago: dia {tarjeta.fechaPago}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 border-t border-white/20">
                  <button
                    onClick={() => onAddExpense(tarjeta.id)}
                    className="py-3 text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icons.Receipt size={16} />
                    Gasto
                  </button>
                  <button
                    onClick={() => onPayCard(tarjeta)}
                    disabled={tarjeta.saldoActual === 0}
                    className="py-3 text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-x border-white/20"
                  >
                    <Icons.Banknote size={16} />
                    Pagar
                  </button>
                  <button
                    onClick={() => onEditCard(tarjeta)}
                    className="py-3 text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icons.Edit size={16} />
                    Editar
                  </button>
                </div>
              </Card>
            );
          })}
        </Grid>
      )}
    </div>
  );
};

export default CardsView;
