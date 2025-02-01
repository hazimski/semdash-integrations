import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';
import { MetricsBoxes } from '../components/domain/MetricsBoxes';
import { TrafficDistributionTable } from '../components/domain/TrafficDistributionTable';
import { TopPagesTable } from '../components/domain/TopPagesTable';
import { CompetitorsTable } from '../components/domain/CompetitorsTable';
import { BacklinksHistoryCharts } from '../components/domain/BacklinksHistoryCharts';
import { BacklinksGainsLossesCharts } from '../components/domain/BacklinksGainsLossesCharts';
import { PositionDistributionChart } from '../components/domain/PositionDistributionChart';
import { fetchTopKeywords, fetchCompetitors, fetchTopPages, fetchTrafficDistribution, fetchBacklinksData } from '../services/domain';
import { fetchHistoricalRankOverview } from '../services/performance';
import { exportDomainOverviewPDF } from '../utils/pdf';
import { RankedKeywordsPreviewTable } from '../components/domain/RankedKeywordsPreviewTable';
import { fetchDomainRankedKeywordsPreview } from '../services/domainRankedKeywords';
import { OrganicKeywordsChart } from './Performance/OrganicKeywordsChart';
import { PerformanceChart } from './Performance/PerformanceChart';
import { saveDomainHistory, getDomainHistoryEntry, DomainHistoryEntry } from '../services/domainHistory';
import { useCredits } from '../hooks/useCredits';
import { DomainOverviewHeader } from '../components/domain/DomainOverviewHeader';
import { locations } from '../data/locations';
import { CopilotAI } from '../components/domain/CopilotAI';

interface DomainOverviewProps {
  sharedData?: DomainHistoryEntry;
}

interface SectionState {
  data: any;
  isLoading: boolean;
  error: string | null;
}

