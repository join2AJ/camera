import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { sceneStyle } from '../data/cameras';
import { useClock } from '../hooks/useClock';

/** A camera "video" surface — layered gradient scene with scanline. */
export function Scene({ index, style }: { index: number; style?: CSSProperties }) {
  return <div className="scene" style={{ ...sceneStyle(index), ...style }} />;
}

/** Live ticking timestamp used inside camera overlays. */
export function TimeStamp({ style }: { style?: CSSProperties }) {
  const { stamp } = useClock();
  return <span className="ts" style={style}>{stamp}</span>;
}

type ChipKind = 'online' | 'rec' | 'motion' | 'ai' | 'off';
export function Chip({ kind, children, style }: { kind: ChipKind; children?: ReactNode; style?: CSSProperties }) {
  return (
    <span className={`chip ${kind}`} style={style}>
      <span className="d" />
      {children}
    </span>
  );
}

/** Uncontrolled on/off switch (mock — flips local visual state). */
export function Toggle({ on = false }: { on?: boolean }) {
  const [v, setV] = useState(on);
  return <button className={`sw${v ? ' on' : ''}`} aria-pressed={v} onClick={() => setV((x) => !x)} />;
}

/** Inline SVG icon wrapper. `d` is the inner markup. */
export function Svg({ children, size, stroke = 1.8, fill = 'none' }: { children: ReactNode; size?: number; stroke?: number; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} width={size} height={size}>
      {children}
    </svg>
  );
}

/** Small segmented control (mock — tracks the selected option locally). */
export function Seg({ options, initial = 0, small = true }: { options: string[]; initial?: number; small?: boolean }) {
  const [i, setI] = useState(initial);
  return (
    <div className={small ? 'seg-sm' : 'seg-toggle'}>
      {options.map((o, idx) => (
        <button key={o} className={idx === i ? 'on' : ''} onClick={() => setI(idx)}>{o}</button>
      ))}
    </div>
  );
}

/** Section header used at the top of each page. */
export function ViewHead({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <div className="vhead">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {actions && <div className="toolbar">{actions}</div>}
    </div>
  );
}
