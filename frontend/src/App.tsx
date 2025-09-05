import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Pages
import Home from './pages/Home';
import MoodFlow from './pages/MoodFlow';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 1 * 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Página principal con login/registro */}
            <Route path="/" element={<Home />} />
            
            {/* Mood Flow - Diario de emociones */}
            <Route path="/mood-flow" element={<MoodFlow />} />
            
            {/* Dashboard (placeholder) */}
            <Route path="/dashboard" element={
              <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
                  <p className="text-white/80 mb-6">Próximamente: Estadísticas y análisis de tu mood</p>
                  <a href="/mood-flow" className="bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-200">
                    Ir a Mood Flow
                  </a>
                </div>
              </div>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={
              <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
                  <div className="text-6xl mb-4">😵</div>
                  <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                  <p className="text-white/80 mb-8">Página no encontrada</p>
                  <a href="/" className="bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-200">
                    Volver al inicio
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;