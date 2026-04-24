let cache = {
  rate: 0.79,
  fetchedAt: 0
};

async function getUsdToGbpRate() {
  const now = Date.now();
  const maxAgeMs = 30 * 60 * 1000;

  if (now - cache.fetchedAt < maxAgeMs) {
    return cache.rate;
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!response.ok) {
      throw new Error(`FX API error ${response.status}`);
    }

    const payload = await response.json();
    const gbpRate = Number(payload?.rates?.GBP);
    if (!gbpRate || Number.isNaN(gbpRate)) {
      throw new Error("Invalid GBP rate");
    }

    cache = { rate: gbpRate, fetchedAt: now };
    return gbpRate;
  } catch (_error) {
    return cache.rate;
  }
}

module.exports = { getUsdToGbpRate };
