export function getShareUrl(token: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}/shared/${token}`;
}

export function getAppUrl(): string {
  return import.meta.env.VITE_APP_URL || window.location.origin;
}

export function cleanDomain(input: string): string {
  if (!input) {
    throw new Error('Domain is required');
  }

  // Remove whitespace
  let domain = input.trim();

  // Remove protocol
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/i, '');

  // Remove trailing slash
  domain = domain.replace(/\/$/, '');

  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    throw new Error('Invalid domain format');
  }

  return domain;
}

export function isValidDomain(domain: string): boolean {
  try {
    cleanDomain(domain);
    return true;
  } catch {
    return false;
  }
}