import { useEffect, useMemo, useState } from 'react'
import { RegularMasonryGrid as MasonryGrid, Frame } from '@masonry-grid/react'

export interface OptimizedImage {
    src: string;
    width: number;
    height: number;
    originalSrc: string;
    category: string;
}

const ALL = 'All';

const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

function useResponsiveGridProps() {
    const getProps = () => {
        const w = window.innerWidth;
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
    const [active, setActive] = useState(ALL);

    const categories = useMemo(
        () => [ALL, ...Array.from(new Set(artEntries.map((img) => img.category)))],
        [artEntries]
    );
    const visible = active === ALL 
        ? artEntries.filter((img) => img.category !== 'Selected Work')
        : artEntries.filter((img) => img.category === active);

    // Read hash on mount and sync active category
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        const matchedCategory = categories.find(cat => slugify(cat) === hash);
        if (matchedCategory) {
            setActive(matchedCategory);
        }
    }, [categories]);

    // Stay in sync with browser back/forward navigation
    useEffect(() => {
        const onHashChange = () => {
            const hash = window.location.hash.slice(1);
            const matchedCategory = categories.find(cat => slugify(cat) === hash);
            setActive(matchedCategory ?? ALL);
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, [categories]);

    useEffect(() => {
        const slug = active === ALL ? '' : slugify(active);
        window.history.replaceState(null, '', slug ? `#${slug}` : window.location.pathname);
    }, [active]);

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-4">
            {/* Vertical filter nav */}
            <nav className="flex flex-row flex-wrap justify-center gap-x-4 gap-y-2 lg:justify-start lg:flex-col lg:gap-y-3 lg:w-24 lg:shrink-0 lg:pt-10">
                {categories.map((cat) => (
                    <a
                        key={cat}
                        href={cat === ALL ? '#' : `#${slugify(cat)}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setActive(cat);
                        }}
                        className={`text-left font-serif text-xs leading-none tracking-wide transition-opacity hover:opacity-100 ${
                            active === cat ? 'font-semibold opacity-100 underline underline-offset-2' : 'opacity-60'
                        }`}
                    >
                        {cat}
                    </a>
                ))}
            </nav>

            {/* Grid */}
            <div className="flex-1 min-w-0">
                <MasonryGrid frameWidth={frameWidth} gap={gap}>
                    {visible.map((img, i) => (
                        <Frame key={img.originalSrc + i} width={img.width} height={img.height}>
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
            </div>
        </div>
    );
}