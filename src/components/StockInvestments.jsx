/**
 * Componente de Inversiones en Bolsa
 * Permite tracking de stocks y ETFs con actualización en tiempo real
 */

import React, { useState, useEffect, useRef } from 'react';
import FinnhubService from '../utils/finnhubService.js';

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
  { symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'etf' },
];

const StockInvestments = ({ darkMode, favorites = [], onUpdateFavorites }) => {
  const [liveUpdates, setLiveUpdates] = useState(false);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState({});
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchType, setSearchType] = useState('stock');
  const [error, setError] = useState('');
  const updateIntervalRef = useRef(null);

  // Clases de estilo
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const cardClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';

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

    // Eliminar duplicados
    const uniqueSymbols = allSymbols.filter((item, index, self) =>
      index === self.findIndex((t) => t.symbol === item.symbol)
    );

    for (const { symbol, type } of uniqueSymbols) {
      await fetchStockData(symbol, type);
    }
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

    // Verificar que el símbolo existe obteniendo datos
    setLoading(prev => ({ ...prev, [symbol]: true }));
    try {
      const data = await FinnhubService.getFullStockData(symbol, searchType === 'etf');

      if (!data || !data.quote || !data.quote.c) {
        setError(`No se encontró el símbolo ${symbol}`);
        setLoading(prev => ({ ...prev, [symbol]: false }));
        return;
      }

      // Agregar a favoritos
      const newFavorite = {
        symbol,
        type: searchType,
        name: data.profile?.name || symbol,
        addedAt: new Date().toISOString(),
      };

      onUpdateFavorites([...favorites, newFavorite]);

      // Guardar datos
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
    onUpdateFavorites(favorites.filter(f => f.symbol !== symbol));
  };

  /**
   * Efecto para actualizaciones en tiempo real
   */
  useEffect(() => {
    if (liveUpdates) {
      // Actualización inicial
      updateAllStocks();

      // Configurar intervalo de actualización (cada 30 segundos)
      updateIntervalRef.current = setInterval(() => {
        updateAllStocks();
      }, 30000);
    } else {
      // Limpiar intervalo si se desactiva
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      // Limpiar cola de API
      FinnhubService.clearQueue();
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [liveUpdates, favorites]);

  /**
   * Renderiza una tarjeta de stock
   */
  const renderStockCard = (symbol, name, type, isFavorite = false) => {
    const data = stockData[symbol];
    const isLoading = loading[symbol];

    if (isLoading && !data) {
      return (
        <div className={`${cardClass} rounded-xl shadow-lg p-6`}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      );
    }

    const quote = data?.quote;
    const profile = data?.profile;
    const priceChange = quote ? quote.d : 0;
    const percentChange = quote ? quote.dp : 0;
    const currentPrice = quote ? quote.c : 0;
    const isPositive = priceChange >= 0;

    return (
      <div className={`${cardClass} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all relative`}>
        {/* Botón de eliminar para favoritos */}
        {isFavorite && (
          <button
            onClick={() => removeFromFavorites(symbol)}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xl"
            title="Eliminar de favoritos"
          >
            ×
          </button>
        )}

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
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
            <div className={`flex items-center gap-2 mb-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="text-xl font-bold">
                {isPositive ? '▲' : '▼'}
              </span>
              <span className="font-bold">
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
              </span>
            </div>

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

            {/* Información de la compañía */}
            {profile && (
              <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {profile.marketCapitalization && (
                  <div className="text-xs">
                    <span className={textSecondaryClass}>Market Cap: </span>
                    <span className={`font-semibold ${textClass}`}>
                      ${(profile.marketCapitalization / 1000).toFixed(2)}B
                    </span>
                  </div>
                )}
                {profile.exchange && (
                  <div className="text-xs mt-1">
                    <span className={textSecondaryClass}>Exchange: </span>
                    <span className={`font-semibold ${textClass}`}>{profile.exchange}</span>
                  </div>
                )}
              </div>
            )}
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
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con Toggle */}
      <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${textClass} mb-2`}>📊 Inversiones en Bolsa</h2>
            <p className={`text-sm ${textSecondaryClass}`}>
              Monitorea tus inversiones en tiempo real
            </p>
          </div>

          {/* Toggle de actualizaciones en tiempo real estilo Apple */}
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

        {/* Info de Rate Limiting */}
        {liveUpdates && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Actualizaciones activas:</strong> Se actualiza cada 30 segundos respetando límites de API (30 llamadas/segundo máx.)
            </p>
          </div>
        )}
      </div>

      {/* Buscador para agregar favoritos */}
      <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
        <h3 className={`text-lg font-bold ${textClass} mb-4`}>➕ Agregar a Favoritos</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && addToFavorites()}
            placeholder="Símbolo (ej: AAPL, SPY)"
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
          <h3 className={`text-xl font-bold ${textClass} mb-4`}>⭐ Mis Favoritos</h3>
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
    </div>
  );
};

export default StockInvestments;
