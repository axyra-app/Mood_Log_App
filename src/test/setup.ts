import '@testing-library/jest-dom';

// Mock Firebase
vi.mock('./lib/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: {
    requestPermission: vi.fn(() => Promise.resolve('granted')),
    permission: 'granted',
  },
  writable: true,
});
