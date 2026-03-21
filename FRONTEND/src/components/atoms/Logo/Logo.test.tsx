import { render } from '@testing-library/react';
import { Logo } from './Logo';

test('renders with correct alt text', () => {
  const { getByAltText } = render(<Logo />);
  expect(getByAltText('Coffee Parches')).toBeInTheDocument();
});

test('applies correct size for sm', () => {
  const { getByAltText } = render(<Logo size="sm" />);
  const img = getByAltText('Coffee Parches');
  expect(img).toHaveAttribute('width', '36');
  expect(img).toHaveAttribute('height', '36');
});

test('applies correct size for lg', () => {
  const { getByAltText } = render(<Logo size="lg" />);
  const img = getByAltText('Coffee Parches');
  expect(img).toHaveAttribute('width', '80');
  expect(img).toHaveAttribute('height', '80');
});
