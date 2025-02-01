import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { CreditsProvider } from './contexts/CreditsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Roadmap from './pages/Roadmap';  // <-- Correct import path

// Components
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { NotFound } from './pages/NotFound';

// Authentication & Account
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Settings } from './pages/Settings';
import { InviteAccept } from './pages/InviteAccept';
import { Subscription } from './pages/Subscription';
// Google Search Console
import { GoogleSearchConsole } from './pages/GoogleSearchConsole';
import { GoogleSearchConsoleCallback } from './pages/GoogleSearchConsole/Callback';
import { GoogleSearchConsoleDomains } from './pages/GoogleSearchConsole/Domains';
import { GoogleSearchConsolePerformance } from './pages/GoogleSearchConsole/Performance';

// Domain Analysis
import { DomainSearch } from './pages/DomainSearch';
import { DomainOverview } from './pages/DomainOverview';
import { BacklinkAnalysis } from './pages/BacklinkAnalysis';
import { DomainAnalysis } from './pages/DomainAnalysis';
import { CompetitorDomains } from './pages/CompetitorDomains';
import { ReferringDomains } from './pages/ReferringDomains';
import { ReferringDomainsResults } from './pages/ReferringDomains/Results';
import { BacklinkGap } from './pages/BacklinkGap';
import { BacklinkGapResults } from './pages/BacklinkGap/Results';
import { SharedDomainOverview } from './pages/SharedDomainOverview';
import { PublicDomainOverview } from './pages/PublicDomainOverview';
import { CompetitorAnalysisSearch, CompetitorAnalysisResults } from './pages/CompetitorAnalysis';

// Keyword Research
import { SeedKeywordSearch } from './pages/SeedKeywordSearch';
import { SeedKeywordResults } from './pages/SeedKeywordResults';
import { KeywordLists } from './pages/KeywordLists';
import { ListDetails } from './pages/KeywordLists/ListDetails';
import { KeywordGap } from './pages/KeywordGap';
import { KeywordGapResults } from './pages/KeywordGap/Results';
import { KeywordOverview } from './pages/KeywordOverview';
import { KeywordOverviewResults } from './pages/KeywordOverview/Results';
import { RankedKeywords } from './pages/RankedKeywords';
import { RankedKeywordsResults } from './pages/RankedKeywords/Results';
import { KeywordClustering } from './pages/KeywordClustering';
import { KeywordClusteringResults } from './pages/KeywordClustering/Results';
import { TopicalMap } from './pages/TopicalMap';
import { TopicalMapResults } from './pages/TopicalMap/Results';
import { AIKeywordResearch } from './pages/AIKeywordResearch';
import { AIKeywordResearchResults } from './pages/AIKeywordResearch/Results';

// SERP Analysis
import { SerpKeywordSearch } from './pages/SerpKeywordSearch';
import { SerpKeywordResults } from './pages/SerpKeywordResults';
import { SerpChecker } from './pages/SerpChecker';
import { SerpCheckerResults } from './pages/SerpChecker/Results';
import { SerpAnalysis } from './pages/SerpAnalysis';
import { LocalSerp } from './pages/LocalSerp';
import { LocalSerpResults } from './pages/LocalSerp/Results';
import { MapsChecker } from './pages/MapsChecker';
import { MapsCheckerResults } from './pages/MapsChecker/Results';

// Pages Analysis
import { TopPagesSearch } from './pages/TopPagesSearch';
import { TopPagesResults } from './pages/TopPagesResults';
import { PagesByLinks } from './pages/PagesByLinks';
import { PagesByLinksResults } from './pages/PagesByLinks/Results';

