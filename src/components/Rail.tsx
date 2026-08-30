import { NavLink } from 'react-router-dom';
import { brandIcon, navIcons } from './icons';

interface NavItem { to: string; key: string; label: string; }

const MAIN: NavItem[] = [
  { to: '/live', key: 'live', label: 'Live View' },
  { to: '/playback', key: 'playback', label: 'Playback' },
  { to: '/analytics', key: 'analytics', label: 'AI Analytics' },
  { to: '/map', key: 'map', label: 'Site Map' },
  { to: '/plates', key: 'lpr', label: 'License Plates' },
  { to: '/maintenance', key: 'maintenance', label: 'Maintenance' },
  { to: '/users', key: 'users', label: 'Users & Roles' },
  { to: '/storage', key: 'storage', label: 'Storage & Encryption' },
];

export function Rail() {
  return (
    <nav className="rail">
      <div className="brand" title="Aperture">{brandIcon}</div>
      {MAIN.map((item) => (
        <NavLink key={item.key} to={item.to} className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>{navIcons[item.key]}</svg>
          <span className="tip">{item.label}</span>
        </NavLink>
      ))}
      <div className="rail-sp" />
      <NavLink to="/settings" className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>{navIcons.settings}</svg>
        <span className="tip">Camera Settings</span>
      </NavLink>
    </nav>
  );
}
