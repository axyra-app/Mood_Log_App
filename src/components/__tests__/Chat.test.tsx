import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../contexts/AuthContext';
import Chat from '../../pages/Chat';

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
      onSnapshot: vi.fn(),
    })),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    updateDoc: vi.fn(),
  },
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock services
vi.mock('../../services/rateLimitService', () => ({
  rateLimitService: {
    isAllowed: vi.fn(() => true),
    getRemaining: vi.fn(() => 10),
    getResetTime: vi.fn(() => Date.now() + 3600000),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render chat interface', () => {
    renderWithProviders(<Chat />);

    expect(screen.getByText(/chat/i)).toBeInTheDocument();
  });

  it('should show message input', () => {
    renderWithProviders(<Chat />);

    expect(screen.getByPlaceholderText(/escribe un mensaje/i)).toBeInTheDocument();
  });

  it('should show send button', () => {
    renderWithProviders(<Chat />);

    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('should disable send button when message is empty', () => {
    renderWithProviders(<Chat />);

    const sendButton = screen.getByRole('button', { name: /enviar/i });
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when message is typed', () => {
    renderWithProviders(<Chat />);

    const messageInput = screen.getByPlaceholderText(/escribe un mensaje/i);
    const sendButton = screen.getByRole('button', { name: /enviar/i });

    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    expect(sendButton).not.toBeDisabled();
  });

  it('should show rate limit error when limit exceeded', async () => {
    const { rateLimitService } = await import('../../services/rateLimitService');
    vi.mocked(rateLimitService.isAllowed).mockReturnValue(false);
    vi.mocked(rateLimitService.getResetTime).mockReturnValue(Date.now() + 3600000);

    renderWithProviders(<Chat />);

    const messageInput = screen.getByPlaceholderText(/escribe un mensaje/i);
    const sendButton = screen.getByRole('button', { name: /enviar/i });

    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/has alcanzado el límite de mensajes por hora/i)).toBeInTheDocument();
    });
  });
});
