import { api } from './api';
import { subMonths, subDays, format } from 'date-fns';

interface ReferringDomainFilter {
  type: 'all' | 'lost' | 'dofollow' | 'nofollow';
  domain?: string;
}

interface SortConfig {
  field: 'rank' | 'backlinks' | 'broken_backlinks' | 'referring_pages' | 'broken_pages' | 'backlinks_spam_score' | 'first_seen';
  direction: 'asc' | 'desc';
}

interface ReferringDomainData {
  domain: string;
  rank: number;
  backlinks: number;
  brokenBacklinks: number;
  referringPages: number;
  brokenPages: number;
  spamScore: number;
  firstSeen: string;
  isNew: boolean;
  isLost: boolean;
  isBroken: boolean;
  dofollow: boolean;
}

interface HistoryApiResponse {
  tasks: Array<{
    result: Array<{
      items: Array<{
        type: string;
        date: string;
        referring_main_domains: number;
        new_referring_domains: number;
        lost_referring_domains: number;
        backlinks: number;
        rank: number;
      }>;
    }>;
  }>;
}

export async function fetchReferringDomainsHistory(target: string) {
  try {
    const toDate = subDays(new Date(), 2);
    const fromDate = subMonths(toDate, 8);

    const payload = [{
      target,
      date_from: format(fromDate, 'yyyy-MM-dd'),
      date_to: format(toDate, 'yyyy-MM-dd')
    }];

    const response = await api.post<HistoryApiResponse>(
      '/backlinks/history/live',
      payload
    );

    if (!response.data?.tasks?.[0]?.result?.[0]?.items) {
      throw new Error('No history data received from API');
    }

    // Sort items by date in ascending order
    const sortedItems = response.data.tasks[0].result[0].items
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sortedItems;
  } catch (error) {
    console.error('Referring Domains History API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch history data');
  }
}

export async function fetchReferringDomains(
  target: string,
  includeSubdomains: boolean,
  filters?: ReferringDomainFilter,
  sort?: SortConfig,
  offset: number = 0
): Promise<{ domains: ReferringDomainData[]; totalCount: number }> {
  try {
    // Clean domain name
    const cleanTarget = target.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

    const payload = [{
      target: cleanTarget,
      limit: 100,
      offset: offset,
      internal_list_limit: 10,
      order_by: sort ? [`${sort.field},${sort.direction}`] : ['rank,desc'],
      backlinks_status_type: 'all',
      include_subdomains: includeSubdomains,
      exclude_internal_backlinks: true,
      include_indirect_links: true
    }];

    // Add filters if provided
    if (filters) {
      const filterArray = [];

      // Add type-based filter
      switch (filters.type) {
        case 'lost':
          filterArray.push(['is_lost', '=', true]);
          break;
        case 'dofollow':
          filterArray.push(['dofollow', '=', true]);
          break;
        case 'nofollow':
          filterArray.push(['dofollow', '=', false]);
          break;
      }

      // Add domain filter if provided
      if (filters.domain) {
        if (filterArray.length > 0) {
          filterArray.push('and');
        }
        filterArray.push(['domain', 'like', `%${filters.domain}%`]);
      }

      // Only add filters to payload if we have any
      if (filterArray.length > 0) {
        payload[0].backlinks_filters = filterArray;
      }
    }

    const response = await api.post(
      '/backlinks/referring_domains/live',
      payload
    );

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    return {
      domains: result.items.map(item => ({
        domain: item.domain,
        rank: item.rank,
        backlinks: item.backlinks,
        brokenBacklinks: item.broken_backlinks,
        referringPages: item.referring_pages,
        brokenPages: item.broken_pages,
        spamScore: item.backlinks_spam_score,
        firstSeen: item.first_seen,
        isNew: item.is_new || false,
        isLost: item.is_lost || false,
        isBroken: item.is_broken || false,
        dofollow: item.dofollow
      })),
      totalCount: result.total_count
    };
  } catch (error) {
    console.error('Referring Domains API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch referring domains data');
  }
}
