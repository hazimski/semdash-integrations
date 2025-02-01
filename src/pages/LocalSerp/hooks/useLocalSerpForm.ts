import { useState, useCallback } from 'react';
import { DEVICES, OS_OPTIONS, DEFAULT_LOCATION_CODE, DEFAULT_LANGUAGE_CODE } from '../constants';
import { useLocalSerpLocations } from '../../../hooks/useLocalSerpLocations';
import type { LocalSerpParams } from '../types';

export function useLocalSerpForm(onSubmit: (params: LocalSerpParams) => void) {
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState<string[]>(['']);
  const [keywords, setKeywords] = useState('');
  const [device, setDevice] = useState<'desktop' | 'mobile'>(DEVICES.DESKTOP);
  const [os, setOs] = useState(OS_OPTIONS.DESKTOP.WINDOWS);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    locations, 
    selectedLocation, 
    setSelectedLocation, 
    selectedLanguage, 
    setSelectedLanguage 
  } = useLocalSerpLocations();

  const handleDeviceChange = useCallback((newDevice: 'desktop' | 'mobile') => {
    setDevice(newDevice);
    setOs(newDevice === DEVICES.DESKTOP ? OS_OPTIONS.DESKTOP.WINDOWS : OS_OPTIONS.MOBILE.ANDROID);
  }, []);

  const handleAddCompetitor = useCallback(() => {
    setCompetitors(prev => [...prev, '']);
  }, []);

  const handleRemoveCompetitor = useCallback((index: number) => {
    setCompetitors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCompetitorChange = useCallback((index: number, value: string) => {
    setCompetitors(prev => {
      const newCompetitors = [...prev];
      newCompetitors[index] = value;
      return newCompetitors;
    });
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;

    const keywordList = keywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k);

    if (keywordList.length === 0 || keywordList.length > 100) return;

    const validCompetitors = competitors
      .map(c => c.trim())
      .filter(c => c);

    setIsLoading(true);
    onSubmit({
      domain: domain.trim(),
      competitors: validCompetitors,
      keywords: keywordList,
      device,
      os,
      locationCode: selectedLocation?.code || DEFAULT_LOCATION_CODE,
      languageCode: selectedLanguage?.code || DEFAULT_LANGUAGE_CODE
    });
    setIsLoading(false);
  }, [domain, competitors, keywords, device, os, selectedLocation, selectedLanguage, onSubmit]);

  return {
    domain,
    setDomain,
    competitors,
    keywords,
    setKeywords,
    device,
    os,
    isLoading,
    locations,
    selectedLocation,
    selectedLanguage,
    handleDeviceChange,
    handleAddCompetitor,
    handleRemoveCompetitor,
    handleCompetitorChange,
    setSelectedLocation,
    setSelectedLanguage,
    handleSubmit,
    setOs
  };
}