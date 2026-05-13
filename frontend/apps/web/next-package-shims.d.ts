declare module "next/link" {
  import type * as React from "react";

  export interface LinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children?: React.ReactNode;
  }

  const Link: React.ForwardRefExoticComponent<
    LinkProps & React.RefAttributes<HTMLAnchorElement>
  >;

  export default Link;
}

declare module "next/image" {
  import type * as React from "react";

  export interface ImageProps
    extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
  }

  const Image: React.ComponentType<ImageProps>;

  export default Image;
}
