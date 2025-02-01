import React from 'react';
import { formatNumber } from '../../utils/format';

interface TrafficDistributionProps {
  data: {
    worldwide: {
      traffic: number;
      keywords: number;
    };
    countries: Array<{
      code: string;
      name: string;
      traffic: number;
      trafficShare: number;
      keywords: number;
    }>;
    others: {
      traffic: number;
      trafficShare: number;
      keywords: number;
    };
  } | null;
  isLoading: boolean;
}

export function TrafficDistributionTable({ data, isLoading }: TrafficDistributionProps) {
  const getCountryFlag = (code: string) => {
    const countryMap: Record<string, string> = {
      '2840': 'us', '2826': 'gb', '2356': 'in', '2036': 'au', '2124': 'ca',
      '2276': 'de', '2250': 'fr', '2724': 'es', '2380': 'it', '2392': 'jp',
      '2158': 'tw', '2344': 'hk', '2702': 'sg', '2528': 'nl', '2056': 'be',
      '2752': 'se', '2208': 'dk', '2246': 'fi', '2578': 'no', '2756': 'ch',
      '2616': 'pl', '2203': 'cz', '2348': 'hu', '2040': 'at', '2642': 'ro',
      '2100': 'bg', '2300': 'gr', '2620': 'pt', '2764': 'th', '2458': 'my',
      '2360': 'id', '2704': 'vn', '2608': 'ph', '2410': 'kr', '2076': 'br',
      '2484': 'mx', '2032': 'ar', '2152': 'cl', '2170': 'co', '2604': 'pe',
      '2862': 've', '2784': 'ae', '2682': 'sa', '2400': 'jo', '2818': 'eg',
      '2504': 'ma', '2788': 'tn', '2566': 'ng', '2710': 'za', '2404': 'ke'
    };
    
    const isoCode = countryMap[code] || 'unknown';
    return `https://flagcdn.com/24x18/${isoCode.toLowerCase()}.png`;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse p-6 space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No traffic distribution data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Traffic Distribution By Country
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Countries
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Traffic Share
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Traffic
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Keywords
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {/* Worldwide row */}
            <tr className="bg-gray-50 dark:bg-gray-900 font-medium">
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <img 
                    src="https://flagcdn.com/24x18/un.png" 
                    alt="Worldwide"
                    className="w-6 h-4 object-cover rounded"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100">Worldwide</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full w-full"></div>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100">100%</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {formatNumber(data.worldwide.traffic)}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {formatNumber(data.worldwide.keywords)}
              </td>
            </tr>

            {/* Individual countries */}
            {data.countries.map((country, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={getCountryFlag(country.code)} 
                      alt={country.name}
                      className="w-6 h-4 object-cover rounded"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">{country.name}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${country.trafficShare}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {country.trafficShare.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatNumber(country.traffic)}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatNumber(country.keywords)}
                </td>
              </tr>
            ))}

            {/* Others row */}
            <tr className="bg-gray-50 dark:bg-gray-900">
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <span className="text-sm text-gray-900 dark:text-gray-100">Others</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${data.others.trafficShare}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {data.others.trafficShare.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {formatNumber(data.others.traffic)}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {formatNumber(data.others.keywords)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
