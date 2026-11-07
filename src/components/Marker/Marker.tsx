import type { HTMLAttributes } from 'react';
export function Marker({ style, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <mark
      {...props}
      style={{
        background: 'var(--primary-soft)',
        color: 'var(--primary-ink)',
        borderRadius: 'var(--radius-xs)',
        paddingInline: '.15em',
        ...style,
      }}
    />
  );
}
