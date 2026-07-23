/// <reference path="../.astro/types.d.ts" />

declare module "@fontsource-variable/inter";
declare module "@fontsource-variable/playfair-display";
declare module "@fontsource-variable/source-serif-4";
declare module "@fontsource-variable/noto-serif-display";
declare module "@fontsource-variable/cormorant-garamond";
declare module "@fontsource/castoro-titling";
declare module "@fontsource/kumar-one";
declare module "@fontsource-variable/cinzel";

interface Window {
    openImageZoom?: (
        src: string,
        options?: {
            srcs?: string[];
            startIndex?: number;
            previewSrc?: string;
            previewSrcs?: string[];
            onIndexChange?: (index: number) => void;
            onClose?: () => void;
        }
    ) => void;
}