// Miscellaneous
import { Botox } from './pages/Botox';
import { BotoxResults } from './pages/Botox/Results';
import { TrafficShare } from './pages/TrafficShare';
import { TrafficShareResults } from './pages/TrafficShare/Results';
import { PPA } from './pages/PPA';
import { PPAResults } from './pages/PPA/Results';
import { Performance } from './pages/Performance';
import { PerformanceResults } from './pages/Performance/Results';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <CreditsProvider>
              <Routes>
                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/invite" element={<InviteAccept />} />
                
                {/* Public Routes */}
                <Route path="/shared/:token" element={<SharedDomainOverview />} />
                <Route path="/website-overview/:domain" element={<PublicDomainOverview />} />
                
                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/overview" replace />} />
                
                <Route element={<Layout />}>
                  {/* Domain Analysis */}
                  <Route path="/overview" element={
                    <ProtectedRoute>
                      <DomainSearch />
                    </ProtectedRoute>
                  } />
<Route path="/roadmap" element={
  <ProtectedRoute>
    <Roadmap />
  </ProtectedRoute>
} />


                  <Route path="/overview/results" element={
                    <ProtectedRoute>
                      <DomainOverview />
                    </ProtectedRoute>
                  } />
                  <Route path="/backlinks" element={
                    <ProtectedRoute>
                      <BacklinkAnalysis />
                    </ProtectedRoute>
                  } />
                  <Route path="/domain" element={
                    <ProtectedRoute>
                      <DomainAnalysis />
                    </ProtectedRoute>
                  } />
                  <Route path="/competitors" element={
                    <ProtectedRoute>
                      <CompetitorDomains />
                    </ProtectedRoute>
                  } />
                  <Route path="/referring-domains" element={
                    <ProtectedRoute>
                      <ReferringDomains />
                    </ProtectedRoute>
                  } />
                  <Route path="/referring-domains/results" element={
                    <ProtectedRoute>
                      <ReferringDomainsResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/backlink-gap" element={
                    <ProtectedRoute>
                      <BacklinkGap />
                    </ProtectedRoute>
                  } />
                  <Route path="/backlink-gap/results" element={
                    <ProtectedRoute>
                      <BacklinkGapResults />
                    </ProtectedRoute>
                  } />

                  {/* Keyword Research */}
                  <Route path="/seed" element={
                    <ProtectedRoute>
                      <SeedKeywordSearch />
                    </ProtectedRoute>
                  } />
                  <Route path="/seed/results" element={
                    <ProtectedRoute>
                      <SeedKeywordResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/keyword-lists" element={
                    <ProtectedRoute>
                      <KeywordLists />
                    </ProtectedRoute>
                  } />
                  <Route path="/keyword-lists/:id" element={
                    <ProtectedRoute>
                      <ListDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/keyword-gap" element={
                    <ProtectedRoute>
                      <KeywordGap />
                    </ProtectedRoute>
                  } />
                  <Route path="/keyword-gap/results" element={
                    <ProtectedRoute>
                      <KeywordGapResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-keyword-research" element={
                    <ProtectedRoute>
                      <AIKeywordResearch />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-keyword-research/results/:compressed" element={
                    <ProtectedRoute>
                      <AIKeywordResearchResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/keyword-overview" element={
                    <ProtectedRoute>
                      <KeywordOverview />
                    </ProtectedRoute>
                  } />
                  <Route path="/keyword-overview/results" element={
                    <ProtectedRoute>
                      <KeywordOverviewResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/ranked-keywords" element={
                    <ProtectedRoute>
                      <RankedKeywords />
                    </ProtectedRoute>
                  } />
                  <Route path="/ranked-keywords/results" element={
                    <ProtectedRoute>
                      <RankedKeywordsResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/keyword-clustering" element={
                    <ProtectedRoute>
                      <KeywordClustering />
                    </ProtectedRoute>
                  } />
                  <Route path="/keyword-clustering/results" element={
                    <ProtectedRoute>
                      <KeywordClusteringResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/topical-map" element={
                    <ProtectedRoute>
                      <TopicalMap />
                    </ProtectedRoute>
                  } />
                  <Route path="/topical-map/results" element={
                    <ProtectedRoute>
                      <TopicalMapResults />
                    </ProtectedRoute>
                  } />
{/* Google Search Console */}
                  <Route path="/google-search-console" element={
                    <ProtectedRoute>
                      <GoogleSearchConsole />
                    </ProtectedRoute>
                  } />
                  <Route path="/google-search-console/callback" element={
                    <ProtectedRoute>
                      <GoogleSearchConsoleCallback />
                    </ProtectedRoute>
                  } />
                  <Route path="/google-search-console/domains" element={
                    <ProtectedRoute>
                      <GoogleSearchConsoleDomains />
                    </ProtectedRoute>
                  } />
                  <Route path="/google-search-console/performance/:domain" element={
                    <ProtectedRoute>
                      <GoogleSearchConsolePerformance />
                    </ProtectedRoute>
                  } />
                  {/* SERP Analysis */}
                  <Route path="/serp" element={
                    <ProtectedRoute>
                      <SerpKeywordSearch />
                    </ProtectedRoute>
                  } />
                  <Route path="/serp/results" element={
                    <ProtectedRoute>
                      <SerpKeywordResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/serp-checker" element={
                    <ProtectedRoute>
                      <SerpChecker />
                    </ProtectedRoute>
                  } />
                  <Route path="/serp-checker/results" element={
                    <ProtectedRoute>
                      <SerpCheckerResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/serp-checker/analysis" element={
                    <ProtectedRoute>
                      <SerpAnalysis />
                    </ProtectedRoute>
                  } />
                  <Route path="/local-serp" element={
                    <ProtectedRoute>
                      <LocalSerp />
                    </ProtectedRoute>
                  } />
                  <Route path="/local-serp/results" element={
                    <ProtectedRoute>
                      <LocalSerpResults />
                    </ProtectedRoute>
                  } />

                  {/* Pages Analysis */}
                  <Route path="/pages" element={
                    <ProtectedRoute>
                      <TopPagesSearch />
                    </ProtectedRoute>
                  } />
                  <Route path="/pages/results" element={
                    <ProtectedRoute>
                      <TopPagesResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/pages-by-links" element={
                    <ProtectedRoute>
                      <PagesByLinks />
                    </ProtectedRoute>
                  } />
                  <Route path="/pages-by-links/results" element={
                    <ProtectedRoute>
                      <PagesByLinksResults />
                    </ProtectedRoute>
                  } />

                  {/* Miscellaneous */}
                  <Route path="/botox" element={
                    <ProtectedRoute>
                      <Botox />
                    </ProtectedRoute>
                  } />
                  <Route path="/botox/results" element={
                    <ProtectedRoute>
                      <BotoxResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/traffic-share" element={
                    <ProtectedRoute>
                      <TrafficShare />
                    </ProtectedRoute>
                  } />
                  <Route path="/traffic-share/results" element={
                    <ProtectedRoute>
                      <TrafficShareResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/ppa" element={
                    <ProtectedRoute>
                      <PPA />
                    </ProtectedRoute>
                  } />
                  <Route path="/ppa/results" element={
                    <ProtectedRoute>
                      <PPAResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/performance" element={
                    <ProtectedRoute>
                      <Performance />
                    </ProtectedRoute>
                  } />
                  <Route path="/performance/results" element={
                    <ProtectedRoute>
                      <PerformanceResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/competitor-analysis" element={
                    <ProtectedRoute>
                      <CompetitorAnalysisSearch />
                    </ProtectedRoute>
                  } />
                  <Route path="/competitor-analysis/results" element={
                    <ProtectedRoute>
                      <CompetitorAnalysisResults />
                    </ProtectedRoute>
                  } />
<Route path="/maps-checker" element={
            <ProtectedRoute><MapsChecker /></ProtectedRoute>
          } />
          <Route path="/maps-checker/results" element={
            <ProtectedRoute><MapsCheckerResults /></ProtectedRoute>
          } />
                  {/* Account */}
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription" element={
                    <ProtectedRoute>
                      <Subscription />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster 
                position="top-right"
                toastOptions={{
                  className: 'dark:bg-gray-800 dark:text-white'
                }}
              />
            </CreditsProvider>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
