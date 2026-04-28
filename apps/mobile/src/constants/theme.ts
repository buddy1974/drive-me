export const Colors = {
  primary:      '#1A56DB',
  primaryLight: '#1A56DB1A',
  accent:       '#FF6B35',
  accentLight:  '#FF6B351A',
  success:      '#10B981',
  successLight: '#064E3B',
  error:        '#F87171',
  errorLight:   '#450A0A',
  warning:      '#FBBF24',
  warningLight: '#451A03',

  background:    '#0F172A',
  surface:       '#1E293B',
  border:        '#334155',
  borderLight:   '#243144',

  text:          '#F1F5F9',
  textSecondary: '#94A3B8',
  textDisabled:  '#64748B',
  textInverse:   '#FFFFFF',

  mtn:    '#FFC300',
  orange: '#FF6600',
} as const

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const

export const Radius = {
  sm:   6,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const

export const FontSize = {
  xs:   12,
  sm:   14,
  md:   16,
  lg:   18,
  xl:   22,
  xxl:  28,
  xxxl: 36,
} as const

export const FontWeight = {
  regular: '400' as const,
  medium:  '500' as const,
  semibold:'600' as const,
  bold:    '700' as const,
}
