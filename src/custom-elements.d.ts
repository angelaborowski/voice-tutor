import type { CSSProperties, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "lord-icon": HTMLAttributes<HTMLElement> & {
        src?: string;
        trigger?: string;
        stroke?: string;
        colors?: string;
        style?: CSSProperties;
      };
    }
  }
}
