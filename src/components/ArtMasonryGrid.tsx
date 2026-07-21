import { useEffect, useMemo, useState } from 'react'
import { RegularMasonryGrid as MasonryGrid, Frame } from '@masonry-grid/react'

export interface OptimizedImage {
    src: string;
    width: number;
    height: number;
    originalSrc: string;
    category: string;
    date: string;
}

const ALL = 'All';
const PIECE_PARAM = 'piece';

const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

// Builds a stable, shareable id per artwork: "<category-slug>-<date>", falling
// back to a per-category index for pieces without a parseable date (Selected Work).
const buildPieceSlugMap = (artEntries: OptimizedImage[]) => {
    const counters = new Map<string, number>();
    const map = new Map<string, string>();
    for (const img of artEntries) {
        const catSlug = slugify(img.category);
        if (img.date) {
            map.set(img.originalSrc, `${catSlug}-${img.date}`);
        } else {
            const index = counters.get(catSlug) ?? 0;
            counters.set(catSlug, index + 1);
            map.set(img.originalSrc, `${catSlug}-${index}`);
        }
    }
    return map;
};

const setPieceParam = (slug: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (slug) {
        params.set(PIECE_PARAM, slug);
    } else {
        params.delete(PIECE_PARAM);
    }
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', url);
};

// The imageZoom script is loaded as a separate module tag; poll briefly in
// case it hasn't finished executing yet when we try to open a deep-linked image.
const waitForZoomReady = (cb: () => void, attempts = 20) => {
    if (typeof window.openImageZoom === 'function') {
        cb();
        return;
    }
    if (attempts <= 0) return;
    window.setTimeout(() => waitForZoomReady(cb, attempts - 1), 100);
};

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
    const [initialPieceSlug] = useState(
        () => new URLSearchParams(window.location.search).get(PIECE_PARAM)
    );

    const categories = useMemo(
        () => [ALL, ...Array.from(new Set(artEntries.map((img) => img.category)))],
        [artEntries]
    );
    const pieceSlugMap = useMemo(() => buildPieceSlugMap(artEntries), [artEntries]);
    const visible = active === ALL
        ? artEntries
            .filter((img) => img.category !== 'Selected Work')
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
        : artEntries.filter((img) => img.category === active);

    const openPieceAt = (list: OptimizedImage[], index: number) => {
        const srcs = list.map((piece) => piece.originalSrc);
        const previewSrcs = list.map((piece) => piece.src);
        setPieceParam(pieceSlugMap.get(list[index].originalSrc) ?? null);
        window.openImageZoom?.(srcs[index], {
            srcs,
            previewSrcs,
            startIndex: index,
            onIndexChange: (i) => setPieceParam(pieceSlugMap.get(list[i]?.originalSrc ?? '') ?? null),
            onClose: () => setPieceParam(null),
        });
    };

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
        const url = `${window.location.pathname}${window.location.search}${slug ? `#${slug}` : ''}`;
        window.history.replaceState(null, '', url);
    }, [active]);

    // Deep link: open the modal for ?piece=<slug> on first load.
    useEffect(() => {
        if (!initialPieceSlug) return;

        const foundImg = artEntries.find((img) => pieceSlugMap.get(img.originalSrc) === initialPieceSlug);
        if (!foundImg) return;

        if (foundImg.category !== active) {
            setActive(foundImg.category);
        }

        const list = artEntries.filter((img) => img.category === foundImg.category);
        const startIndex = list.findIndex((img) => img.originalSrc === foundImg.originalSrc);
        if (startIndex === -1) return;

        waitForZoomReady(() => openPieceAt(list, startIndex));
        // Only run once artEntries/pieceSlugMap are available.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [artEntries, pieceSlugMap]);

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
                                className="zoomable cursor-pointer"
                                loading="lazy"
                                width={img.width}
                                height={img.height}
                                data-zoom-src={img.originalSrc}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openPieceAt(visible, i);
                                }}
                            />
                        </Frame>
                    ))}
                </MasonryGrid>
            </div>
        </div>
    );
}