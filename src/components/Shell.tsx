import { Outlet, useLocation } from 'react-router-dom';
import { Rail } from './Rail';
import { TopBar } from './TopBar';
import { AlarmDrawer, LiveToast } from './AlarmDrawer';

const TITLES: Record<string, string> = {
  '/live': 'Live View',
  '/playback': 'Playback',
  '/analytics': 'AI Analytics',
  '/map': 'Site Map',
  '/plates': 'License Plates',
  '/maintenance': 'Maintenance',
  '/users': 'Users & Roles',
  '/storage': 'Storage & Encryption',
  '/settings': 'Camera Settings',
  '/system': 'System Settings',
};

export function Shell() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Aperture VMS';
  return (
    <div className="app">
      <Rail />
      <TopBar title={title} />
      <main className="main">
        <div className="view active">
          <Outlet />
        </div>
      </main>
      <AlarmDrawer />
      <LiveToast />
    </div>
  );
}
