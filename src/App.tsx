import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AccessProvider } from './access/AccessContext';
import { BackgroundProvider } from './context/BackgroundContext';
import { AppRoot } from './access/AppRoot';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CheckIn } from './pages/CheckIn';
import { Subjects } from './pages/Subjects';
import { Habits } from './pages/Habits';
import { CalendarView } from './pages/CalendarView';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { FocusMode } from './pages/FocusMode';
import { Letters } from './pages/Letters';
import { ErrorLab } from './pages/ErrorLab';

export default function App() {
  return (
    <AccessProvider>
      <AppProvider>
        <BackgroundProvider>
          <AppRoot>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="check-in" element={<CheckIn />} />
                  <Route path="subjects" element={<Subjects />} />
                  <Route path="habits" element={<Habits />} />
                  <Route path="error-lab" element={<ErrorLab />} />
                  <Route path="letters" element={<Letters />} />
                  <Route path="calendar" element={<CalendarView />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="focus" element={<FocusMode />} />
                </Route>
              </Routes>
            </Router>
          </AppRoot>
        </BackgroundProvider>
      </AppProvider>
    </AccessProvider>
  );
}
