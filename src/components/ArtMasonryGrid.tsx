import { RegularMasonryGrid as MasonryGrid, Frame } from '@masonry-grid/react'

interface OptimizedImage {
    src: string;
    width: number;
    height: number;
    originalSrc: string;
}

export default function ArtMasonryGrid({ artEntries }: { artEntries: OptimizedImage[] }) {
    return (
        <MasonryGrid frameWidth={280} gap={10}>
            {artEntries.map((img, i) => (
                <Frame key={i} width={img.width} height={img.height}>
                    <img
                        src={img.src}
                        alt="Artwork"
                        className="zoomable"
                        loading="lazy"
                        width={img.width}
                        height={img.height}
                        data-zoom-src={img.originalSrc}
                        style={{ cursor: 'zoom-in' }}
                    />
                </Frame>
            ))}
        </MasonryGrid>
    );
}