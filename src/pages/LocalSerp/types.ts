// Types for Local SERP feature
export interface LocalSerpLocation {
  code: number;
  name: string;
  languages: LocalSerpLanguage[];
}

export interface LocalSerpLanguage {
  code: string;
  name: string;
}

export interface LocalSerpParams {
  domain: string;
  competitors: string[];
  keywords: string[];
  device: 'desktop' | 'mobile';
  os: string;
  locationCode: number;
  languageCode: string;
}

export interface LocalSerpResult {
  keyword: string;
  check_url: string;
  items: LocalSerpItem[];
}

export interface LocalSerpItem {
  type: string;
  rank_absolute: number;
  url: string;
  datetime: string;
}

export interface LocalSerpTask {
  id: string;
  status_code: number;
  status_message: string;
  result: any;
}