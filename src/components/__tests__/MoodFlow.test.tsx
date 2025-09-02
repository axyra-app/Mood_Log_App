import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../contexts/AuthContext';
import MoodFlow from '../../pages/MoodFlow';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  auth: {
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
  },
  db: {
    collection: vi.fn(() => ({
      addDoc: vi.fn(),
    })),
  },
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: {
        diaryText: 'Test diary entry',
      },
    }),
  };
});

// Mock services
vi.mock('../../services/rateLimitService', () => ({
  rateLimitService: {
    isAllowed: vi.fn(() => true),
    getRemaining: vi.fn(() => 5),
    getResetTime: vi.fn(() => Date.now() + 3600000),
  },
}));

vi.mock('../../services/achievementService', () => ({
  achievementService: {
    checkAchievements: vi.fn(),
  },
}));

vi.mock('../../services/notificationService', () => ({
  notificationService: {
    createNotification: vi.fn(),
  },
}));

vi.mock('../../services/analyticsService', () => ({
  analyticsService: {
    trackMoodLog: vi.fn(),
  },
}));

vi.mock('../../services/dailyCheckService', () => ({
  dailyCheckService: {
    markDiaryCompleted: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Mood Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render mood flow page', () => {
    renderWithProviders(<MoodFlow />);

    expect(screen.getByText(/registro de estado de ánimo/i)).toBeInTheDocument();
  });

  it('should show progress indicator', () => {
    renderWithProviders(<MoodFlow />);

    expect(screen.getByText(/paso 1 de 4/i)).toBeInTheDocument();
  });

  it('should show diary entry step initially', () => {
    renderWithProviders(<MoodFlow />);

    expect(screen.getByText(/test diary entry/i)).toBeInTheDocument();
  });

  it('should show error when trying to save without mood selection', async () => {
    renderWithProviders(<MoodFlow />);

    const saveButton = screen.getByRole('button', { name: /guardar estado de ánimo/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/debes seleccionar un estado de ánimo antes de guardar/i)).toBeInTheDocument();
    });
  });

  it('should show rate limit error when limit exceeded', async () => {
    const { rateLimitService } = await import('../../services/rateLimitService');
    vi.mocked(rateLimitService.isAllowed).mockReturnValue(false);
    vi.mocked(rateLimitService.getResetTime).mockReturnValue(Date.now() + 3600000);

    renderWithProviders(<MoodFlow />);

    const saveButton = screen.getByRole('button', { name: /guardar estado de ánimo/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/has alcanzado el límite diario de registros/i)).toBeInTheDocument();
    });
  });
});
