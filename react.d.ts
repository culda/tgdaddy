export {};

declare namespace React {
  interface HTMLAttributes<T> {
    class?: string;
  }
  interface SVGAttributes<T> {
    class?: string;
  }
}

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}
