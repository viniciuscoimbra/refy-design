import type { ScrollAreaCoreProps } from "../../contracts/scroll-area";
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement>, ScrollAreaCoreProps {
  maxHeight?: number | string;
}
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea({ maxHeight = 240, style, ...props }, ref) {
    return (
      <div
        ref={ref}
        tabIndex={0}
        {...props}
        style={{
          maxHeight,
          overflow: 'auto',
          minWidth: 0,
          scrollbarGutter: 'stable',
          ...style,
        }}
      />
    );
  },
);
