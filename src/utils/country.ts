export function getCountryFlag(code: string): string {
  // Map location codes to ISO country codes
  const countryMap: Record<string, string> = {
   '2840': 'us',    // United States
    '2826': 'gb',    // United Kingdom
    '2356': 'in',    // India
    '2036': 'au',    // Australia
    '2124': 'ca',    // Canada
    '2276': 'de',    // Germany
    '2250': 'fr',    // France
    '2724': 'es',    // Spain
    '2380': 'it',    // Italy
    '2392': 'jp',    // Japan
    '2158': 'tw',    // Taiwan
    '2344': 'hk',    // Hong Kong
    '2702': 'sg',    // Singapore
    '2528': 'nl',    // Netherlands
    '2056': 'be',    // Belgium
    '2752': 'se',    // Sweden
    '2208': 'dk',    // Denmark
    '2246': 'fi',    // Finland
    '2578': 'no',    // Norway
    '2756': 'ch',    // Switzerland
    '2616': 'pl',    // Poland
    '2203': 'cz',    // Czech Republic
    '2348': 'hu',    // Hungary
    '2040': 'at',    // Austria
    '2642': 'ro',    // Romania
    '2100': 'bg',    // Bulgaria
    '2300': 'gr',    // Greece
    '2620': 'pt',    // Portugal
    '2764': 'th',    // Thailand
    '2458': 'my',    // Malaysia
    '2360': 'id',    // Indonesia
    '2704': 'vn',    // Vietnam
    '2608': 'ph',    // Philippines
    '2410': 'kr',    // South Korea
    '2076': 'br',    // Brazil
    '2484': 'mx',    // Mexico
    '2032': 'ar',    // Argentina
    '2152': 'cl',    // Chile
    '2170': 'co',    // Colombia
    '2604': 'pe',    // Peru
    '2862': 've',    // Venezuela
    '2784': 'ae',    // United Arab Emirates
    '2682': 'sa',    // Saudi Arabia
    '2400': 'jo',    // Jordan
    '2818': 'eg',    // Egypt
    '2504': 'ma',    // Morocco
    '2788': 'tn',    // Tunisia
    '2566': 'ng',    // Nigeria
    '2710': 'za',    // South Africa
    '2404': 'ke',    // Kenya
    '2312': 'pk',    // Pakistan
    '2336': 'kw',    // Kuwait
    '2270': 'qa',    // Qatar
    '2258': 'bh',    // Bahrain
    '2364': 'lk',    // Sri Lanka
    '2372': 'np',    // Nepal
    '2636': 'bd',    // Bangladesh
    '2428': 'mn',    // Mongolia
    '2664': 'kh',    // Cambodia
    '2494': 'la',    // Laos
    '2660': 'mm',    // Myanmar
    '2720': 'bt',    // Bhutan
    '2848': 'mv',    // Maldives
    '2416': 'gh',    // Ghana
    '2516': 'zw',    // Zimbabwe
    '2592': 'tz',    // Tanzania
    '2552': 'ug',    // Uganda
    '2376': 'et',    // Ethiopia
    '2440': 'sn',    // Senegal
    '2408': 'cm',    // Cameroon
    '2412': 'tz',    // Tanzania
    '2368': 'zm',    // Zambia
    '2598': 'mw',    // Malawi
    '2646': 'ne',    // Niger
    '2694': 'dz',    // Algeria
    '2540': 'sd',    // Sudan
    '2654': 'ly',    // Libya
    '2774': 'so',    // Somalia
    '2568': 'zw',    // Zimbabwe
    '2796': 'na',    // Namibia
    '2332': 'ma',    // Morocco
    '2780': 'sd',    // Sudan
    '2584': 'tz',    // Tanzania
    '2368': 'zm',    // Zambia
    '2648': 'ci',    // Ivory Coast
    '2726': 'gh',    // Ghana
    '2396': 'gq',    // Equatorial Guinea
    '2762': 'sa',    // Saudi Arabia
    '2432': 'ke',    // Kenya
    '2464': 'ug',    // Uganda
    '2512': 'sd',    // Sudan
    '2650': 'br',    // Brazil
    '2676': 'np',    // Nepal
    '2684': 'bd'     // Bangladesh
  };

  const isoCode = countryMap[code] || 'unknown';
  return `https://flagcdn.com/24x18/${isoCode.toLowerCase()}.png`;
}
