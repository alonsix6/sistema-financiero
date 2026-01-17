/**
 * Servicio de API de Finnhub con rate limiting
 * Gestiona llamadas a la API de Finnhub con control de limites
 * Usa fetch nativo del browser para compatibilidad
 */

// Use environment variable or fallback to demo key
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'demo';
const BASE_URL = 'https://finnhub.io/api/v1';
const MAX_CALLS_PER_SECOND = 25; // Limite seguro (el maximo es 30)
const CALL_INTERVAL = 1000 / MAX_CALLS_PER_SECOND; // Milisegundos entre llamadas

class FinnhubService {
  constructor() {
    this.callQueue = [];
    this.isProcessing = false;
    this.lastCallTime = 0;
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache

    // Check if API key is configured
    if (API_KEY === 'demo') {
      console.warn(
        'FinnhubService: Using demo API key. Set VITE_FINNHUB_API_KEY in .env for full functionality.'
      );
    }
  }

  /**
   * Check if cached data is still valid
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Store data in cache
   */
  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Realiza una llamada GET a la API de Finnhub
   */
  async fetchAPI(endpoint, params = {}) {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;

    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const queryParams = new URLSearchParams({
      ...params,
      token: API_KEY
    });

    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
      }
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your VITE_FINNHUB_API_KEY.');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Cache successful responses
    this.setCache(cacheKey, data);

    return data;
  }

  /**
   * Agrega una llamada a la cola con rate limiting
   */
  async enqueueCall(apiCall) {
    return new Promise((resolve, reject) => {
      this.callQueue.push({ apiCall, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Procesa la cola de llamadas respetando el rate limit
   */
  async processQueue() {
    if (this.isProcessing || this.callQueue.length === 0) return;

    this.isProcessing = true;

    while (this.callQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;

      // Esperar si es necesario para respetar el rate limit
      if (timeSinceLastCall < CALL_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, CALL_INTERVAL - timeSinceLastCall));
      }

      const { apiCall, resolve, reject } = this.callQueue.shift();

      try {
        const result = await apiCall();
        this.lastCallTime = Date.now();
        resolve(result);
      } catch (error) {
        console.error('Error en llamada a Finnhub:', error);
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Obtiene cotizacion en tiempo real de un simbolo
   */
  async getQuote(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/quote', { symbol }));
  }

  /**
   * Obtiene perfil de compania
   */
  async getCompanyProfile(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/stock/profile2', { symbol }));
  }

  /**
   * Obtiene perfil de ETF
   */
  async getETFProfile(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/etf/profile', { symbol }));
  }

  /**
   * Obtiene recomendaciones de analistas
   */
  async getRecommendations(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/stock/recommendation', { symbol }));
  }

  /**
   * Obtiene precio objetivo
   */
  async getPriceTarget(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/stock/price-target', { symbol }));
  }

  /**
   * Obtiene datos financieros basicos
   */
  async getBasicFinancials(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/stock/metric', { symbol, metric: 'all' }));
  }

  /**
   * Obtiene noticias de la compania
   */
  async getCompanyNews(symbol, fromDate, toDate) {
    return this.enqueueCall(() => this.fetchAPI('/company-news', { symbol, from: fromDate, to: toDate }));
  }

  /**
   * Obtiene composicion de ETF
   */
  async getETFHoldings(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/etf/holdings', { symbol }));
  }

  /**
   * Obtiene exposicion sectorial de ETF
   */
  async getETFSectorExposure(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/etf/sector', { symbol }));
  }

  /**
   * Obtiene datos historicos de velas (candles) para graficos
   * @param {string} symbol - Simbolo del stock (ej: AAPL)
   * @param {string} resolution - Resolucion (1, 5, 15, 30, 60, D, W, M)
   * @param {number} from - Unix timestamp de inicio
   * @param {number} to - Unix timestamp de fin
   */
  async getStockCandles(symbol, resolution = 'D', from, to) {
    return this.enqueueCall(() => this.fetchAPI('/stock/candle', {
      symbol,
      resolution,
      from,
      to
    }));
  }

  /**
   * Obtiene datos completos de un simbolo (stock o ETF)
   */
  async getFullStockData(symbol, isETF = false) {
    try {
      const results = await Promise.allSettled([
        this.getQuote(symbol),
        isETF ? this.getETFProfile(symbol) : this.getCompanyProfile(symbol),
        !isETF ? this.getRecommendations(symbol) : Promise.resolve(null),
        !isETF ? this.getPriceTarget(symbol) : Promise.resolve(null),
      ]);

      return {
        quote: results[0].status === 'fulfilled' ? results[0].value : null,
        profile: results[1].status === 'fulfilled' ? results[1].value : null,
        recommendations: results[2].status === 'fulfilled' ? results[2].value : null,
        priceTarget: results[3].status === 'fulfilled' ? results[3].value : null,
      };
    } catch (error) {
      console.error(`Error obteniendo datos de ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Limpia la cola (util para detener actualizaciones)
   */
  clearQueue() {
    this.callQueue = [];
  }

  /**
   * Limpia la cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Check if API is available
   */
  isAvailable() {
    return API_KEY !== 'demo';
  }
}

// Exportar instancia singleton
export default new FinnhubService();
