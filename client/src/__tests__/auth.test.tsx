import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../hooks/use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

// Mock the API request function
jest.mock('../lib/queryClient', () => ({
  apiRequest: jest.fn(),
}));

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

// Test component to access auth context
function TestComponent() {
  const { isAuthenticated, isLoading, login, logout, user } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'Loading' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <button onClick={() => login('test@example.com', 'password')} data-testid="login-btn">
        Login
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('Authentication Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Loading');
  });

  it('should handle successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      isLawyer: false,
      twoFactorEnabled: false,
      emailVerified: true
    };

    mockApiRequest.mockResolvedValueOnce({
      json: () => Promise.resolve({
        token: 'test-token',
        user: mockUser
      })
    } as Response);

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    expect(localStorage.getItem('auth_token')).toBe('test-token');
  });

  it('should handle login with 2FA requirement', async () => {
    mockApiRequest.mockResolvedValueOnce({
      json: () => Promise.resolve({
        requiresTwoFactor: true,
        userId: 'user-123'
      })
    } as Response);

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should handle logout', async () => {
    // Set initial authenticated state
    localStorage.setItem('auth_token', 'test-token');
    
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      isLawyer: false,
      twoFactorEnabled: false,
      emailVerified: true
    };

    mockApiRequest.mockResolvedValueOnce({
      json: () => Promise.resolve(mockUser)
    } as Response);

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    fireEvent.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });

    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should handle failed token validation on init', async () => {
    localStorage.setItem('auth_token', 'invalid-token');
    
    mockApiRequest.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});