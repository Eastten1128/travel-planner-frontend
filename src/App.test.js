import { render, screen } from "@testing-library/react";
import LandingPage from "./pages/landing/LandingPage";

jest.mock("./components/layout/AppNavbar", () => () => <div data-testid="navbar" />);
jest.mock("./components/layout/AppFooter", () => () => <div data-testid="footer" />);

test("랜딩 페이지 문구가 노출된다", () => {
  render(<LandingPage />);
  expect(screen.getByText(/AI와 함께하는 여행 플래너/i)).toBeInTheDocument();
});
