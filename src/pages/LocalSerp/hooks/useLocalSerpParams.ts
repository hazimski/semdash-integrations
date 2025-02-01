import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

export function useLocalSerpParams() {
  const [searchParams] = useSearchParams();

  return useMemo(() => ({
    historyId: searchParams.get('historyId'),
    domain: searchParams.get('domain') || '',
    competitors: (() => {
      try {
        return JSON.parse(searchParams.get('competitors') || '[]');
      } catch {
        return [];
      }
    })(),
    keywords: (() => {
      try {
        return JSON.parse(searchParams.get('keywords') || '[]');
      } catch {
        return [];
      }
    })(),
    device: searchParams.get('device') || 'desktop',
    os: searchParams.get('os') || 'windows',
    locationCode: parseInt(searchParams.get('locationCode') || '0'),
    languageCode: searchParams.get('languageCode') || 'en'
  }), [searchParams]);
}