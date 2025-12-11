import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  const setupTest = () => {
    return render(<App />);
  };

  it('renders the app heading', () => {
    setupTest();
    expect(screen.getByText('Vite + React')).toBeInTheDocument();
  });

  it('renders the count button with initial value of 0', () => {
    setupTest();
    expect(screen.getByRole('button', { name: /count is 0/i })).toBeInTheDocument();
  });
});
