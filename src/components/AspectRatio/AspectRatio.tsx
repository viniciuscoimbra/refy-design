import type { HTMLAttributes } from 'react';
export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}
export function AspectRatio({
  ratio = 16 / 9,
  style,
  ...props
}: AspectRatioProps) {
  return (
    <div
      {...props}
      style={{
        width: '100%',
        aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9,
        ...style,
      }}
    />
  );
}
