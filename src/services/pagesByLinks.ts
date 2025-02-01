import { api } from './api';

interface PageData {
  title: string;
  page: string;
  backlinks: number;
  referring_domains: number;
  page_summary: {
    broken_backlinks: number;
    broken_pages: number;
    referring_domains: number;
    referring_domains_nofollow: number;
    referring_main_domains: number;
    referring_main_domains_nofollow: number;
    referring_ips: number;
    referring_subnets: number;
    referring_pages: number;
    referring_pages_nofollow: number;
    referring_links_tld: Record<string, number>;
    referring_links_types: {
      anchor: number;
      alternate?: number;
      canonical?: number;
      image?: number;
    };
    referring_links_attributes: {
      nofollow: number;
      noopener?: number;
      noreferrer?: number;
      external?: number;
    };
    referring_links_platform_types: Record<string, number>;
    referring_links_semantic_locations: Record<string, number>;
    referring_links_countries: Record<string, number>;
  };
  referring_links_attributes: {
    nofollow?: number;
  };
  backlinks_spam_score: number;
  first_seen: string;
}

interface PagesResponse {
  tasks: Array<{
    result: Array<{
      total_count: number;
      items: Array<{
        page: string;
        meta: {
          title: string | null;
        };
        page_summary: {
          first_seen: string;
          backlinks: number;
          backlinks_spam_score: number;
          referring_domains: number;
          referring_links_attributes: {
            nofollow?: number;
          } | null;
        };
      }>;
    }>;
  }>;
}

export async function fetchPagesByLinks(
  domain: string,
  includeSubdomains: boolean,
  brokenPages: boolean,
  excludeQueryParams: boolean,
  offset: number = 0
): Promise<{ pages: PageData[], totalCount: number }> {
  try {
    const payload = [{
      target: domain,
      limit: 100,
      offset: offset,
      internal_list_limit: 10,
      order_by: ["page_summary.backlinks,desc"],
      backlinks_status_type: "live",
      include_subdomains: includeSubdomains,
      exclude_internal_backlinks: true
    }];

    // Add filters
    const filters = [];

    // Add broken pages filter if enabled
    if (brokenPages) {
      filters.push(["status_code", "=", 404]);
    }

    // Add exclude query params filter if enabled
    if (excludeQueryParams) {
      if (filters.length > 0) {
        filters.push("and");
      }
      filters.push(["page", "not_like", "%?%"]);
    }

    // Only add filters to payload if we have any
    // Add filters array to payload only if there are actual filters
    if (filters.length > 0) {
      payload[0].filters = filters;
    }

    const response = await api.post<PagesResponse>(
      '/backlinks/domain_pages/live',
      payload
    );

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    const pages = result.items.map(item => ({
      title: item.meta.title || 'No title',
      page: item.page,
      backlinks: item.page_summary.backlinks,
      referring_domains: item.page_summary.referring_domains,
      page_summary: item.page_summary,
      referring_links_attributes: {
        nofollow: item.page_summary.referring_links_attributes?.nofollow || 0
      },
      backlinks_spam_score: item.page_summary.backlinks_spam_score,
      first_seen: item.page_summary.first_seen
    }));

    return {
      pages,
      totalCount: result.total_count
    };
  } catch (error) {
    console.error('Pages By Links API Error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch pages data');
  }
}
