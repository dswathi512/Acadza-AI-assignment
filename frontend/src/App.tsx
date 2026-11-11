import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsQueuePage } from './pages/ReportsQueuePage';
import { InvestigationPage } from './pages/InvestigationPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { BonusAuditPage } from './pages/BonusAuditPage';
import type { DashboardMetrics } from './types';
import { fetchDashboard, triggerTriage, fetchHealth } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [queueFilter, setQueueFilter] = useState<Record<string, any>>({});
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isTriageLoading, setIsTriageLoading] = useState(false);
  const [engineMode, setEngineMode] = useState<string>('Offline Rules Engine');
  const [isLiveLLM, setIsLiveLLM] = useState<boolean>(false);

  const loadMetrics = async () => {
    try {
      const data = await fetchDashboard();
      setMetrics(data);
      const health = await fetchHealth();
      setEngineMode(health.mode);
      setIsLiveLLM(health.llm_live);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleRefreshTriage = async () => {
    setIsTriageLoading(true);
    try {
      await triggerTriage();
      await loadMetrics();
    } catch (err) {
      console.error('Failed to run triage:', err);
    } finally {
      setIsTriageLoading(false);
    }
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setCurrentTab('investigation');
  };

  const handleNavigateToQueueWithFilter = (filter: Record<string, any> = {}) => {
    setQueueFilter(filter);
    setCurrentTab('queue');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'investigation') {
            setSelectedReportId(null);
          }
        }}
        pendingCount={metrics?.awaiting_faculty_review}
        onRefreshTriage={handleRefreshTriage}
        isTriageLoading={isTriageLoading}
        engineMode={engineMode}
        isLiveLLM={isLiveLLM}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardPage
            metrics={metrics}
            onNavigateToReviews={() => {
              setCurrentTab('reviews');
            }}
            onNavigateToQueue={handleNavigateToQueueWithFilter}
          />
        )}

        {currentTab === 'queue' && (
          <ReportsQueuePage
            initialFilter={queueFilter}
            onSelectReport={handleSelectReport}
            title="Reports & Triage Queue"
            subtitle="All 44 student incident reports with automated classification and routing"
          />
        )}

        {currentTab === 'reviews' && (
          <ReportsQueuePage
            forceFacultyReviewOnly={true}
            onSelectReport={handleSelectReport}
            title="Pending Faculty Reviews"
            subtitle="High-stakes repairs, answer key changes, and cases requiring human faculty authorization"
          />
        )}

        {currentTab === 'investigation' && selectedReportId && (
          <InvestigationPage
            reportId={selectedReportId}
            onBack={() => {
              setCurrentTab('queue');
              setSelectedReportId(null);
            }}
            onRefreshParent={loadMetrics}
          />
        )}

        {currentTab === 'audit' && <AuditLogPage />}

        {currentTab === 'bonus' && <BonusAuditPage />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <div>
            <strong>Acadza AI</strong> &bull; Question Quality Assurance & Faculty Review Engine
          </div>
          <div>
            Engine: Python / FastAPI &bull; UI: React 19 / TypeScript / Vite / Tailwind
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
