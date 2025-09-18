// React Test Example
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "@/App";

describe("App", () => {
  it("renders app title", () => {
    render(<App />);
    expect(screen.getByText(/vite \+ react/i)).toBeInTheDocument();
  });

  it("renders hello world component", () => {
    render(<App />);
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });

  it("should increment count when button clicked", () => {
    render(<App />);
    const button = screen.getByRole("button", { name: /count is/i });

    fireEvent.click(button);
    expect(screen.getByText(/count is 1/i)).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText(/count is 2/i)).toBeInTheDocument();
  });

  it("should have correct initial state", () => {
    render(<App />);
    expect(screen.getByText(/count is 0/i)).toBeInTheDocument();
  });

  it("should display correct logo", () => {
    render(<App />);
    const logo = screen.getByAltText(/vite logo/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/vite.svg");
  });
});
