import React, { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { usePlayerContext } from '../../context/PlayerContext';
import { NotificationToast } from '../notifications/NotificationToast';

export const Layout: React.FC = () => {
  const { accountId: routeAccountId } = useParams<{ accountId?: string }>();
  const { accountId, setAccountId } = usePlayerContext();

  useEffect(() => {
    if (routeAccountId) {
      const num = Number(routeAccountId);
      if (!isNaN(num) && num !== accountId) {
        setAccountId(num);
      }
    }
  }, [routeAccountId, accountId, setAccountId]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 relative overflow-hidden">
      {/* Background ambient lighting - Dota/Gaming Dark aesthetic */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[350px] bg-red-950/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[450px] h-[350px] bg-amber-950/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-[600px] h-[300px] bg-indigo-950/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <NotificationToast />
      <Header />
      <div className="flex-1 flex w-full max-w-[1680px] mx-auto">
        <Sidebar />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-x-hidden pb-24 sm:pb-10">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;
