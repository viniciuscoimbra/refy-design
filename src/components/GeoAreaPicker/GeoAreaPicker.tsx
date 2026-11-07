"use client";
import { useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Callout } from "../Callout";
import { Chip } from "../Chip";
import { Multiselect } from "../Multiselect";
import { Range } from "../Range";
import { SettingRow, SettingRowGroup } from "../SettingRow";
import { cn } from "../../lib/cn";
import styles from "./GeoAreaPicker.module.css";

import { useMessages, useLocale } from "../../lib/locale";
export interface GeoNeighborhood {
  id: string;
  label: string;
  /** Distância em km a partir do bairro principal. */
  distance: number;
}

export interface GeoAreaPickerProps {
  neighborhoods: GeoNeighborhood[];
  baseId: string;
  radius?: number;
  defaultRadius?: number;
  minRadius?: number;
  maxRadius?: number;
  radiusStep?: number;
  onRadiusChange?: (radius: number) => void;
  includedIds?: string[];
  defaultIncludedIds?: string[];
  onIncludedIdsChange?: (ids: string[]) => void;
  /** Map provider slot. The text selection still belongs to the DS. */
  map?: ReactNode;
  mapLabel?: string;
  error?: string;
  className?: string;
}

/**
 * Seleção geográfica com contrato textual completo. O mapa é um slot visual;
 * raio, bairros alcançados e inclusão explícita permanecem no design system.
 */
export function GeoAreaPicker({
  neighborhoods,
  baseId,
  radius,
  defaultRadius = 2,
  minRadius = 0.5,
  maxRadius = 5,
  radiusStep = 0.5,
  onRadiusChange,
  includedIds,
  defaultIncludedIds = [],
  onIncludedIdsChange,
  map,
  mapLabel: mapLabelProp,
  error,
  className,
}: GeoAreaPickerProps) {
  const m = useMessages("geoAreaPicker");
  const locale = useLocale();
  const mapLabel = mapLabelProp ?? m.mapLabel;
  const instanceId = useId();
  const includedTitle = `${instanceId}-included`;
  const excludedTitle = `${instanceId}-excluded`;
  const [internalRadius, setInternalRadius] = useState(defaultRadius);
  const [internalIncluded, setInternalIncluded] = useState(defaultIncludedIds);
  const currentRadius = radius ?? internalRadius;
  const currentIncluded = includedIds ?? internalIncluded;
  const base = neighborhoods.find((item) => item.id === baseId);
  const reached = useMemo(
    () =>
      neighborhoods.filter(
        (item) => item.id === baseId || item.distance <= currentRadius,
      ),
    [neighborhoods, baseId, currentRadius],
  );
  const reachedExtras = reached.filter((item) => item.id !== baseId);
  const included = reached.filter(
    (item) => item.id === baseId || currentIncluded.includes(item.id),
  );
  const excluded = reachedExtras.filter(
    (item) => !currentIncluded.includes(item.id),
  );

  function setRadius(next: number) {
    if (radius === undefined) setInternalRadius(next);
    onRadiusChange?.(next);
  }

  function setIncluded(next: string[]) {
    const unique = Array.from(new Set(next.filter((id) => id !== baseId)));
    if (includedIds === undefined) setInternalIncluded(unique);
    onIncludedIdsChange?.(unique);
  }

  function toggle(id: string) {
    setIncluded(
      currentIncluded.includes(id)
        ? currentIncluded.filter((item) => item !== id)
        : [...currentIncluded, id],
    );
  }

  return (
    <section
      className={cn(styles.root, className)}
      aria-label={m.label}
    >
      {error && (
        <Callout
          tone="danger"
          role="alert"
          title={m.mapError}
        >
          {error}
        </Callout>
      )}

      <div className={styles.layout}>
        <div className={styles.visual} aria-label={mapLabel}>
          {map ?? (
            <div className={styles.noMap}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
                <path d="M9 3v15M15 6v15" />
              </svg>
              <strong>{m.mapUnavailable}</strong>
              <span>
                {m.mapFallback}
              </span>
            </div>
          )}
        </div>

        <div className={styles.controls}>
          <Range
            label={m.surroundings(base?.label ?? m.mainArea)}
            min={0}
            max={maxRadius}
            step={radiusStep}
            value={[0, currentRadius]}
            fixedMinimum
            disabled={Boolean(error)}
            formatValue={(value) => `${value.toLocaleString(locale)} km`}
            ticks={["0", `${maxRadius / 2} km`, `${maxRadius} km`]}
            onChange={([, next]) => setRadius(Math.max(minRadius, next))}
          />

          <Multiselect
            label={m.nearbyIncluded}
            placeholder={m.addReached}
            options={reachedExtras.map((item) => ({
              value: item.id,
              label: item.label,
            }))}
            value={currentIncluded.filter((id) =>
              reachedExtras.some((item) => item.id === id),
            )}
            maxVisibleChips={2}
            disabled={Boolean(error)}
            onChange={setIncluded}
            hint={m.inRadius(reachedExtras.length)}
          />

          <div className={styles.explanation} role="note">
            {m.explanation}
          </div>
        </div>
      </div>

      <div className={styles.lists}>
        <section className={styles.listCard} aria-labelledby={includedTitle}>
          <div className={styles.listHeader}>
            <div>
              <h3 id={includedTitle}>{m.inSearch}</h3>
              <p>{m.inSearchHint}</p>
            </div>
            <span>{included.length}</span>
          </div>
          <SettingRowGroup aria-label={m.includedLabel}>
            {included.map((item) => (
              <SettingRow
                key={item.id}
                title={item.label}
                description={
                  item.id === baseId
                    ? m.mainNeighborhood
                    : m.distance(item.distance.toLocaleString(locale))
                }
                actions={
                  <Chip
                    aria-label={
                      item.id === baseId
                        ? m.isMain(item.label)
                        : m.removeFrom(item.label)
                    }
                    selected
                    showCheck
                    disabled={Boolean(error) || item.id === baseId}
                    onClick={() => toggle(item.id)}
                  >
                    {item.id === baseId ? m.main : m.included}
                  </Chip>
                }
              />
            ))}
          </SettingRowGroup>
        </section>

        <section className={styles.listCard} aria-labelledby={excludedTitle}>
          <div className={styles.listHeader}>
            <div>
              <h3 id={excludedTitle}>{m.outside}</h3>
              <p>{m.outsideHint}</p>
            </div>
            <span>{excluded.length}</span>
          </div>
          {excluded.length ? (
            <SettingRowGroup aria-label={m.excludedLabel}>
              {excluded.map((item) => (
                <SettingRow
                  key={item.id}
                  title={item.label}
                  description={m.distance(item.distance.toLocaleString(locale))}
                  actions={
                    <Chip
                      aria-label={m.addTo(item.label)}
                      disabled={Boolean(error)}
                      onClick={() => toggle(item.id)}
                    >
                      {m.include}
                    </Chip>
                  }
                />
              ))}
            </SettingRowGroup>
          ) : (
            <p className={styles.empty}>
              {m.allIncluded}
            </p>
          )}
        </section>
      </div>

      <p className={styles.summary} aria-live="polite">
        {m.summary(included.map((item) => item.label).join(", ") || m.none, excluded.length)}
      </p>
    </section>
  );
}
