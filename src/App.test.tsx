import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import App from './App';

describe('App', () => {
  const setupTest = () => {
    return render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
  };

  it('renders the game title in the header', () => {
    setupTest();
    expect(screen.getByText('Rosie Races')).toBeInTheDocument();
  });

  it('renders the game container', () => {
    setupTest();
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });

  it('renders the TAP button placeholder', () => {
    setupTest();
    expect(screen.getByText('TAP!')).toBeInTheDocument();
  });

  it('has correct semantic structure', () => {
    setupTest();
    expect(document.querySelector('header')).toBeInTheDocument();
    expect(document.querySelector('main')).toBeInTheDocument();
    expect(document.querySelector('footer')).toBeInTheDocument();
  });
});
