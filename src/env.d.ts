/// <reference path="../.astro/types.d.ts" />

interface Window {
    openImageZoom?: (
        src: string,
        options?: {
            srcs?: string[];
            startIndex?: number;
            previewSrc?: string;
            previewSrcs?: string[];
            alts?: string[];
            onIndexChange?: (index: number) => void;
            onClose?: () => void;
        }
    ) => void;
}