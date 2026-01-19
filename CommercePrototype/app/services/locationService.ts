export type CountryItem = { name: string; code?: string };

export async function fetchCountries(): Promise<CountryItem[]> {
  const res = await fetch("https://restcountries.com/v3.1/all");
  const data = await res.json();
  const list: CountryItem[] = data
    .map((c: any) => ({ name: c?.name?.common ?? c?.name, code: c?.cca2 }))
    .filter(Boolean)
    .sort((a: CountryItem, b: CountryItem) =>
      a.name.localeCompare(b.name)
    );
  return list;
}

export type GeocodeResult = {
  displayName: string;
  country?: string;
  countryCode?: string;
  city?: string;
  postcode?: string;
};

export async function geocodeAddress(
  address: string,
  limit = 5,
  countryCode?: string // novo parâmetro opcional (ex: "pt")
): Promise<GeocodeResult[]> {
  if (!address || address.trim().length < 3) return [];
  const q = encodeURIComponent(address);
  const countryParam = countryCode ? `&countrycodes=${encodeURIComponent(countryCode)}` : "";
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${q}${countryParam}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "CommercePrototype/1.0 (+https://example.com)",
    },
  });
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return [];

  return data.map((d: any) => {
    const addr = d.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.hamlet ||
      addr.county ||
      undefined;
    return {
      displayName: d.display_name,
      country: addr.country,
      countryCode: addr.country_code?.toUpperCase(),
      city,
      postcode: addr.postcode,
    } as GeocodeResult;
  });
}
