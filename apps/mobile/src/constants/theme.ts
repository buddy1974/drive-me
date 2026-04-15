export const Colors = {
  primary:        '#111827',
  accent:         '#2563EB',
  accentLight:    '#EFF6FF',
  success:        '#059669',
  successLight:   '#ECFDF5',
  error:          '#DC2626',
  errorLight:     '#FEF2F2',
  warning:        '#D97706',
  warningLight:   '#FFFBEB',

  background:     '#F9FAFB',
  surface:        '#FFFFFF',
  border:         '#E5E7EB',
  borderLight:    '#F3F4F6',

  text:           '#111827',
  textSecondary:  '#6B7280',
  textDisabled:   '#9CA3AF',
  textInverse:    '#FFFFFF',

  mtn:            '#FFC300',
  orange:         '#FF6600',
} as const

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
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