export function DomainOverview({ sharedData }: DomainOverviewProps) {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isStoredData, setIsStoredData] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const { checkCredits, deductUserCredits } = useCredits();
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // State for each section
  const [keywordsData, setKeywordsData] = useState<SectionState>({
    data: null,
    isLoading: true,
    error: null
  });
  const [competitorsData, setCompetitorsData] = useState<SectionState>({
    data: null,
    isLoading: true,
    error: null
  });
  const [pagesData, setPagesData] = useState<SectionState>({
    data: null,
    isLoading: true,
    error: null
  });
  const [trafficData, setTrafficData] = useState<SectionState>({
    data: null,
    isLoading: true,
    error: null
  });
  const [backlinksData, setBacklinksData] = useState<SectionState>({
    data: null,
    isLoading: true,
    error: null
  });
  const [performanceData, setPerformanceData] = useState<SectionState>({
    data: [],
    isLoading: true,
    error: null
  });
  const [rankedKeywords, setRankedKeywords] = useState<SectionState>({
    data: [],
    isLoading: true,
    error: null
  });

  const currentParams = {
    domain: searchParams.get('domain') || '',
    location: searchParams.get('location') || '',
    language: searchParams.get('language') || ''
  };

  const loadStoredData = useCallback(async () => {
    try {
      if (sharedData) {
        setKeywordsData({ data: sharedData.data.keywords, isLoading: false, error: null });
        setCompetitorsData({ data: sharedData.data.competitors, isLoading: false, error: null });
        setPagesData({ data: sharedData.data.pages, isLoading: false, error: null });
        setTrafficData({ data: sharedData.data.traffic, isLoading: false, error: null });
        setBacklinksData({ data: sharedData.data.backlinks, isLoading: false, error: null });
        setPerformanceData({ data: sharedData.data.performance || [], isLoading: false, error: null });
        setRankedKeywords({ data: sharedData.data.rankedKeywords || [], isLoading: false, error: null });
        setIsStoredData(true);
        setIsLoading(false);
        return true;
      }

      const historyEntry = await getDomainHistoryEntry(
        currentParams.domain,
        currentParams.location,
        currentParams.language
      );

      if (historyEntry) {
        setKeywordsData({ data: historyEntry.data.keywords, isLoading: false, error: null });
        setCompetitorsData({ data: historyEntry.data.competitors, isLoading: false, error: null });
        setPagesData({ data: historyEntry.data.pages, isLoading: false, error: null });
        setTrafficData({ data: historyEntry.data.traffic, isLoading: false, error: null });
        setBacklinksData({ data: historyEntry.data.backlinks, isLoading: false, error: null });
        setPerformanceData({ data: historyEntry.data.performance || [], isLoading: false, error: null });
        setRankedKeywords({ data: historyEntry.data.rankedKeywords || [], isLoading: false, error: null });
        setHistoryId(historyEntry.id);
        setIsStoredData(true);
        setIsLoading(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error loading stored data:', error);
      return false;
    }
  }, [currentParams.domain, currentParams.location, currentParams.language, sharedData]);

  const fetchFreshData = useCallback(async () => {
    if (!currentParams.domain || hasInitialLoad) return;

    const hasCredits = await checkCredits(30);
    if (!hasCredits) return;

    setIsLoading(true);
    setIsStoredData(false);

    const fetchWithErrorHandling = async (
      fetchFn: () => Promise<any>,
      setStateFn: React.Dispatch<React.SetStateAction<SectionState>>
    ) => {
      setStateFn(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchFn();
        setStateFn({ data, isLoading: false, error: null });
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
        setStateFn(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        return null;
      }
    };

    try {
      const [
        keywords,
        competitors,
        pages,
        traffic,
        backlinks,
        performance,
        ranked
      ] = await Promise.all([
        fetchWithErrorHandling(
          () => fetchTopKeywords(currentParams.domain, currentParams.location, currentParams.language),
          setKeywordsData
        ),
        fetchWithErrorHandling(
          () => fetchCompetitors(currentParams.domain, currentParams.location, currentParams.language),
          setCompetitorsData
        ),
        fetchWithErrorHandling(
          () => fetchTopPages(currentParams.domain, currentParams.location, currentParams.language),
          setPagesData
        ),
        fetchWithErrorHandling(
          () => fetchTrafficDistribution(currentParams.domain),
          setTrafficData
        ),
        fetchWithErrorHandling(
          () => fetchBacklinksData(currentParams.domain),
          setBacklinksData
        ),
        fetchWithErrorHandling(
          () => fetchHistoricalRankOverview(currentParams.domain, currentParams.location, currentParams.language),
          setPerformanceData
        ),
        fetchWithErrorHandling(
          () => fetchDomainRankedKeywordsPreview(currentParams.domain, currentParams.location, currentParams.language),
          setRankedKeywords
        )
      ]);

      if (keywords || competitors || pages || traffic || backlinks || performance || ranked) {
        const deducted = await deductUserCredits(30, 'Domain Overview');
        if (!deducted) {
          throw new Error('Failed to process credits');
        }
      }

      if (backlinks?.metrics && traffic?.worldwide) {
        const savedId = await saveDomainHistory(
          currentParams.domain,
          currentParams.location,
          currentParams.language,
          {
            domainRank: backlinks.metrics.rank,
            organicTraffic: traffic.worldwide.traffic,
            keywords: traffic.worldwide.keywords,
            backlinks: backlinks.metrics.backlinks,
            referringDomains: backlinks.metrics.referringDomains,
            brokenPages: backlinks.metrics.brokenPages,
            brokenBacklinks: backlinks.metrics.brokenBacklinks,
            ips: backlinks.metrics.ips,
            subnets: backlinks.metrics.subnets
          },
          {
            keywords,
            competitors,
            pages,
            traffic,
            backlinks,
            performance,
            rankedKeywords: ranked
          }
        );
        setHistoryId(savedId);
      }

      setHasInitialLoad(true);
    } catch (err) {
      toast.error('Some data could not be loaded');
    } finally {
      setIsLoading(false);
    }
  }, [currentParams.domain, currentParams.location, currentParams.language, checkCredits, deductUserCredits, hasInitialLoad]);

  useEffect(() => {
    const initializeData = async () => {
      if (!currentParams.domain && !sharedData) return;
      
      const hasStoredData = await loadStoredData();
      if (!hasStoredData && !sharedData) {
        await fetchFreshData();
      }
    };

    initializeData();
  }, [currentParams.domain, loadStoredData, fetchFreshData, sharedData]);

  const handleExportPDF = async () => {
    if (!backlinksData?.data?.metrics || !trafficData?.data?.worldwide) return;

    try {
      await exportDomainOverviewPDF(currentParams.domain, {
        domainRank: backlinksData.data.metrics.rank,
        organicTraffic: trafficData.data.worldwide.traffic,
        keywords: trafficData.data.worldwide.keywords,
        backlinks: backlinksData.data.metrics.backlinks,
        referringDomains: backlinksData.data.metrics.referringDomains,
        brokenPages: backlinksData.data.metrics.brokenPages,
        brokenBacklinks: backlinksData.data.metrics.brokenBacklinks,
        ips: backlinksData.data.metrics.ips,
        subnets: backlinksData.data.metrics.subnets
      }, chartsRef);
      toast.success('PDF exported successfully');
    } catch (err) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-6">
      <DomainOverviewHeader
        domain={currentParams.domain || sharedData?.domain || ''}
        onAnalyze={fetchFreshData}
        onExport={handleExportPDF}
        isLoading={isLoading}
        isStoredData={isStoredData}
        historyId={historyId}
      />

      {!sharedData && (
        <CopilotAI 
          domain={currentParams.domain}
          data={keywordsData.data}
          isLoading={keywordsData.isLoading}
        />
      )}

      {backlinksData?.data?.metrics && trafficData?.data?.worldwide && (
        <MetricsBoxes
          metrics={{
            domainRank: backlinksData.data.metrics.rank,
            organicTraffic: trafficData.data.worldwide.traffic,
            keywords: trafficData.data.worldwide.keywords,
            backlinks: backlinksData.data.metrics.backlinks,
            referringDomains: backlinksData.data.metrics.referringDomains,
            brokenPages: backlinksData.data.metrics.brokenPages,
            brokenBacklinks: backlinksData.data.metrics.brokenBacklinks,
            ips: backlinksData.data.metrics.ips,
            subnets: backlinksData.data.metrics.subnets
          }}
          domain={currentParams.domain || sharedData?.domain || ''}
          locationCode={currentParams.location || sharedData?.location_code || ''}
          languageCode={currentParams.language || sharedData?.language_code || ''}
        />
      )}

      <div ref={chartsRef} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="traffic-distribution">
            <TrafficDistributionTable 
              data={trafficData.data} 
              isLoading={trafficData.isLoading} 
            />
          </div>
          {keywordsData?.data?.metrics && (
            <div className="position-distribution">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Organic Position Distribution
                </h2>
                <div className="h-[400px]">
                  <PositionDistributionChart metrics={keywordsData.data.metrics} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          <b>Organic Research</b>: {locations.find(loc => loc.code === currentParams.location)?.name || 'Unknown'} •
          Language: {locations.find(loc => loc.code === currentParams.location)?.languages.find(lang => lang.code === currentParams.language)?.name || 'Unknown'}
        </div>
        <div className="border-t border-[#0281DF] mt-2"></div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 organic-keywords">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Organic Keywords Distribution
            </h2>
            <div className="h-[400px]">
              <OrganicKeywordsChart 
                data={performanceData.data} 
                isLoading={performanceData.isLoading} 
                error={performanceData.error} 
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 performance-metrics">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Performance Metrics
            </h2>
            <div className="h-[400px]">
              <PerformanceChart 
                data={performanceData.data} 
                isLoading={performanceData.isLoading} 
                error={performanceData.error} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <RankedKeywordsPreviewTable
            keywords={rankedKeywords.data}
            domain={currentParams.domain || sharedData?.domain || ''}
            locationCode={currentParams.location || sharedData?.location_code || ''}
            languageCode={currentParams.language || sharedData?.language_code || ''}
            isLoading={rankedKeywords.isLoading}
            error={rankedKeywords.error}
          />
          <TopPagesTable
            pages={pagesData.data?.pages || []}
            totalCount={pagesData.data?.totalCount || 0}
            isLoading={pagesData.isLoading}
            currentParams={currentParams}
          />
        </div>

        <div className="competitive-map">
          <CompetitorsTable
            competitors={competitorsData.data?.competitors || []}
            totalCount={competitorsData.data?.totalCount || 0}
            isLoading={competitorsData.isLoading}
            currentParams={currentParams}
          />
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          <b>Backlinks:</b> Worldwide • Language: All
        </div>
        <div className="border-t border-[#AB6CFE] mt-2"></div>

        <div className="backlinks-history">
          <BacklinksHistoryCharts 
            data={backlinksData.data?.history} 
            isLoading={backlinksData.isLoading} 
          />
        </div>
        
        <div className="backlinks-gains-losses">
          <BacklinksGainsLossesCharts 
            data={backlinksData.data?.history} 
            isLoading={backlinksData.isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
