/// <reference path="../.astro/types.d.ts" />

declare module "@fontsource-variable/inter";
declare module "@fontsource-variable/playfair-display";
declare module "@fontsource-variable/source-serif-4";

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