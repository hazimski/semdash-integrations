import axios from 'axios';
import { api } from './api';
import { locations } from '../data/locations';
import { cleanDomain } from '../utils/url';

export async function fetchTopKeywords(
  domain: string,
  locationCode: string,
  languageCode: string,
  limit: number = 6
) {
  try {
    const cleanedDomain = cleanDomain(domain);
    const payload = [{
      target: cleanedDomain,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      historical_serp_mode: "live",
      ignore_synonyms: true,
      include_clickstream_data: false,
      load_rank_absolute: true,
      limit: limit,
      order_by: ["ranked_serp_element.serp_item.etv,desc"]
    }];

    const response = await api.post('/dataforseo_labs/google/ranked_keywords/live', payload);

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    return {
      keywords: result.items || [],
      metrics: result.metrics?.organic || null,
      totalCount: result.total_count || 0
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch top keywords');
    }
    throw error;
  }
}

export async function fetchCompetitors(
  domain: string,
  locationCode: string,
  languageCode: string,
  limit: number = 100,
  intersectingDomains?: string[],
  offset: number = 0
) {
  try {
    const cleanedDomain = cleanDomain(domain);
    const payload = [{
      target: cleanedDomain,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      exclude_top_domains: true,
      max_rank_group: limit,
      ignore_synonyms: true,
      include_clickstream_data: false,
      intersecting_domains: intersectingDomains?.map(d => d.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')),
      item_types: ["organic", "featured_snippet"],
      limit: 100,
      offset: offset,
      order_by: ["intersections,desc"]
    }];

    const response = await api.post('/dataforseo_labs/google/competitors_domain/live', payload);

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    const competitors = result.items.map(item => ({
      domain: item.domain,
      keywords: item.full_domain_metrics?.organic?.count || 0,
      traffic: item.full_domain_metrics?.organic?.etv || 0,
      metrics: item.full_domain_metrics?.organic || null
    }));

    return {
      competitors,
      totalCount: result.total_count || 0
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch competitors');
    }
    throw error;
  }
}

export async function fetchTopPages(
  domain: string,
  locationCode: string,
  languageCode: string,
  limit: number = 10,
  offset: number = 0,
  filters?: any[]
) {
  try {
    const cleanedDomain = cleanDomain(domain);
    const payload = [{
      target: cleanedDomain,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      historical_serp_mode: "live",
      include_clickstream_data: false,
      limit: limit,
      offset: offset,
      order_by: ["metrics.organic.etv,desc"]
    }];
    
    // Add filters if provided
    if (filters && filters.length > 0) {
      payload[0].filters = filters;
    }

    const response = await api.post('/dataforseo_labs/google/relevant_pages/live', payload);

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    const pages = result.items.map(item => ({
      page_address: item.page_address,
      keywords: item.metrics?.organic?.count || 0,
      traffic: item.metrics?.organic?.etv || 0,
      metrics: item.metrics?.organic || null
    }));

    return {
      pages,
      totalCount: result.total_count || 0
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch top pages');
    }
    throw error;
  }
}

export async function fetchTrafficDistribution(domain: string) {
  try {
    const cleanedDomain = cleanDomain(domain);
    const payload = [{
      target: cleanedDomain,
      ignore_synonyms: true,
      limit: 100
    }];

    const response = await api.post('/dataforseo_labs/google/domain_rank_overview/live', payload);

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const items = response.data.tasks[0].result[0].items;
    const locationMap = new Map();
    items.forEach(item => {
      const locationCode = item.location_code;
      if (!locationMap.has(locationCode)) {
        locationMap.set(locationCode, {
          code: locationCode,
          name: locations.find(loc => loc.code === locationCode.toString())?.name || locationCode,
          traffic: 0,
          keywords: 0
        });
      }
      const location = locationMap.get(locationCode);
      location.traffic += item.metrics?.organic?.etv || 0;
      location.keywords += item.metrics?.organic?.count || 0;
    });

    const sortedLocations = Array.from(locationMap.values())
      .sort((a, b) => b.traffic - a.traffic);

    const worldwideTraffic = sortedLocations.reduce((sum, item) => sum + item.traffic, 0);
    const worldwideKeywords = sortedLocations.reduce((sum, item) => sum + item.keywords, 0);

    const top5Locations = sortedLocations.slice(0, 5);
    const top5Traffic = top5Locations.reduce((sum, item) => sum + item.traffic, 0);
    const top5Keywords = top5Locations.reduce((sum, item) => sum + item.keywords, 0);

    return {
      worldwide: {
        traffic: worldwideTraffic,
        keywords: worldwideKeywords
      },
      countries: top5Locations.map(item => ({
        code: item.code,
        name: item.name,
        traffic: item.traffic,
        trafficShare: (item.traffic / worldwideTraffic) * 100,
        keywords: item.keywords
      })),
      others: {
        traffic: worldwideTraffic - top5Traffic,
        trafficShare: ((worldwideTraffic - top5Traffic) / worldwideTraffic) * 100,
        keywords: worldwideKeywords - top5Keywords
      }
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch traffic distribution');
    }
    throw error;
  }
}

export async function fetchBacklinksData(domain: string) {
  try {
    const cleanedDomain = cleanDomain(domain);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 7);

    const payload = [{
      target: cleanedDomain,
      date_from: startDate.toISOString().split('T')[0],
      date_to: endDate.toISOString().split('T')[0]
    }];

    const response = await api.post('/backlinks/history/live', payload);

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    const items = result.items;

    const latestMetrics = items[items.length - 1];

    return {
      metrics: {
        rank: latestMetrics.rank,
        backlinks: latestMetrics.backlinks,
        referringDomains: latestMetrics.referring_domains,
        brokenPages: latestMetrics.broken_pages,
        brokenBacklinks: latestMetrics.broken_backlinks,
        ips: latestMetrics.referring_ips,
        subnets: latestMetrics.referring_subnets
      },
      history: items.map(item => ({
        date: item.date,
        backlinks: item.backlinks,
        referring_domains: item.referring_domains,
        new_backlinks: item.new_backlinks,
        lost_backlinks: item.lost_backlinks,
        new_referring_domains: item.new_referring_domains,
        lost_referring_domains: item.lost_referring_domains
      }))
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch backlinks data');
    }
    throw error;
  }
}
