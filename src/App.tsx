import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Shell } from './components/Shell';
import { LivePage } from './pages/LivePage';
import { PlaybackPage } from './pages/PlaybackPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MapPage } from './pages/MapPage';
import { PlatesPage } from './pages/PlatesPage';
import { StoragePage } from './pages/StoragePage';
import { MaintenancePage } from './pages/MaintenancePage';
import { UsersPage } from './pages/UsersPage';
import { CameraSettingsPage } from './pages/CameraSettingsPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Navigate to="/live" replace />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/playback" element={<PlaybackPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/plates" element={<PlatesPage />} />
          <Route path="/storage" element={<StoragePage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<CameraSettingsPage />} />
          <Route path="/system" element={<SystemSettingsPage />} />
          <Route path="*" element={<Navigate to="/live" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
