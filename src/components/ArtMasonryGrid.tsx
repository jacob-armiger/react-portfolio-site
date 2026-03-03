import { useEffect, useState } from 'react'
import { RegularMasonryGrid as MasonryGrid, Frame } from '@masonry-grid/react'

interface OptimizedImage {
    src: string;
    width: number;
    height: number;
    originalSrc: string;
}

function useResponsiveGridProps() {
    const getProps = () => {
        const w = window.innerWidth;
        // if (w < 640)  return { frameWidth: 160, gap: 6 };   // sm
        if (w < 400) return { frameWidth: 150, gap: 2 };   // md
        return               { frameWidth: 280, gap: 10 };  // lg+
    };

    const [props, setProps] = useState(getProps);

    useEffect(() => {
        const onResize = () => setProps(getProps());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return props;
}

export default function ArtMasonryGrid({ artEntries }: { artEntries: OptimizedImage[] }) {
    const { frameWidth, gap } = useResponsiveGridProps();

    return (
        <MasonryGrid frameWidth={frameWidth} gap={gap}>
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