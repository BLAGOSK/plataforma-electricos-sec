import { useEffect, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenuAbierto(false), [pathname]);

  return (
    <div className="min-h-screen">
      <Sidebar abiertoMovil={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      <div className="lg:pl-64">
        <Header onAbrirMenu={() => setMenuAbierto(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  );
}
