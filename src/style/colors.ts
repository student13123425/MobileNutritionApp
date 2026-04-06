export { AppColorsLight, AppColorsDark } from '../CommunScripts/objects';

import { AppColorsLight, AppColorsDark } from '../CommunScripts/objects';

export const Colors = AppColorsLight;
export type ColorKey = keyof typeof AppColorsLight;

export function getLightColors(color: ColorKey): string {
  return AppColorsLight[color];
}

export function getDarkColors(color: ColorKey): string {
  return AppColorsDark[color];
}