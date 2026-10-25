import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SearchPage from './pages/SearchPage';
import DashboardPage from './pages/DashboardPage';
import HeroesPage from './pages/HeroesPage';
import AnalysisPage from './pages/AnalysisPage';
import MatchPage from './pages/MatchPage';
import LegendPage from './pages/LegendPage';
import GuidesPage from './pages/GuidesPage';
import { usePlayerContext } from './context/PlayerContext';
import Loading from './components/common/Loading';

// Lazy-load new heavy pages to keep initial bundle small
const HeroEncyclopediaPage = lazy(() => import('./pages/HeroEncyclopediaPage'));
const ItemsDatabasePage = lazy(() => import('./pages/ItemsDatabasePage'));
const DraftPage = lazy(() => import('./pages/DraftPage'));
const MetaPage = lazy(() => import('./pages/MetaPage'));

const RootRedirect: React.FC = () => {
  const { accountId } = usePlayerContext();
  if (accountId) {
    return <Navigate to={`/dashboard/${accountId}`} replace />;
  }
  return <Navigate to="/search" replace />;
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Default route: dashboard if user selected, otherwise search */}
        <Route index element={<RootRedirect />} />

        {/* Search Page */}
        <Route path="search" element={<SearchPage />} />

        {/* Player Dashboard */}
        <Route path="dashboard/:accountId" element={<DashboardPage />} />

        {/* Heroes Performance Page */}
        <Route path="heroes/:accountId" element={<HeroesPage />} />

        {/* Advanced Analysis Page */}
        <Route path="analysis/:accountId" element={<AnalysisPage />} />

        {/* Match Detail Page */}
        <Route path="match/:matchId" element={<MatchPage />} />

        {/* Legend / Glossary Page */}
        <Route path="legend" element={<LegendPage />} />

        {/* Guides & Learning Page */}
        <Route path="guides" element={<GuidesPage />} />

        {/* ── NEW: Dota 2 Helper Features ── */}
        {/* Hero Encyclopedia — full hero reference with abilities, talents, builds */}
        <Route path="hero-encyclopedia" element={
          <Suspense fallback={<Loading message="Cargando enciclopedia de héroes..." size="lg" />}>
            <HeroEncyclopediaPage />
          </Suspense>
        } />
        <Route path="encyclopedia" element={<Navigate to="/hero-encyclopedia" replace />} />

        {/* Items Database — complete item catalog */}
        <Route path="items" element={
          <Suspense fallback={<Loading message="Cargando base de datos de ítems..." size="lg" />}>
            <ItemsDatabasePage />
          </Suspense>
        } />

        {/* Draft Assistant — 5v5 draft analyzer */}
        <Route path="draft" element={
          <Suspense fallback={<Loading message="Cargando asistente de draft..." size="lg" />}>
            <DraftPage />
          </Suspense>
        } />

        {/* Meta & Tier List — current patch meta */}
        <Route path="meta" element={
          <Suspense fallback={<Loading message="Cargando meta actual..." size="lg" />}>
            <MetaPage />
          </Suspense>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
