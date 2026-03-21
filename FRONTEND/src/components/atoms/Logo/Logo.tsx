import logoSrc from '../../../assets/brand/logo.png';

const SIZE_MAP = {
  sm: 36,
  md: 64,
  lg: 80,
  xl: 120,
} as const;

export interface LogoProps {
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

export const Logo = ({ size = 'md', className }: LogoProps) => {
  const px = SIZE_MAP[size];
  return (
    <img
      src={logoSrc}
      alt="Coffee Parches"
      width={px}
      height={px}
      className={className}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  );
};
