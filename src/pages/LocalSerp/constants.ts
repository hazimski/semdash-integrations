export const DEVICES = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile'
} as const;

export const OS_OPTIONS = {
  DESKTOP: {
    WINDOWS: 'windows',
    MACOS: 'macos'
  },
  MOBILE: {
    ANDROID: 'android',
    IOS: 'ios'
  }
} as const;

export const DEFAULT_LOCATION_CODE = 2840; // United States
export const DEFAULT_LANGUAGE_CODE = 'en';
export const MAX_COMPETITORS = 5;
export const MAX_KEYWORDS = 100;
export const RESULT_SIZE_OPTIONS = [100, 50, 20, 10, 3];

export const POLLING_INTERVAL = 2000; // 2 seconds
export const MAX_RETRIES = 3;