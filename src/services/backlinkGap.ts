import { api } from './api';
import axios from 'axios';

interface BacklinkFilter {
  type: 'all' | 'new' | 'broken' | 'live' | 'lost' | 'dofollow' | 'nofollow';
  domainFrom?: string;
  domainTo?: string;
}

interface BacklinkData {
  rank: number;
  pageFromTitle: string;
  urlFrom: string;
  externalLinks: number;
  internalLinks: number;
  anchor: string;
  urlTo: string;
  firstSeen: string;
  lastSeen: string;
  isNew: boolean;
  isLost: boolean;
  isBroken: boolean;
  dofollow: boolean;
}

interface ApiResponse {
  tasks: Array<{
    result: Array<{
      total_count: number;
      items: Array<{
        page_intersection: {
          '1': Array<{
            rank: number;
            page_from_title: string;
            url_from: string;
            page_from_external_links: number;
            page_from_internal_links: number;
            anchor: string | null;
            url_to: string;
            first_seen: string;
            last_seen: string;
            is_new: boolean;
            is_lost: boolean;
            is_broken: boolean;
            dofollow: boolean;
          }>;
        };
      }>;
    }>;
  }>;
}

export async function fetchBacklinkGap(
  target1: string,
  target2: string,
  includeSubdomains: boolean,
  filters?: BacklinkFilter,
  offset: number = 0
): Promise<{ backlinks: BacklinkData[]; totalCount: number }> {
  try {
    // Clean domain names
    const cleanTarget1 = target1.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const cleanTarget2 = target2.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

    const payload = [{
      targets: { '1': cleanTarget1 },
      exclude_targets: [cleanTarget2],
      limit: 100,
      offset: offset,
      internal_list_limit: 10,
      order_by: ['1.page_from_rank,desc'],
      backlinks_status_type: 'all',
      include_subdomains: includeSubdomains,
      intersection_mode: 'all',
      exclude_internal_backlinks: true,
      include_indirect_links: true
    }];

    // Add filters if provided
    if (filters) {
      const filterArray = [];

      // Add type-based filter
      switch (filters.type) {
        case 'new':
          filterArray.push(['1.is_new', '=', true]);
          break;
        case 'broken':
          filterArray.push(['1.is_broken', '=', true]);
          break;
        case 'live':
          filterArray.push(['1.is_lost', '=', false]);
          break;
        case 'lost':
          filterArray.push(['1.is_lost', '=', true]);
          break;
        case 'dofollow':
          filterArray.push(['1.dofollow', '=', true]);
          break;
        case 'nofollow':
          filterArray.push(['1.dofollow', '=', false]);
          break;
      }

      // Add URL filters
      if (filters.domainFrom && filters.domainTo) {
        // If both filters are present, combine them with AND
        filterArray.push(
          ['1.url_from', 'like', `%${filters.domainFrom}%`],
          'and',
          ['1.url_to', 'like', `%${filters.domainTo}%`]
        );
      } else {
        // Add individual filters if present
        if (filters.domainFrom) {
          filterArray.push(['1.url_from', 'like', `%${filters.domainFrom}%`]);
        }
        if (filters.domainTo) {
          filterArray.push(['1.url_to', 'like', `%${filters.domainTo}%`]);
        }
      }

      if (filterArray.length > 0) {
        payload[0].filters = filterArray;
      }
    }

    const response = await api.post<ApiResponse>('/backlinks/page_intersection/live', payload);

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    const backlinks: BacklinkData[] = [];

    // Process each item in the results
    result.items?.forEach(item => {
      if (item.page_intersection && Array.isArray(item.page_intersection['1'])) {
        item.page_intersection['1'].forEach(intersection => {
          backlinks.push({
            rank: intersection.rank,
            pageFromTitle: intersection.page_from_title || 'No title',
            urlFrom: intersection.url_from,
            externalLinks: intersection.page_from_external_links,
            internalLinks: intersection.page_from_internal_links,
            anchor: intersection.anchor || '',
            urlTo: intersection.url_to,
            firstSeen: intersection.first_seen,
            lastSeen: intersection.last_seen,
            isNew: intersection.is_new || false,
            isLost: intersection.is_lost || false,
            isBroken: intersection.is_broken || false,
            dofollow: intersection.dofollow
          });
        });
      }
    });

    return {
      backlinks,
      totalCount: result.total_count || 0
    };
  } catch (error) {
    console.error('Backlink Gap API Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      if (errorData?.tasks?.[0]?.status_message) {
        throw new Error(errorData.tasks[0].status_message);
      }
      if (errorData?.status_message) {
        throw new Error(errorData.status_message);
      }
      throw new Error(error.message || 'Failed to fetch backlink data');
    }

    throw new Error(error instanceof Error ? error.message : 'Failed to fetch backlink data');
  }
}
