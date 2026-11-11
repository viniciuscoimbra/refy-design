"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Matrix2x2.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
/** Um item plotado na matriz. `x`/`y` em % (0–100). */
export interface MatrixPoint {
  id: string;
  /** Descrição no tooltip (title). */
  label: string;
  /** Posição no eixo X (esforço), 0–100. */
  x: number;
  /** Posição no eixo Y (impacto), 0–100. */
  y: number;
  /** Destaque de item priorizado (anel). */
  prioritized?: boolean;
}

export interface Matrix2x2Props {
  /** Points in priority order: color goes from critical (1st) to info (last). */
  points: MatrixPoint[];
  xLabel?: string;
  yLabel?: string;
  /** Quadrant labels. */
  quadrants?: {
    topLeft?: ReactNode;
    topRight?: ReactNode;
    bottomLeft?: ReactNode;
    bottomRight?: ReactNode;
  };
  /** Legend of the priority scale (e.g. ["High priority", "low"]). */
  legend?: [string, string];
  /** Selected point (controlled). `null` = none. */
  selectedId?: string | null;
  /** Initial selection (uncontrolled). */
  defaultSelectedId?: string | null;
  /** Fired when a point is clicked (or `null` when deselected). */
  onPointClick?: (point: MatrixPoint | null) => void;
  className?: string;
}

/**
 * Matrix2x2 — matriz impacto × esforço com pontos numerados por prioridade.
 *
 * Canvas com mira central e grade pontilhada; pontos posicionados por
 * `x`/`y` (0–100) e coloridos numa régua contínua de `--critical` (1º) a
 * `--info` (último) via `color-mix`. Quadrantes e eixos rotulados, legenda
 * com a régua de cor. Clicar num ponto o seleciona (anel + escala; clicar de
 * novo desmarca) — controlado via `selectedId` ou não-controlado.
 *
 *   <Matrix2x2 points={issues} xLabel="Esforço →" yLabel="Impacto →" />
 */
export function Matrix2x2({
  points,
  xLabel: xLabelProp,
  yLabel: yLabelProp,
  quadrants,
  legend: legendProp,
  selectedId,
  defaultSelectedId = null,
  onPointClick,
  className,
}: Matrix2x2Props) {
  const m = useComponentMessages("matrix2x2", enMessages.matrix2x2);
  const xLabel = xLabelProp ?? m.xLabel;
  const yLabel = yLabelProp ?? m.yLabel;
  const legend = legendProp ?? [m.high, m.low];
  const [internalSelected, setInternalSelected] = useState<string | null>(defaultSelectedId);
  const selected = selectedId !== undefined ? selectedId : internalSelected;

  function select(point: MatrixPoint) {
    const next = selected === point.id ? null : point.id; // clique de novo desmarca
    if (selectedId === undefined) setInternalSelected(next);
    onPointClick?.(next ? point : null);
  }

  const rampAt = (index: number) => {
    const t = points.length <= 1 ? 0 : index / (points.length - 1);
    return `color-mix(in oklab, var(--critical) ${Math.round((1 - t) * 100)}%, var(--info))`;
  };

  return (
    <div className={cn(styles.block, className)}>
      <div className={styles.canvas} role="img" aria-label={m.aria(yLabel, xLabel, points.length)}>
        <span className={cn(styles.axis, styles.axisX)} aria-hidden="true">{xLabel}</span>
        <span className={cn(styles.axis, styles.axisY)} aria-hidden="true">{yLabel}</span>

        {quadrants?.topLeft && <div className={cn(styles.qlab, styles.tl)}>{quadrants.topLeft}</div>}
        {quadrants?.topRight && <div className={cn(styles.qlab, styles.tr)}>{quadrants.topRight}</div>}
        {quadrants?.bottomLeft && <div className={cn(styles.qlab, styles.bl)}>{quadrants.bottomLeft}</div>}
        {quadrants?.bottomRight && <div className={cn(styles.qlab, styles.br)}>{quadrants.bottomRight}</div>}

        {points.map((point, i) => (
          <button
            key={point.id}
            type="button"
            className={cn(
              styles.point,
              point.prioritized && styles.prioritized,
              selected === point.id && styles.selected
            )}
            style={{ left: `${point.x}%`, bottom: `${point.y}%`, ["--priority-color" as string]: rampAt(i) }}
            title={`${i + 1} · ${point.label}`}
            aria-label={`${i + 1}: ${point.label}`}
            aria-pressed={selected === point.id}
            onClick={() => select(point)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className={styles.legend} aria-hidden="true">
        <span>{legend[0]}</span>
        <span className={styles.ramp} />
        <span>{legend[1]}</span>
      </div>
    </div>
  );
}
