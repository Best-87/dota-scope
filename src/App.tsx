import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SearchPage from './pages/SearchPage';
import DashboardPage from './pages/DashboardPage';
import HeroesPage from './pages/HeroesPage';
import AnalysisPage from './pages/AnalysisPage';
import MatchPage from './pages/MatchPage';
import LegendPage from './pages/LegendPage';
import GuidesPage from './pages/GuidesPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Default route to user's dashboard */}
        <Route index element={<Navigate to="/dashboard/1242630127" replace />} />

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

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
