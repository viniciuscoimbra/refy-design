export declare function parseHex(hex: string): [number, number, number];
export declare function toLinear(channel: number): number;
export declare function contrast(a: string, b: string): number;
export declare function readableText(background: string): "#000000" | "#ffffff";
export declare const CONTRAST_PAIRS: ReadonlyArray<readonly [foreground: string, background: string, min: number]>;
export interface ContrastIssue {
  foreground: string;
  background: string;
  min: number;
  ratio: number;
  suggestion: "#000000" | "#ffffff";
}
export declare function contrastIssues(
  colors: Record<string, string | undefined>,
  pairs?: ReadonlyArray<readonly [string, string, number]>,
): ContrastIssue[];
export interface MeasuredPair {
  foreground: string;
  background: string;
  min: number;
  ratio: number;
  passed: boolean;
}
export declare function measurePairs(
  colors: Record<string, string | undefined>,
  pairs?: ReadonlyArray<readonly [string, string, number]>,
): MeasuredPair[];
