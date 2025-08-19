
import type { MunsellColor } from './types';

export const MUNSELL_COLORS: MunsellColor[] = [
  { code: '5R', name: '빨강', hex: '#ee3f40' },
  { code: '5YR', name: '주황', hex: '#f6882c' },
  { code: '5Y', name: '노랑', hex: '#ffde17' },
  { code: '5GY', name: '연두', hex: '#b2d235' },
  { code: '5G', name: '초록', hex: '#00a651' },
  { code: '5BG', name: '청록', hex: '#00a99d' },
  { code: '5B', name: '파랑', hex: '#008ed5' },
  { code: '5PB', name: '남색', hex: '#3f51b5' },
  { code: '5P', name: '보라', hex: '#8b5cf6' },
  { code: '5RP', name: '자주', hex: '#d0368a' },
];

export const NEUTRAL_COLORS: MunsellColor[] = [
    { code: 'W', name: '흰색', hex: '#FFFFFF' },
    { code: 'Bk', name: '검정색', hex: '#000000' },
];

export const ALL_COLORS: MunsellColor[] = [...MUNSELL_COLORS, ...NEUTRAL_COLORS, { code: 'Gy', name: '회색', hex: '#7a7a7a' }];

export const WARM_COLOR_CODES: string[] = ['5R', '5YR', '5Y'];
export const COOL_COLOR_CODES: string[] = ['5PB', '5B', '5BG'];
