export async function fetchHomewizardValue() {
  const nowSeconds = Date.now() / 1000;
  const url =
    "https://hwenergy.app/totals" +
    "?home=488575" +
    "&identifier=p1dongle/5c2faf0b7fa8_gas" +
    "&period=1" +
    `&date=${nowSeconds}` +
    "&timeZone=Europe/Amsterdam";

  const upstream = await fetch(url, {
    headers: {
      cookie: process.env.HWENERGY_COOKIES as string,
    },
  });

  if (!upstream.ok) throw new Error("Request failed");

  const data = await upstream.json();

  // 2. Extract value (server-side safe parsing)
  const valueMatch = data.valueDiv.match(/class="graphValue"[^>]*>([^<]+)</);

  const gasValue = valueMatch ? Number(valueMatch[1]) : null;

  if (gasValue === null || Number.isNaN(gasValue)) {
    throw new Error("Invalid gas value");
  }

  return gasValue;
}
