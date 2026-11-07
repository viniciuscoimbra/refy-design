import type { HTMLAttributes } from 'react';
export function Direction({
  dir = 'ltr',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} dir={dir} />;
}
