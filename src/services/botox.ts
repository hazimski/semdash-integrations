import { api } from './api';

interface BacklinkFilter {
  type: 'all' | 'new' | 'broken' | 'live' | 'lost' | 'dofollow' | 'nofollow';
  pageTitles?: { value: string; operator: 'and' | 'or' }[];
  urlFromPatterns?: { value: string; operator: 'and' | 'or' }[];
  urlToPatterns?: { value: string; operator: 'and' | 'or' }[];
  urlPattern?: string;
  urlType?: 'from' | 'to';
  urlFrom?: string;
  urlTo?: string;
  itemType?: string;
  minKeywordsTop10?: number;
  maxKeywordsTop10?: number;
}

interface SortConfig {
  field: 'domain_from_rank' | 'first_seen' | 'last_seen';
  direction: 'asc' | 'desc';
}

export async function fetchBotoxBacklinks(
  target: string,
  includeSubdomains: boolean,
  mode: 'as_is' | 'one_per_domain' | 'one_per_anchor' = 'as_is',
  filters?: BacklinkFilter,
  sort?: SortConfig,
  offset: number = 0
): Promise<{ backlinks: any[]; totalCount: number }> {
  try {
    // Check if target is a full page URL (contains path)
    const isPage = target.includes('/') && !target.endsWith('/');
    
    // For pages, ensure URL has protocol
    // For domains/subdomains, remove protocol and www
    const cleanTarget = isPage
      ? target.startsWith('http') ? target : `https://${target}`
      : target.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

    console.log('Filters received:', filters); // Debug log

    const payload = [{
      target: cleanTarget,
      limit: 100,
      offset: offset,
      internal_list_limit: 10,
      backlinks_status_type: filters?.type === 'all' ? 'all' : 'live',
      include_subdomains: includeSubdomains,
      exclude_internal_backlinks: true,
      include_indirect_links: true,
      mode: mode
    }];

    // Add sorting if provided
    if (sort) {
      payload[0].order_by = [`${sort.field},${sort.direction}`];
    }

    // Add filters if provided
    if (filters) {
      const filterArray = [];
      
      // Add page title filters
      if (filters.pageTitles?.length) {
        const titleFilters = filters.pageTitles.filter(title => title.value.trim());
        
        if (titleFilters.length > 0) {
          const groupedTitles = titleFilters.map(title => 
            ["page_from_title", "like", `%${title.value}%`]
          );
          
          // Use the operator from the filters
          const nestedTitles = groupedTitles.reduce((acc, curr, idx) => {
            if (idx === 0) return curr;
            return [acc, titleFilters[idx].operator.toLowerCase(), curr];
          });
          
          if (filterArray.length > 0) {
            filterArray.push("and", nestedTitles);
          } else {
            filterArray.push(nestedTitles);
          }
        }
      }

      // Add type-based filter
      switch (filters.type) {
        case 'new':
          if (filterArray.length > 0) filterArray.push("and");
          filterArray.push(['is_new', '=', true]);
          break;
        case 'broken':
          if (filterArray.length > 0) filterArray.push("and");
          filterArray.push(['is_broken', '=', true]);
          break;
        case 'live':
          if (filterArray.length > 0) filterArray.push("and");
          filterArray.push(['is_lost', '=', false]);
          break;
        case 'lost':
          if (filterArray.length > 0) filterArray.push("and");
          filterArray.push(['is_lost', '=', true]);
          break;
        case 'dofollow':
          if (filterArray.length > 0) filterArray.push("and");
          filterArray.push(['dofollow', '=', true]);
          break;
        case 'nofollow':
          if (filterArray.length > 0) filterArray.push("and");
          filterArray.push(['dofollow', '=', false]);
          break;
      }

      // Add item type filter
      if (filters.itemType) {
        if (filterArray.length > 0) filterArray.push("and");
        filterArray.push(["item_type", "=", filters.itemType]);
      }

      // Add keywords top 10 filter
      if (filters.minKeywordsTop10 !== undefined || filters.maxKeywordsTop10 !== undefined) {
        if (filterArray.length > 0) filterArray.push("and");
        
        if (filters.minKeywordsTop10 !== undefined && filters.maxKeywordsTop10 !== undefined) {
          filterArray.push(
            ["ranked_keywords_info.page_from_keywords_count_top_10", ">=", filters.minKeywordsTop10],
            "and",
            ["ranked_keywords_info.page_from_keywords_count_top_10", "<=", filters.maxKeywordsTop10]
          );
        } else if (filters.minKeywordsTop10 !== undefined) {
          filterArray.push(["ranked_keywords_info.page_from_keywords_count_top_10", ">=", filters.minKeywordsTop10]);
        } else if (filters.maxKeywordsTop10 !== undefined) {
          filterArray.push(["ranked_keywords_info.page_from_keywords_count_top_10", "<=", filters.maxKeywordsTop10]);
        }
      }

      // Add URL filters
      if (filters.urlFrom && filters.urlTo) {
        // For URL patterns, keep http:// and https:// if provided
        if (filterArray.length > 0) filterArray.push("and");
        filterArray.push(
          ['url_from', 'like', `%${filters.urlFrom}%`],
          "and",
          ['url_to', 'like', `%${filters.urlTo}%`]
        );
      } else {
        if (filters.urlFrom) {
          if (filterArray.length > 0) filterArray.push("and");
          // For URL patterns, keep http:// and https:// if provided
          filterArray.push(['url_from', 'like', `%${filters.urlFrom}%`]);
        }
        if (filters.urlTo) {
          if (filterArray.length > 0) filterArray.push("and");
          // For URL patterns, keep http:// and https:// if provided  
          filterArray.push(['url_to', 'like', `%${filters.urlTo}%`]);
        }
      }

      // Handle URL From patterns
      if (filters.urlFromPatterns?.length) {
        const urlFromFilters = filters.urlFromPatterns.filter(pattern => pattern.value.trim());
        
        if (urlFromFilters.length > 0) {
          const groupedPatterns = urlFromFilters.map(pattern => 
            ["url_from", "like", `%${pattern.value}%`]
          );
          
          // Use the operator from the filters
          const nestedPatterns = groupedPatterns.reduce((acc, curr, idx) => {
            if (idx === 0) return curr;
            return [acc, urlFromFilters[idx].operator.toLowerCase(), curr];
          });
          
          if (filterArray.length > 0) {
            filterArray.push("and", nestedPatterns);
          } else {
            filterArray.push(nestedPatterns);
          }
        }
      }

      // Handle URL To patterns
      if (filters.urlToPatterns?.length) {
        const urlToFilters = filters.urlToPatterns.filter(pattern => pattern.value.trim());
        
        if (urlToFilters.length > 0) {
          const groupedPatterns = urlToFilters.map(pattern => 
            ["url_to", "like", `%${pattern.value}%`]
          );
          
          // Use the operator from the filters
          const nestedPatterns = groupedPatterns.reduce((acc, curr, idx) => {
            if (idx === 0) return curr;
            return [acc, urlToFilters[idx].operator.toLowerCase(), curr];
          });
          
          if (filterArray.length > 0) {
            filterArray.push("and", nestedPatterns);
          } else {
            filterArray.push(nestedPatterns);
          }
        }
      }

      console.log('Filter array:', filterArray); // Debug log
      if (filterArray.length > 0) {
        payload[0].filters = filterArray;
      }
    }

    console.log('API payload:', JSON.stringify(payload, null, 2)); // Debug log

    const response = await api.post(
      '/backlinks/backlinks/live',
      payload
    );

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    return {
      backlinks: result.items.map(item => ({
        type: item.type,
        domainFromRank: item.domain_from_rank,
        pageFromKeywordsCountTop10: item.ranked_keywords_info?.page_from_keywords_count_top_10 || 0,
        pageFromTitle: item.page_from_title,
        urlFrom: item.url_from,
        pageFromExternalLinks: item.page_from_external_links,
        pageFromInternalLinks: item.page_from_internal_links,
        anchor: item.anchor,
        urlTo: item.url_to,
        imageUrl: item.item_type === 'image' ? item.image_url : undefined,
        firstSeen: item.first_seen,
        lastSeen: item.last_seen,
        isNew: item.is_new,
        isLost: item.is_lost,
        isBroken: item.is_broken,
        dofollow: item.dofollow
      })),
      totalCount: result.total_count
    };
  } catch (error) {
    console.error('Botox API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch backlink data');
  }
}
