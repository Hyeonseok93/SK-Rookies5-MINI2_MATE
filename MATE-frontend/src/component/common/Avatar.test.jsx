import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar null/empty guard', () => {
  it('renders a "?" placeholder when the name is null', () => {
    render(<Avatar name={null} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders a "?" placeholder for empty or whitespace names', () => {
    const { rerender } = render(<Avatar name="" />);
    expect(screen.getByText('?')).toBeInTheDocument();

    rerender(<Avatar name="   " />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders the uppercased first letter of a valid name', () => {
    render(<Avatar name="alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders an image with a safe alt fallback when src is provided', () => {
    render(<Avatar src="https://cdn.example.com/a.png" name={null} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/a.png');
    expect(img).toHaveAttribute('alt', '?');
  });
});
