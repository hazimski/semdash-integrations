import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CreditsProvider } from './contexts/CreditsContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Settings } from './pages/Settings';
import { TopicalMap } from './pages/TopicalMap';
import { TopicalMapResults } from './pages/TopicalMap/Results';
import { Analytics } from './pages/Analytics';
import { BacklinkAnalysis } from './pages/BacklinkAnalysis';
import { BacklinkGap } from './pages/BacklinkGap';
import { Botox } from './pages/Botox';
import { BotoxResults } from './pages/Botox/Results';
import { BulkTrafficShare } from './pages/BulkTrafficShare';
import { BulkTrafficShareResults } from './pages/BulkTrafficShare/Results';
import { CompetitorAnalysis } from './pages/CompetitorAnalysis';
import { CompetitorAnalysisResults } from './pages/CompetitorAnalysis/Results';
import { CompetitorDomains } from './pages/CompetitorDomains';
import { Dashboard } from './pages/Dashboard';
import { DomainAnalysis } from './pages/DomainAnalysis';
import { DomainOverview } from './pages/DomainOverview';
import { DomainSearch } from './pages/DomainSearch';
import { KeywordClustering } from './pages/KeywordClustering';
import { KeywordClusteringResults } from './pages/KeywordClustering/Results';
import { KeywordGap } from './pages/KeywordGap';
import { KeywordGapResults } from './pages/KeywordGap/Results';
import { KeywordLists } from './pages/KeywordLists';
import { KeywordListDetails } from './pages/KeywordLists/ListDetails';
import { KeywordOverview } from './pages/KeywordOverview';
import { KeywordOverviewResults } from './pages/KeywordOverview/Results';
import { LocalSerp } from './pages/LocalSerp';
import { LocalSerpResults } from './pages/LocalSerp/Results';
import { LocalSerpHistory } from './pages/LocalSerp/LocalSerpHistory';
import { MapsChecker } from './pages/MapsChecker';
import { MapsCheckerResults } from './pages/MapsChecker/Results';
import { PagesByLinks } from './pages/PagesByLinks';
import { PagesByLinksResults } from './pages/PagesByLinks/Results';
import { Performance } from './pages/Performance';
import { PerformanceResults } from './pages/Performance/Results';
import { PPA } from './pages/PPA';
import { PPAResults } from './pages/PPA/Results';
import { RankedKeywords } from './pages/RankedKeywords';
import { RankedKeywordsResults } from './pages/RankedKeywords/Results';
import { ReferringDomains } from './pages/ReferringDomains';
import { ReferringDomainsResults } from './pages/ReferringDomains/Results';
import { SeedKeywordSearch } from './pages/SeedKeywordSearch';
import { SeedKeywordResults } from './pages/SeedKeywordResults';
import { SerpChecker } from './pages/SerpChecker';
import { SerpCheckerResults } from './pages/SerpChecker/Results';
import { SingleTrafficShare } from './pages/SingleTrafficShare';
import { SingleTrafficShareResults } from './pages/SingleTrafficShare/Results';
import { TrafficShare } from './pages/TrafficShare';
import { TrafficShareResults } from './pages/TrafficShare/Results';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <CreditsProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/backlink-analysis" element={<BacklinkAnalysis />} />
                  <Route path="/backlink-gap" element={<BacklinkGap />} />
                  <Route path="/backlink-gap/results" element={<BacklinkGapResults />} />
                  <Route path="/botox" element={<Botox />} />
                  <Route path="/botox/results" element={<BotoxResults />} />
                  <Route path="/bulk-traffic-share" element={<BulkTrafficShare />} />
                  <Route path="/bulk-traffic-share/results" element={<BulkTrafficShareResults />} />
                  <Route path="/competitor-analysis" element={<CompetitorAnalysis />} />
                  <Route path="/competitor-analysis/results" element={<CompetitorAnalysisResults />} />
                  <Route path="/competitor-domains" element={<CompetitorDomains />} />
                  <Route path="/domain-analysis" element={<DomainAnalysis />} />
                  <Route path="/domain-overview" element={<DomainOverview />} />
                  <Route path="/domain-search" element={<DomainSearch />} />
                  <Route path="/keyword-clustering" element={<KeywordClustering />} />
                  <Route path="/keyword-clustering/results" element={<KeywordClusteringResults />} />
                  <Route path="/keyword-gap" element={<KeywordGap />} />
                  <Route path="/keyword-gap/results" element={<KeywordGapResults />} />
                  <Route path="/keyword-lists" element={<KeywordLists />} />
                  <Route path="/keyword-lists/:id" element={<KeywordListDetails />} />
                  <Route path="/keyword-overview" element={<KeywordOverview />} />
                  <Route path="/keyword-overview/results" element={<KeywordOverviewResults />} />
                  <Route path="/local-serp" element={<LocalSerp />} />
                  <Route path="/local-serp/results" element={<LocalSerpResults />} />
                  <Route path="/local-serp/history" element={<LocalSerpHistory />} />
                  <Route path="/maps-checker" element={<MapsChecker />} />
                  <Route path="/maps-checker/results" element={<MapsCheckerResults />} />
                  <Route path="/pages-by-links" element={<PagesByLinks />} />
                  <Route path="/pages-by-links/results" element={<PagesByLinksResults />} />
                  <Route path="/performance" element={<Performance />} />
                  <Route path="/performance/results" element={<PerformanceResults />} />
                  <Route path="/ppa" element={<PPA />} />
                  <Route path="/ppa/results" element={<PPAResults />} />
                  <Route path="/ranked-keywords" element={<RankedKeywords />} />
                  <Route path="/ranked-keywords/results" element={<RankedKeywordsResults />} />
                  <Route path="/referring-domains" element={<ReferringDomains />} />
                  <Route path="/referring-domains/results" element={<ReferringDomainsResults />} />
                  <Route path="/seed" element={<SeedKeywordSearch />} />
                  <Route path="/seed/results" element={<SeedKeywordResults />} />
                  <Route path="/serp-checker" element={<SerpChecker />} />
                  <Route path="/serp-checker/results" element={<SerpCheckerResults />} />
                  <Route path="/single-traffic-share" element={<SingleTrafficShare />} />
                  <Route path="/single-traffic-share/results" element={<SingleTrafficShareResults />} />
                  <Route path="/traffic-share" element={<TrafficShare />} />
                  <Route path="/traffic-share/results" element={<TrafficShareResults />} />
                  <Route path="/topical-map" element={<TopicalMap />} />
                  <Route path="/topical-map/results" element={<TopicalMapResults />} />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </BrowserRouter>
            <Toaster position="top-right" />
          </CreditsProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}