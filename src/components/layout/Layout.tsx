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
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col selection:bg-red-500/30 selection:text-white">
      <NotificationToast />
      <Header />
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        <Sidebar />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-x-hidden pb-20 sm:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;
