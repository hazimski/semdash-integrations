import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

interface Language {
  code: string;
  name: string;
}

interface Location {
  code: number;
  name: string;
  languages: Language[];
}

export function useLocalSerpLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    code: 9112359,
    name: 'Egypt',
    languages: [{ code: 'en', name: 'English' }]
  });
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({ 
    code: 'en', 
    name: 'English' 
  });

  useEffect(() => {
    async function loadLocations() {
      try {
        const { data, error } = await supabase
          .from('local_serp_locations')
          .select('*')
          .order('name');

        if (error) throw error;

        if (data) {
          setLocations(data);
          // Set initial location and language
          if (data.length > 0) {
            setSelectedLocation(data[0]);
            setSelectedLanguage(data[0].languages[0]);
          }
        }
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    }

    loadLocations();
  }, []);

  return {
    locations,
    selectedLocation,
    setSelectedLocation,
    selectedLanguage,
    setSelectedLanguage
  };
}