/**
 * Componente de Inversiones en Bolsa
 * Permite tracking de stocks y ETFs con análisis de inversiones reales
 */

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import FinnhubService from '../utils/finnhubService.js';
import Modal from './Modal.jsx';
import StockChart from './StockChart.jsx';

const FormularioInversion = lazy(() => import('./forms/FormularioInversion.jsx'));

// Stocks TOP 10 más populares
const TOP_10_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'etf' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf' },
];

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const StockInvestments = ({ darkMode, favorites = [], investments = [], onUpdateFavorites, onUpdateInvestments, onDeductFromCash }) => {
  const [liveUpdates, setLiveUpdates] = useState(false);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState({});
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchType, setSearchType] = useState('stock');
  const [error, setError] = useState('');
  const [modalInvestment, setModalInvestment] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [investmentToEdit, setInvestmentToEdit] = useState(null);
  const [modalDetail, setModalDetail] = useState(false);
  const [detailStock, setDetailStock] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('1M');
  const [loadingChart, setLoadingChart] = useState(false);
  const updateIntervalRef = useRef(null);

  // Clases de estilo
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const cardClass = darkMode ? 'bg-gray-800' : 'bg-white';

  /**
   * Obtiene datos de un símbolo
   */
  const fetchStockData = async (symbol, type = 'stock') => {
    setLoading(prev => ({ ...prev, [symbol]: true }));
    try {
      const data = await FinnhubService.getFullStockData(symbol, type === 'etf');

      if (data && data.quote && data.quote.c) {
        setStockData(prev => ({
          ...prev,
          [symbol]: {
            ...data,
            type,
            lastUpdate: new Date(),
          }
        }));
        setError('');
      } else {
        setError(`No se encontraron datos para ${symbol}`);
      }
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err);
      setError(`Error al obtener datos de ${symbol}`);
    } finally {
      setLoading(prev => ({ ...prev, [symbol]: false }));
    }
  };

  /**
   * Actualiza todos los símbolos visibles
   */
  const updateAllStocks = async () => {
    const allSymbols = [
      ...favorites.map(f => ({ symbol: f.symbol, type: f.type })),
      ...TOP_10_STOCKS.map(s => ({ symbol: s.symbol, type: s.type }))
    ];

    const uniqueSymbols = allSymbols.filter((item, index, self) =>
      index === self.findIndex((t) => t.symbol === item.symbol)
    );

    for (const { symbol, type } of uniqueSymbols) {
      await fetchStockData(symbol, type);
    }
  };

  /**
   * Calcula métricas de inversión
   */
  const calculateInvestmentMetrics = (symbol, currentPrice) => {
    const stockInvestments = investments.filter(inv => inv.symbol === symbol);

    if (stockInvestments.length === 0) {
      return null;
    }

    const totalShares = stockInvestments.reduce((sum, inv) => sum + inv.shares, 0);
    const totalInvested = stockInvestments.reduce((sum, inv) => sum + inv.totalInvested, 0);
    const avgPurchasePrice = totalInvested / totalShares;
    const currentValue = totalShares * currentPrice;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = ((profitLoss / totalInvested) * 100);

    return {
      totalShares,
      totalInvested,
      avgPurchasePrice,
      currentValue,
      profitLoss,
      profitLossPercent,
      investments: stockInvestments,
    };
  };

  /**
   * Genera recomendaciones inteligentes
   */
  const getInvestmentRecommendation = (metrics, quote, priceTarget) => {
    if (!metrics) return null;

    const { profitLossPercent } = metrics;
    const recommendations = [];

    // Análisis de ganancia/pérdida
    if (profitLossPercent >= 20) {
      recommendations.push({
        type: 'success',
        icon: '🎉',
        title: 'Excelente rendimiento',
        message: `Ganancia del ${profitLossPercent.toFixed(2)}%. Considera tomar ganancias parciales o dejar correr la inversión.`,
      });
    } else if (profitLossPercent >= 10) {
      recommendations.push({
        type: 'good',
        icon: '✅',
        title: 'Buen rendimiento',
        message: `Ganancia del ${profitLossPercent.toFixed(2)}%. Tu inversión va por buen camino.`,
      });
    } else if (profitLossPercent >= -5) {
      recommendations.push({
        type: 'neutral',
        icon: '➡️',
        title: 'Rendimiento estable',
        message: `${profitLossPercent >= 0 ? 'Ganancia' : 'Pérdida'} del ${Math.abs(profitLossPercent).toFixed(2)}%. Mantén el curso.`,
      });
    } else if (profitLossPercent >= -15) {
      recommendations.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Pérdida moderada',
        message: `Pérdida del ${Math.abs(profitLossPercent).toFixed(2)}%. Considera esperar recuperación o promediar hacia abajo si confías en el activo.`,
      });
    } else {
      recommendations.push({
        type: 'danger',
        icon: '🚨',
        title: 'Pérdida significativa',
        message: `Pérdida del ${Math.abs(profitLossPercent).toFixed(2)}%. Evalúa tu estrategia. ¿Sigue siendo una inversión sólida?`,
      });
    }

    // Análisis de precio objetivo
    if (priceTarget && priceTarget.targetMean && quote) {
      const upside = ((priceTarget.targetMean - quote.c) / quote.c) * 100;
      if (upside > 20) {
        recommendations.push({
          type: 'buy',
          icon: '💚',
          title: 'Oportunidad de compra',
          message: `Analistas proyectan ${upside.toFixed(1)}% de subida potencial. Podría ser buen momento para aumentar posición.`,
        });
      } else if (upside < -10) {
        recommendations.push({
          type: 'sell',
          icon: '🔴',
          title: 'Considera vender',
          message: `El precio está ${Math.abs(upside).toFixed(1)}% por encima del precio objetivo. Considera tomar ganancias.`,
        });
      }
    }

    // Análisis de volatilidad
    if (quote && quote.d) {
      const dailyChange = Math.abs(quote.dp);
      if (dailyChange > 5) {
        recommendations.push({
          type: 'alert',
          icon: '📊',
          title: 'Alta volatilidad',
          message: `Movimiento diario del ${dailyChange.toFixed(2)}%. Mantente atento a las noticias del mercado.`,
        });
      }
    }

    return recommendations;
  };

  /**
   * Agrega un símbolo a favoritos
   */
  const addToFavorites = async () => {
    const symbol = searchSymbol.toUpperCase().trim();
    if (!symbol) {
      setError('Ingresa un símbolo válido');
      return;
    }

    if (favorites.some(f => f.symbol === symbol)) {
      setError('Este símbolo ya está en favoritos');
      return;
    }

    setLoading(prev => ({ ...prev, [symbol]: true }));
    try {
      const data = await FinnhubService.getFullStockData(symbol, searchType === 'etf');

      if (!data || !data.quote || !data.quote.c) {
        setError(`No se encontró el símbolo ${symbol}`);
        setLoading(prev => ({ ...prev, [symbol]: false }));
        return;
      }

      const newFavorite = {
        symbol,
        type: searchType,
        name: data.profile?.name || symbol,
        addedAt: new Date().toISOString(),
      };

      onUpdateFavorites([...favorites, newFavorite]);

      setStockData(prev => ({
        ...prev,
        [symbol]: {
          ...data,
          type: searchType,
          lastUpdate: new Date(),
        }
      }));

      setSearchSymbol('');
      setError('');
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError(`Error al agregar ${symbol}`);
    } finally {
      setLoading(prev => ({ ...prev, [symbol]: false }));
    }
  };

  /**
   * Elimina un símbolo de favoritos
   */
  const removeFromFavorites = (symbol) => {
    if (!confirm(`¿Eliminar ${symbol} de favoritos?`)) return;
    onUpdateFavorites(favorites.filter(f => f.symbol !== symbol));
  };

  /**
   * Abre modal para agregar inversión
   */
  const openInvestmentModal = (symbol, name, type, currentPrice) => {
    setSelectedStock({ symbol, name, type, currentPrice });
    setInvestmentToEdit(null);
    setModalInvestment(true);
  };

  /**
   * Guarda una inversión
   */
  const handleSaveInvestment = (investmentData) => {
    let updatedInvestments;

    if (investmentToEdit) {
      updatedInvestments = investments.map(inv =>
        inv.id === investmentData.id ? investmentData : inv
      );
    } else {
      updatedInvestments = [...investments, investmentData];

      // Deducir del efectivo disponible si es una nueva inversión (en USD)
      if (onDeductFromCash && investmentData.totalInvested) {
        onDeductFromCash(investmentData.totalInvested, investmentData.symbol, investmentData.name);
      }
    }

    onUpdateInvestments(updatedInvestments);
    setModalInvestment(false);
    setSelectedStock(null);
    setInvestmentToEdit(null);
  };

  /**
   * Elimina una inversión
   */
  const handleDeleteInvestment = (investmentId) => {
    if (!confirm('¿Eliminar esta inversión?')) return;
    const updatedInvestments = investments.filter(inv => inv.id !== investmentId);
    onUpdateInvestments(updatedInvestments);
  };

  /**
   * Efecto para actualizaciones en tiempo real
   */
  useEffect(() => {
    if (liveUpdates) {
      updateAllStocks();
      updateIntervalRef.current = setInterval(() => {
        updateAllStocks();
      }, 30000);
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      FinnhubService.clearQueue();
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [liveUpdates, favorites]);

  /**
   * Renderiza una tarjeta de stock con inversión
   */
  const renderStockCard = (symbol, name, type, isFavorite = false) => {
    const data = stockData[symbol];
    const isLoading = loading[symbol];

    if (isLoading && !data) {
      return (
        <div className={`${cardClass} rounded-xl shadow-lg p-6`}>
          <LoadingSpinner />
        </div>
      );
    }

    const quote = data?.quote;
    const profile = data?.profile;
    const priceTarget = data?.priceTarget;
    const currentPrice = quote?.c || 0;
    const priceChange = quote?.d || 0;
    const percentChange = quote?.dp || 0;
    const isPositive = priceChange >= 0;

    // Calcular métricas de inversión
    const metrics = calculateInvestmentMetrics(symbol, currentPrice);
    const recommendations = metrics ? getInvestmentRecommendation(metrics, quote, priceTarget) : null;

    return (
      <div className={`${cardClass} rounded-xl shadow-lg overflow-hidden`}>
        {/* Header con inversión destacada */}
        {metrics && (
          <div className={`p-4 ${metrics.profitLoss >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs opacity-90">💼 Tu Inversión</p>
                <p className="text-2xl font-bold">${metrics.currentValue.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  {metrics.profitLoss >= 0 ? '+' : ''}${metrics.profitLoss.toFixed(2)}
                </p>
                <p className="text-sm opacity-90">
                  {metrics.profitLossPercent >= 0 ? '+' : ''}{metrics.profitLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="flex justify-between text-xs opacity-90">
              <span>{metrics.totalShares.toFixed(3)} acciones</span>
              <span>Promedio: ${metrics.avgPurchasePrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Botón de eliminar para favoritos */}
          {isFavorite && (
            <button
              onClick={() => removeFromFavorites(symbol)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xl z-10"
              title="Eliminar de favoritos"
            >
              ×
            </button>
          )}

          {/* Info del stock */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className={`text-lg font-bold ${textClass}`}>{symbol}</h3>
                <p className={`text-xs ${textSecondaryClass}`}>
                  {type === 'etf' ? '📊 ETF' : '📈 Stock'} • {profile?.name || name || symbol}
                </p>
              </div>
              {data?.lastUpdate && (
                <span className={`text-xs ${textSecondaryClass}`}>
                  {data.lastUpdate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          {quote ? (
            <>
              {/* Precio actual */}
              <div className="mb-3">
                <p className={`text-3xl font-bold ${textClass}`}>
                  ${currentPrice.toFixed(2)}
                </p>
              </div>

              {/* Cambio */}
              <div className={`flex items-center gap-2 mb-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span className="text-xl font-bold">
                  {isPositive ? '▲' : '▼'}
                </span>
                <span className="font-bold">
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
                </span>
              </div>

              {/* Recomendaciones inteligentes */}
              {recommendations && recommendations.length > 0 && (
                <div className="mb-4 space-y-2">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        rec.type === 'success' ? 'bg-green-50 border-green-200' :
                        rec.type === 'good' ? 'bg-blue-50 border-blue-200' :
                        rec.type === 'neutral' ? 'bg-gray-50 border-gray-200' :
                        rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        rec.type === 'danger' ? 'bg-red-50 border-red-200' :
                        rec.type === 'buy' ? 'bg-green-50 border-green-300' :
                        rec.type === 'sell' ? 'bg-red-50 border-red-300' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{rec.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">{rec.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Historial de inversiones */}
              {metrics && metrics.investments.length > 0 && (
                <div className={`mb-4 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                  <p className={`text-xs font-semibold ${textSecondaryClass} mb-2`}>
                    📋 Historial de Compras ({metrics.investments.length})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {metrics.investments.map((inv) => {
                      const invCurrentValue = inv.shares * currentPrice;
                      const invProfitLoss = invCurrentValue - inv.totalInvested;
                      const invProfitLossPercent = ((invProfitLoss / inv.totalInvested) * 100);

                      return (
                        <div
                          key={inv.id}
                          className={`p-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start text-xs">
                            <div>
                              <p className={`font-semibold ${textClass}`}>
                                {inv.shares.toFixed(3)} acciones @ ${inv.purchasePrice.toFixed(2)}
                              </p>
                              <p className={textSecondaryClass}>
                                {new Date(inv.purchaseDate).toLocaleDateString('es-PE')}
                              </p>
                              {inv.notes && (
                                <p className={`${textSecondaryClass} italic mt-1`}>"{inv.notes}"</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${invProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {invProfitLoss >= 0 ? '+' : ''}${invProfitLoss.toFixed(2)}
                              </p>
                              <p className={`text-xs ${invProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {invProfitLossPercent >= 0 ? '+' : ''}{invProfitLossPercent.toFixed(2)}%
                              </p>
                              <button
                                onClick={() => handleDeleteInvestment(inv.id)}
                                className="text-red-500 hover:text-red-700 mt-1"
                                title="Eliminar inversión"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botón para agregar inversión */}
              <button
                onClick={() => openInvestmentModal(symbol, profile?.name || name || symbol, type, currentPrice)}
                className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium mb-3"
              >
                {metrics ? '➕ Agregar más inversión' : '💰 Registrar Inversión'}
              </button>

              {/* Datos adicionales */}
              <div className={`grid grid-cols-2 gap-3 text-sm ${textSecondaryClass} pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div>
                  <p className="text-xs opacity-70">Apertura</p>
                  <p className={`font-semibold ${textClass}`}>${quote.o?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Máximo</p>
                  <p className={`font-semibold ${textClass}`}>${quote.h?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Mínimo</p>
                  <p className={`font-semibold ${textClass}`}>${quote.l?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Prev. Close</p>
                  <p className={`font-semibold ${textClass}`}>${quote.pc?.toFixed(2) || 'N/A'}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className={textSecondaryClass}>Sin datos disponibles</p>
              <button
                onClick={() => fetchStockData(symbol, type)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Cargar datos
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calcular resumen total de portafolio
  const portfolioSummary = favorites.reduce((acc, fav) => {
    const quote = stockData[fav.symbol]?.quote;
    if (!quote) return acc;

    const metrics = calculateInvestmentMetrics(fav.symbol, quote.c);
    if (!metrics) return acc;

    return {
      totalInvested: acc.totalInvested + metrics.totalInvested,
      currentValue: acc.currentValue + metrics.currentValue,
      profitLoss: acc.profitLoss + metrics.profitLoss,
    };
  }, { totalInvested: 0, currentValue: 0, profitLoss: 0 });

  const portfolioReturn = portfolioSummary.totalInvested > 0
    ? ((portfolioSummary.profitLoss / portfolioSummary.totalInvested) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header con Toggle */}
      <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${textClass} mb-2`}>📊 Inversiones en Bolsa</h2>
            <p className={`text-sm ${textSecondaryClass}`}>
              Monitorea tus inversiones con análisis en tiempo real
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${textSecondaryClass}`}>
              {liveUpdates ? '🟢 Actualización activa' : '⚫ Actualización pausada'}
            </span>
            <button
              onClick={() => setLiveUpdates(!liveUpdates)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                liveUpdates ? 'bg-green-500' : 'bg-gray-300'
              }`}
              title={liveUpdates ? 'Desactivar actualizaciones' : 'Activar actualizaciones'}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                  liveUpdates ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {liveUpdates && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Actualizaciones activas:</strong> Se actualiza cada 30 segundos respetando límites de API
            </p>
          </div>
        )}
      </div>

      {/* Resumen del Portafolio */}
      {portfolioSummary.totalInvested > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-80 mb-1">💼 Total Invertido</p>
            <p className="text-3xl font-bold">${portfolioSummary.totalInvested.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-80 mb-1">💰 Valor Actual</p>
            <p className="text-3xl font-bold">${portfolioSummary.currentValue.toFixed(2)}</p>
          </div>
          <div className={`bg-gradient-to-br ${portfolioSummary.profitLoss >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-2xl shadow-lg p-6 text-white`}>
            <p className="text-sm opacity-80 mb-1">
              {portfolioSummary.profitLoss >= 0 ? '📈 Ganancia' : '📉 Pérdida'}
            </p>
            <p className="text-3xl font-bold">
              {portfolioSummary.profitLoss >= 0 ? '+' : ''}${portfolioSummary.profitLoss.toFixed(2)}
            </p>
            <p className="text-sm opacity-90 mt-2">
              {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}% retorno
            </p>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
        <h3 className={`text-lg font-bold ${textClass} mb-4`}>➕ Agregar a Favoritos</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && addToFavorites()}
            placeholder="Símbolo (ej: AAPL, VOO)"
            className={`flex-1 px-4 py-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass}`}
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className={`px-4 py-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass}`}
          >
            <option value="stock">Stock</option>
            <option value="etf">ETF</option>
          </select>
          <button
            onClick={addToFavorites}
            disabled={!searchSymbol}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            Agregar
          </button>
        </div>
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Sección de Favoritos */}
      {favorites.length > 0 && (
        <div>
          <h3 className={`text-xl font-bold ${textClass} mb-4`}>⭐ Mis Inversiones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(fav => renderStockCard(fav.symbol, fav.name, fav.type, true))}
          </div>
        </div>
      )}

      {/* Sección TOP 10 */}
      <div>
        <h3 className={`text-xl font-bold ${textClass} mb-4`}>🔥 TOP 10 Populares</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOP_10_STOCKS.map(stock => renderStockCard(stock.symbol, stock.name, stock.type, false))}
        </div>
      </div>

      {/* Botón de actualización manual */}
      {!liveUpdates && (
        <div className="flex justify-center">
          <button
            onClick={updateAllStocks}
            className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium"
          >
            🔄 Actualizar Manualmente
          </button>
        </div>
      )}

      {/* Modal de inversión */}
      <Modal
        isOpen={modalInvestment}
        onClose={() => { setModalInvestment(false); setSelectedStock(null); setInvestmentToEdit(null); }}
        title={`💰 ${investmentToEdit ? 'Editar' : 'Registrar'} Inversión`}
      >
        <Suspense fallback={<LoadingSpinner />}>
          {selectedStock && (
            <FormularioInversion
              investment={investmentToEdit}
              stockSymbol={selectedStock.symbol}
              stockName={selectedStock.name}
              currentPrice={selectedStock.currentPrice}
              onSave={handleSaveInvestment}
              onClose={() => { setModalInvestment(false); setSelectedStock(null); setInvestmentToEdit(null); }}
            />
          )}
        </Suspense>
      </Modal>
    </div>
  );
};

export default StockInvestments;
