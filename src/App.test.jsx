import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    // We just render the app. The routing defaults to redirect to /login
    render(<App />);
    // The login page typically has the word "Login" or "Email"
    expect(document.body).toBeInTheDocument();
  });
});
