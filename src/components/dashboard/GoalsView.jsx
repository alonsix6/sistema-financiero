/**
 * Goals View - Savings goals management
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { Card, Button, Badge, ProgressBar, ProgressRing, EmptyState } from '../ui';
import { PageTitle, Grid } from '../layout';
import { CATEGORIAS_METAS, formatCurrency, formatDate } from '../../utils/constants';
import Calculations from '../../utils/calculations';

const GoalsView = ({
  metas,
  cashflowPromedio,
  disponibleParaAhorrar,
  onAddMeta,
  onEditMeta,
  onAportarMeta
}) => {
  // Separate active and inactive goals
  const metasActivas = metas.filter(m => m.activa);
  const metasInactivas = metas.filter(m => !m.activa);

  // Calculate total saved
  const totalAhorrado = metas.reduce((sum, m) => sum + (m.montoAhorrado || 0), 0);
  const totalObjetivo = metasActivas.reduce((sum, m) => sum + m.montoObjetivo, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageTitle
        title="Metas de Ahorro"
        action={
          <Button onClick={onAddMeta} icon={Icons.Plus}>
            Nueva Meta
          </Button>
        }
      />

      {/* Summary Cards */}
      <Grid cols={3}>
        <Card className="glass-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-accent/10 rounded-xl flex items-center justify-center">
            <Icons.PiggyBank size={24} className="text-accent" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalAhorrado)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Ahorrado</p>
        </Card>
        <Card className="glass-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-accent/10 dark:bg-accent/20 rounded-xl flex items-center justify-center">
            <Icons.Target size={24} className="text-accent" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalObjetivo)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Objetivo Total</p>
        </Card>
        <Card className="glass-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Icons.Wallet size={24} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(disponibleParaAhorrar)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Disponible para Ahorrar</p>
        </Card>
      </Grid>

      {/* Active Goals */}
      {metasActivas.length === 0 && metasInactivas.length === 0 ? (
        <Card className="glass-card">
          <EmptyState
            icon={Icons.Target}
            title="Sin metas de ahorro"
            description="Crea tu primera meta para empezar a ahorrar de forma inteligente"
            action={
              <Button onClick={onAddMeta} icon={Icons.Plus}>
                Crear Meta
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {metasActivas.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.Flame size={20} className="text-accent" />
                Metas Activas ({metasActivas.length})
              </h3>
              <Grid cols={2}>
                {metasActivas.map(meta => {
                  const categoriaConfig = CATEGORIAS_METAS.find(c => c.valor === meta.categoria) || CATEGORIAS_METAS[CATEGORIAS_METAS.length - 1];
                  const IconComponent = Icons[categoriaConfig.iconName] || Icons.Target;
                  const progreso = Calculations.calcularProgresoMeta(meta);
                  const tiempoEstimado = Calculations.estimarTiempoMeta(meta, cashflowPromedio);

                  return (
                    <Card
                      key={meta.id}
                      className={`bg-gradient-to-br ${categoriaConfig.color} text-white overflow-hidden`}
                      padding="none"
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                              <IconComponent size={24} className="text-white" />
                            </div>
                            <div>
                              <p className="text-sm opacity-80">{meta.categoria}</p>
                              <h3 className="text-xl font-bold">{meta.nombre}</h3>
                            </div>
                          </div>
                          {progreso.alcanzada && (
                            <Badge variant="success" className="bg-white/20 text-white border-0">
                              <Icons.CheckCircle size={14} className="mr-1" />
                              Lograda
                            </Badge>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="opacity-80">Progreso</span>
                            <span className="font-bold">{progreso.porcentaje.toFixed(1)}%</span>
                          </div>
                          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progreso.porcentaje, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="opacity-80">{formatCurrency(meta.montoAhorrado || 0)}</span>
                            <span className="font-semibold">{formatCurrency(meta.montoObjetivo)}</span>
                          </div>
                        </div>

                        {/* Time Info */}
                        {meta.fechaObjetivo && (
                          <div className="pt-3 border-t border-white/20 mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="opacity-80">Fecha objetivo</span>
                              <span className="font-semibold">{formatDate(meta.fechaObjetivo)}</span>
                            </div>
                            {progreso.diasParaObjetivo !== null && (
                              <div className="flex justify-between text-sm">
                                <span className="opacity-80">
                                  {progreso.diasParaObjetivo >= 0 ? 'Dias restantes' : 'Dias atrasada'}
                                </span>
                                <span className={`font-semibold ${progreso.diasParaObjetivo < 0 ? 'text-red-200' : ''}`}>
                                  {Math.abs(progreso.diasParaObjetivo)} dias
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Estimated Time */}
                        {!progreso.alcanzada && tiempoEstimado && !tiempoEstimado.alcanzada && tiempoEstimado.meses !== Infinity && (
                          <div className="p-3 bg-white/10 rounded-xl mb-4">
                            <p className="text-xs opacity-90 flex items-center gap-2">
                              <Icons.Clock size={14} />
                              Con tu cashflow actual: <strong>{tiempoEstimado.meses} mes(es)</strong>
                              {tiempoEstimado.anios > 0 && ` (${tiempoEstimado.anios} año(s), ${tiempoEstimado.mesesRestantes} mes(es))`}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => onAportarMeta(meta)}
                            className="bg-white/20 hover:bg-white/30 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <Icons.Plus size={16} />
                            Aportar
                          </button>
                          <button
                            onClick={() => onEditMeta(meta)}
                            className="bg-white/20 hover:bg-white/30 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <Icons.Edit size={16} />
                            Editar
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </Grid>
            </div>
          )}

          {/* Inactive Goals */}
          {metasInactivas.length > 0 && (
            <Card className="glass-card">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Icons.Archive size={20} className="text-gray-400" />
                Metas Inactivas ({metasInactivas.length})
              </h3>
              <div className="space-y-3">
                {metasInactivas.map(meta => {
                  const categoriaConfig = CATEGORIAS_METAS.find(c => c.valor === meta.categoria) || CATEGORIAS_METAS[CATEGORIAS_METAS.length - 1];
                  const IconComponent = Icons[categoriaConfig.iconName] || Icons.Target;

                  return (
                    <div
                      key={meta.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                          <IconComponent size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{meta.nombre}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(meta.montoAhorrado || 0)} / {formatCurrency(meta.montoObjetivo)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => onEditMeta(meta)}
                        variant="ghost"
                        size="sm"
                        icon={Icons.Edit}
                      >
                        Editar
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default GoalsView;
