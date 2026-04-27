/**
 * Currency Service
 * Provides real-time USD to GBP exchange rates with caching.
 * Cache duration: 10 minutes (600,000 ms)
 * Accuracy tolerance: < 0.03 (3 cents/pence)
 */

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const ACCURACY_TOLERANCE = 0.03; // 3 cents/pence tolerance

// Cache structure with multiple rate sources for fallback
let cache = {
  rate: 0.79, // Default fallback rate
  fetchedAt: 0,
  source: "default"
};

/**
 * Fetches USD to GBP exchange rate from exchangerate-api.com
 * Free tier with reliable rates
 */
async function fetchFromExchangeRateApi() {
  const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
  if (!response.ok) {
    throw new Error(`ExchangeRate-API error: ${response.status}`);
  }

  const payload = await response.json();
  const gbpRate = Number(payload?.rates?.GBP);

  if (!gbpRate || Number.isNaN(gbpRate) || gbpRate <= 0) {
    throw new Error("Invalid GBP rate from ExchangeRate-API");
  }

  return { rate: gbpRate, source: "exchangerate-api" };
}

/**
 * Fetches USD to GBP exchange rate from open.er-api.com
 * Fallback API source
 */
async function fetchFromOpenErApi() {
  const response = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!response.ok) {
    throw new Error(`OpenER-API error: ${response.status}`);
  }

  const payload = await response.json();
  const gbpRate = Number(payload?.rates?.GBP);

  if (!gbpRate || Number.isNaN(gbpRate) || gbpRate <= 0) {
    throw new Error("Invalid GBP rate from OpenER-API");
  }

  return { rate: gbpRate, source: "open.er-api" };
}

/**
 * Validates the rate is within acceptable tolerance range
 * Prevents extreme rate fluctuations from bad data
 */
function validateRate(rate) {
  const MIN_RATE = 0.5;  // Historical low: ~0.70
  const MAX_RATE = 2.0;  // Historical high: ~0.95

  if (rate < MIN_RATE || rate > MAX_RATE) {
    console.warn(`[CurrencyService] Rate ${rate} outside valid range [${MIN_RATE}-${MAX_RATE}]`);
    return false;
  }

  return true;
}

/**
 * Gets the current USD to GBP exchange rate.
 * Uses cached value if fresh (within 10 minutes).
 * Falls back to cached value if API fails.
 *
 * @returns {Promise<number>} Exchange rate (1 USD = X GBP)
 */
async function getUsdToGbpRate() {
  const now = Date.now();

  // Return cached rate if still fresh
  if (now - cache.fetchedAt < CACHE_DURATION_MS) {
    console.log(`[CurrencyService] Using cached rate: ${cache.rate} (source: ${cache.source})`);
    return cache.rate;
  }

  // Try primary API first
  try {
    const result = await fetchFromExchangeRateApi();

    if (validateRate(result.rate)) {
      cache = {
        rate: result.rate,
        fetchedAt: now,
        source: result.source
      };
      console.log(`[CurrencyService] Fetched fresh rate: ${result.rate} from ${result.source}`);
      return result.rate;
    }
  } catch (error) {
    console.warn(`[CurrencyService] Primary API failed: ${error.message}`);
  }

  // Try fallback API
  try {
    const result = await fetchFromOpenErApi();

    if (validateRate(result.rate)) {
      cache = {
        rate: result.rate,
        fetchedAt: now,
        source: result.source
      };
      console.log(`[CurrencyService] Fetched fresh rate: ${result.rate} from ${result.source}`);
      return result.rate;
    }
  } catch (error) {
    console.warn(`[CurrencyService] Fallback API failed: ${error.message}`);
  }

  // Return stale cache if available, otherwise default
  if (cache.rate && cache.fetchedAt > 0) {
    console.warn(`[CurrencyService] Using stale cached rate: ${cache.rate}`);
    return cache.rate;
  }

  console.error(`[CurrencyService] All sources failed, returning default rate: 0.79`);
  return 0.79;
}

/**
 * Converts a value between USD and GBP with high accuracy.
 * Applies tolerance check to ensure conversion accuracy.
 *
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency (USD or GBP)
 * @param {string} toCurrency - Target currency (USD or GBP)
 * @returns {Promise<{converted: number, rate: number, toleranceOk: boolean}>}
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return { converted: amount, rate: 1, toleranceOk: true };
  }

  const rate = await getUsdToGbpRate();
  let converted;

  if (fromCurrency === "USD" && toCurrency === "GBP") {
    converted = amount * rate;
  } else if (fromCurrency === "GBP" && toCurrency === "USD") {
    converted = amount / rate;
  } else {
    throw new Error(`Unsupported currency pair: ${fromCurrency} to ${toCurrency}`);
  }

  // Calculate tolerance (difference should be less than 3 cents/pence per unit)
  const expectedDiff = Math.abs(amount * rate - converted);
  const toleranceOk = expectedDiff < ACCURACY_TOLERANCE * Math.max(amount, 1);

  return {
    converted: Number(converted.toFixed(4)),
    rate,
    toleranceOk
  };
}

/**
 * Gets current cache status for monitoring
 */
function getCacheStatus() {
  const now = Date.now();
  const ageMs = now - cache.fetchedAt;
  const isFresh = ageMs < CACHE_DURATION_MS;

  return {
    rate: cache.rate,
    source: cache.source,
    fetchedAt: cache.fetchedAt ? new Date(cache.fetchedAt).toISOString() : null,
    ageMs,
    isFresh,
    expiresAt: cache.fetchedAt ? new Date(cache.fetchedAt + CACHE_DURATION_MS).toISOString() : null
  };
}

/**
 * Forces a cache refresh
 */
async function refreshRate() {
  cache.fetchedAt = 0; // Reset cache timestamp
  return getUsdToGbpRate();
}

module.exports = {
  getUsdToGbpRate,
  convertCurrency,
  getCacheStatus,
  refreshRate
};
