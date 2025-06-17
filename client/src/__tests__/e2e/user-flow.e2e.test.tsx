import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock fetch for API calls
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

describe('End-to-End User Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockClear();
  });

  it('should complete full user registration and login flow', async () => {
    const user = userEvent.setup();

    // Mock successful registration
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: '1',
          email: 'newuser@example.com',
          name: 'New User',
          isLawyer: false,
          emailVerified: false,
          twoFactorEnabled: false
        }
      })
    } as Response);

    renderApp();

    // Should start on landing page
    expect(screen.getByText(/legal assistance/i)).toBeInTheDocument();

    // Navigate to registration
    const getStartedBtn = screen.getByRole('button', { name: /get started/i });
    await user.click(getStartedBtn);

    // Fill registration form
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'newuser@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.type(screen.getByLabelText(/name/i), 'New User');

    // Submit registration
    const registerBtn = screen.getByRole('button', { name: /register/i });
    await user.click(registerBtn);

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it('should handle error states gracefully', async () => {
    const user = userEvent.setup();

    // Mock API error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    renderApp();

    // Try to navigate somewhere that requires API call
    const lawyersLink = screen.getByRole('link', { name: /lawyers/i });
    await user.click(lawyersLink);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error loading/i)).toBeInTheDocument();
    });
  });
});