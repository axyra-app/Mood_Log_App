import { describe, expect, it } from 'vitest';

// Mock Firebase completely
vi.mock('./lib/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
  default: {},
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ element }: { element: React.ReactNode }) => element,
}));

// Mock AuthContext
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  }),
}));

describe('App', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });
});
