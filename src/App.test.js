import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hero title', () => {
  render(<App />);
  const titleElement = screen.getByText('기존에 경험하지 못한 새로운 여행 플래너');
  expect(titleElement).toBeInTheDocument();
});
