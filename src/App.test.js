import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hero title', () => {
  render(<App />);
  const titleElement = screen.getByText('모든 여행이 설레는 계획으로 시작되도록');
  expect(titleElement).toBeInTheDocument();
});
