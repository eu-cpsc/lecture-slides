import config from 'virtual:lecture-slides/config';
import euShield from '../styles/themes/evangel-assets/eu-shield.png';
import euShieldWhite from '../styles/themes/evangel-assets/eu-shield-white.png';

/** Logos that come with a theme, used when the course doesn't set its own. */
const themeLogos: Record<string, { logo: string; logoOnDark: string }> = {
  // EU Brand Guide: maroon mark on light backgrounds, white on dark.
  evangel: { logo: euShield.src, logoOnDark: euShieldWhite.src },
};

/**
 * Resolve the header and title-slide logos. A course option wins: a path in
 * public/, or `false` for no logo. Otherwise the theme's logo is used.
 */
export function logos(): { logo?: string; logoOnDark?: string } {
  const base = import.meta.env.BASE_URL;
  const fromPublic = (p: string) => base + p.replace(/^\//, '');
  const theme = themeLogos[config.brand] ?? {};
  const pick = (value: string | false | null, fallback?: string) =>
    value === false ? undefined : value ? fromPublic(value) : fallback;
  return {
    logo: pick(config.logo, theme.logo),
    logoOnDark: pick(config.logoOnDark, theme.logoOnDark),
  };
}
