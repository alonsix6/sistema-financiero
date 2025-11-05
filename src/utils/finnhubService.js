/**
 * Servicio de API de Finnhub con rate limiting
 * Gestiona llamadas a la API de Finnhub con control de límites
 * Usa fetch nativo del browser para compatibilidad
 */

const API_KEY = 'd45e1ppr01qsugt9uen0d45e1ppr01qsugt9ueng';
const BASE_URL = 'https://finnhub.io/api/v1';
const MAX_CALLS_PER_SECOND = 25; // Límite seguro (el máximo es 30)
const CALL_INTERVAL = 1000 / MAX_CALLS_PER_SECOND; // Milisegundos entre llamadas

class FinnhubService {
  constructor() {
    this.callQueue = [];
    this.isProcessing = false;
    this.lastCallTime = 0;
  }

  /**
   * Realiza una llamada GET a la API de Finnhub
   */
  async fetchAPI(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
      ...params,
      token: API_KEY
    });

    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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
   * Obtiene cotización en tiempo real de un símbolo
   */
  async getQuote(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/quote', { symbol }));
  }

  /**
   * Obtiene perfil de compañía
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
   * Obtiene datos financieros básicos
   */
  async getBasicFinancials(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/stock/metric', { symbol, metric: 'all' }));
  }

  /**
   * Obtiene noticias de la compañía
   */
  async getCompanyNews(symbol, fromDate, toDate) {
    return this.enqueueCall(() => this.fetchAPI('/company-news', { symbol, from: fromDate, to: toDate }));
  }

  /**
   * Obtiene composición de ETF
   */
  async getETFHoldings(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/etf/holdings', { symbol }));
  }

  /**
   * Obtiene exposición sectorial de ETF
   */
  async getETFSectorExposure(symbol) {
    return this.enqueueCall(() => this.fetchAPI('/etf/sector', { symbol }));
  }

  /**
   * Obtiene tasas de cambio forex
   */
  async getForexRates(base = 'USD') {
    return this.enqueueCall(() => this.fetchAPI('/forex/rates', { base }));
  }

  /**
   * Obtiene tipo de cambio específico (ej: USD a PEN)
   */
  async getExchangeRate(from = 'USD', to = 'PEN') {
    try {
      const rates = await this.getForexRates(from);
      if (rates && rates.quote && rates.quote[to]) {
        return rates.quote[to];
      }
      return null;
    } catch (error) {
      console.error(`Error obteniendo tipo de cambio ${from}/${to}:`, error);
      return null;
    }
  }

  /**
   * Obtiene datos completos de un símbolo (stock o ETF)
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
   * Limpia la cola (útil para detener actualizaciones)
   */
  clearQueue() {
    this.callQueue = [];
  }
}

// Exportar instancia singleton
export default new FinnhubService();
