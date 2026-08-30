/** Image-adjustment model shared by Camera Settings (preview) and the live player. */
export interface ImgAdjust {
  brightness: number;
  contrast: number;
  saturate: number;
  sharp: number;
  focus: number;
  hue: number;
}

export const DEFAULT_IMG: ImgAdjust = { brightness: 100, contrast: 100, saturate: 100, sharp: 50, focus: 100, hue: 0 };

/** Turn image adjustments into a CSS `filter` string. Returns '' for a no-op. */
export function imgFilterCss(img: ImgAdjust): string {
  const blur = ((100 - img.focus) / 100) * 3 + ((100 - img.sharp) / 100) * 0.6;
  const parts = [
    `brightness(${img.brightness / 100})`,
    `contrast(${img.contrast / 100})`,
    `saturate(${img.saturate / 100})`,
    `hue-rotate(${img.hue}deg)`,
  ];
  if (blur > 0.05) parts.push(`blur(${blur.toFixed(2)}px)`);
  const css = parts.join(' ');
  return css === 'brightness(1) contrast(1) saturate(1) hue-rotate(0deg)' ? '' : css;
}
