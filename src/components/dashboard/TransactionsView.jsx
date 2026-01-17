/**
 * Transactions View - Transaction history and management
 */

import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Card, Button, Badge, EmptyState } from '../ui';
import { PageTitle } from '../layout';
import { CATEGORIAS, TIPOS_INGRESO, formatCurrency, formatDate } from '../../utils/constants';

const TransactionsView = ({
  transacciones,
  tarjetas,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onPagarCuotasAdelantadas,
  onVerHistorialCuotas
}) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const transaccionesPorPagina = 50;

  // Filter and sort transactions
  const transaccionesFiltradas = useMemo(() => {
    let filtered = [...transacciones];

    // Filter by type
    if (filtroTipo !== 'todos') {
      filtered = filtered.filter(t => t.tipo === filtroTipo);
    }

    // Filter by search
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase();
      filtered = filtered.filter(t =>
        t.descripcion?.toLowerCase().includes(searchLower) ||
        t.categoria?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [transacciones, filtroTipo, busqueda]);

  // Pagination
  const totalPaginas = Math.ceil(transaccionesFiltradas.length / transaccionesPorPagina);
  const transaccionesPaginadas = transaccionesFiltradas.slice(
    (paginaActual - 1) * transaccionesPorPagina,
    paginaActual * transaccionesPorPagina
  );

  // Get icon for transaction
  const getTransactionIcon = (transaccion) => {
    if (transaccion.tipo === 'Ingreso') {
      const tipoIngreso = TIPOS_INGRESO.find(t => t.valor === transaccion.categoria);
      return Icons[tipoIngreso?.iconName] || Icons.ArrowUpCircle;
    }
    if (transaccion.tipo === 'PagoTarjeta') {
      return Icons.CreditCard;
    }
    const categoria = CATEGORIAS.find(c => c.valor === transaccion.categoria);
    return Icons[categoria?.iconName] || Icons.ArrowDownCircle;
  };

  // Get color for transaction
  const getTransactionColor = (transaccion) => {
    if (transaccion.tipo === 'Ingreso') {
      return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' };
    }
    if (transaccion.tipo === 'PagoTarjeta') {
      return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' };
    }
    const categoria = CATEGORIAS.find(c => c.valor === transaccion.categoria);
    return {
      bg: `bg-opacity-20`,
      text: 'text-red-600 dark:text-red-400',
      style: { backgroundColor: `${categoria?.color}20` }
    };
  };

  // Get payment method label
  const getMetodoPago = (transaccion) => {
    if (transaccion.metodoPago === 'Efectivo') {
      return { icon: Icons.Banknote, label: 'Efectivo', color: 'text-green-600' };
    }
    const tarjeta = tarjetas.find(t => t.id === parseInt(transaccion.metodoPago));
    return {
      icon: Icons.CreditCard,
      label: tarjeta?.nombre || 'Tarjeta',
      color: 'text-blue-600'
    };
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageTitle
        title="Movimientos"
        action={
          <div className="flex gap-2">
            <Button onClick={() => onAddTransaction('Gasto')} variant="danger" icon={Icons.ArrowDownCircle}>
              Gasto
            </Button>
            <Button onClick={() => onAddTransaction('Ingreso')} icon={Icons.ArrowUpCircle}>
              Ingreso
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="glass-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icons.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar transaccion..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="input-glass pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['todos', 'Ingreso', 'Gasto', 'PagoTarjeta'].map(tipo => (
              <button
                key={tipo}
                onClick={() => {
                  setFiltroTipo(tipo);
                  setPaginaActual(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filtroTipo === tipo
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tipo === 'todos' ? 'Todos' : tipo === 'PagoTarjeta' ? 'Pagos' : tipo + 's'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card text-center">
          <Icons.ArrowUpCircle size={24} className="mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {transacciones.filter(t => t.tipo === 'Ingreso').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos</p>
        </Card>
        <Card className="glass-card text-center">
          <Icons.ArrowDownCircle size={24} className="mx-auto mb-2 text-red-500" />
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {transacciones.filter(t => t.tipo === 'Gasto').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gastos</p>
        </Card>
        <Card className="glass-card text-center">
          <Icons.CreditCard size={24} className="mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {transacciones.filter(t => t.tipo === 'PagoTarjeta').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pagos</p>
        </Card>
      </div>

      {/* Transactions List */}
      {transaccionesFiltradas.length === 0 ? (
        <Card className="glass-card">
          <EmptyState
            icon={Icons.Receipt}
            title="No hay movimientos"
            description="Comienza registrando tu primer ingreso o gasto"
            action={
              <Button onClick={() => onAddTransaction('Gasto')} icon={Icons.Plus}>
                Agregar Transaccion
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <Card className="glass-card" padding="none">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {transaccionesPaginadas.map(transaccion => {
                const IconComponent = getTransactionIcon(transaccion);
                const colors = getTransactionColor(transaccion);
                const metodoPago = getMetodoPago(transaccion);
                const MetodoIcon = metodoPago.icon;

                return (
                  <div
                    key={transaccion.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}
                        style={colors.style}
                      >
                        <IconComponent size={22} className={colors.text} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {transaccion.descripcion}
                          </p>
                          {transaccion.esRecurrente && (
                            <Icons.RefreshCcw size={14} className="text-blue-500 flex-shrink-0" />
                          )}
                          {transaccion.esCuotas && (
                            <Badge variant="info" size="sm">
                              {transaccion.cuotasInfo.cuotasPagadas}/{transaccion.cuotasInfo.numeroCuotas}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Icons.Calendar size={14} />
                            {formatDate(transaccion.fecha)}
                          </span>
                          {transaccion.tipo === 'Gasto' && (
                            <span className="flex items-center gap-1">
                              <MetodoIcon size={14} className={metodoPago.color} />
                              {metodoPago.label}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
                            {transaccion.categoria}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaccion.tipo === 'Ingreso'
                            ? 'text-green-600 dark:text-green-400'
                            : transaccion.tipo === 'PagoTarjeta'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaccion.tipo === 'Ingreso' ? '+' : '-'}{formatCurrency(transaccion.monto)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        {transaccion.esCuotas && transaccion.cuotasInfo.cuotasRestantes > 0 && (
                          <button
                            onClick={() => onPagarCuotasAdelantadas(transaccion)}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors"
                            title="Pagar cuotas adelantadas"
                          >
                            <Icons.FastForward size={18} className="text-green-600" />
                          </button>
                        )}
                        {transaccion.esCuotas && (
                          <button
                            onClick={() => onVerHistorialCuotas(transaccion)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                            title="Ver historial de cuotas"
                          >
                            <Icons.History size={18} className="text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditTransaction(transaccion)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                          title="Editar"
                        >
                          <Icons.Edit size={18} className="text-gray-400" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(transaccion.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                          title="Eliminar"
                        >
                          <Icons.Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pagination */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                variant="ghost"
                size="sm"
                icon={Icons.ChevronLeft}
              />
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Pagina {paginaActual} de {totalPaginas}
              </span>
              <Button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionsView;
