import { Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Chat from './pages/Chat';
import CompleteProfile from './pages/CompleteProfile';
import DiaryEntry from './pages/DiaryEntry';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import MoodFlow from './pages/MoodFlow';
import PsychologistDashboard from './pages/PsychologistDashboard';
import Register from './pages/Register';
import TermsAndConditions from './pages/TermsAndConditions';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <div className='min-h-screen gradient-bg'>
            <OfflineIndicator />
            <Routes>
              <Route path='/' element={<LandingPage />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/complete-profile' element={<CompleteProfile />} />
              <Route path='/terms' element={<TermsAndConditions />} />
              <Route
                path='/diary-entry'
                element={
                  <ProtectedRoute>
                    <DiaryEntry />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/mood-flow'
                element={
                  <ProtectedRoute>
                    <MoodFlow />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/dashboard'
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/psychologist-dashboard'
                element={
                  <ProtectedRoute requiredRole='psychologist'>
                    <PsychologistDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/chat'
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
