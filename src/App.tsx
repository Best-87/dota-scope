import React, { lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SearchPage from './pages/SearchPage';
import DashboardPage from './pages/DashboardPage';
import { usePlayerContext } from './context/PlayerContext';
import Loading from './components/common/Loading';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useMatchPoller } from './hooks/useMatchPoller';
import type { RecentMatch } from './api/types';

// Lazy-load heavier routes to make initial bundle tiny & startup instant
const HeroesPage = lazy(() => import('./pages/HeroesPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const MatchPage = lazy(() => import('./pages/MatchPage'));
const LegendPage = lazy(() => import('./pages/LegendPage'));
const GuidesPage = lazy(() => import('./pages/GuidesPage'));
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

// ─── Match Notification Provider ────────────────────────────────────────────
// Polls for new/parsed matches and fires in-app push notifications.

const MatchNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accountId } = usePlayerContext();
  const { sendNotification, setCurrentAccountId } = usePushNotifications();

  // Sync active player with notifications system
  React.useEffect(() => {
    setCurrentAccountId(accountId);
  }, [accountId, setCurrentAccountId]);

  const onNewMatch = useCallback((match: RecentMatch) => {
    const heroText = match.hero_id ? `(Héroe #${match.hero_id})` : '';
    const result = match.player_slot !== undefined
      ? ((match.player_slot < 128) === Boolean(match.radiant_win) ? '✅ Victoria' : '❌ Derrota')
      : '';
    sendNotification(
      '⚔️ Nueva Partida Detectada',
      `Match #${match.match_id} ${heroText} — ${result}`.trim(),
      { tag: `new_match_${match.match_id}`, accountId, data: { matchId: match.match_id } }
    );
  }, [sendNotification, accountId]);

  const onMatchParsed = useCallback((match: RecentMatch) => {
    sendNotification(
      '🔬 Partida Analizada',
      `El análisis completo de la partida #${match.match_id} ya está disponible.`,
      { tag: `parsed_${match.match_id}`, accountId, data: { matchId: match.match_id } }
    );
  }, [sendNotification, accountId]);

  useMatchPoller({
    accountId,
    enabled: Boolean(accountId),
    intervalMs: 45 * 1000, // Every 45s for faster mobile response
    onNewMatch,
    onMatchParsed,
  });

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={
        <MatchNotificationProvider>
          <Layout />
        </MatchNotificationProvider>
      }>
        {/* Default route: dashboard if user selected, otherwise search */}
        <Route index element={<RootRedirect />} />

        {/* Search Page */}
        <Route path="search" element={<SearchPage />} />

        {/* Player Dashboard */}
        <Route path="dashboard/:accountId" element={<DashboardPage />} />

        {/* Heroes Performance Page */}
        <Route path="heroes/:accountId" element={
          <Suspense fallback={<Loading message="Cargando estadísticas de héroes..." size="lg" />}>
            <HeroesPage />
          </Suspense>
        } />

        {/* Advanced Analysis Page */}
        <Route path="analysis/:accountId" element={
          <Suspense fallback={<Loading message="Cargando análisis táctico de roles..." size="lg" />}>
            <AnalysisPage />
          </Suspense>
        } />

        {/* Match Detail Page */}
        <Route path="match/:matchId" element={
          <Suspense fallback={<Loading message="Cargando telemetría de la partida..." size="lg" />}>
            <MatchPage />
          </Suspense>
        } />

        {/* Legend / Glossary Page */}
        <Route path="legend" element={
          <Suspense fallback={<Loading message="Cargando glosario..." size="md" />}>
            <LegendPage />
          </Suspense>
        } />

        {/* Guides & Learning Page */}
        <Route path="guides" element={
          <Suspense fallback={<Loading message="Cargando guías y recursos..." size="md" />}>
            <GuidesPage />
          </Suspense>
        } />

        {/* ── NEW: Dota 2 Helper Features ── */}
        <Route path="hero-encyclopedia" element={
          <Suspense fallback={<Loading message="Cargando enciclopedia de héroes..." size="lg" />}>
            <HeroEncyclopediaPage />
          </Suspense>
        } />
        <Route path="encyclopedia" element={<Navigate to="/hero-encyclopedia" replace />} />

        <Route path="items" element={
          <Suspense fallback={<Loading message="Cargando base de datos de ítems..." size="lg" />}>
            <ItemsDatabasePage />
          </Suspense>
        } />

        <Route path="draft" element={
          <Suspense fallback={<Loading message="Cargando asistente de draft..." size="lg" />}>
            <DraftPage />
          </Suspense>
        } />

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
