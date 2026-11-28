import { useEffect, useMemo, useState } from 'react'

export interface OptimizedImage {
    src: string;
    srcSet: string;
    width: number;
    height: number;
    originalSrc: string;
    category: string;
    date: string;
    alt: string;
}

const ALL = 'All';
const PIECE_PARAM = 'piece';

const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

// Slug per artwork: "<category-slug>-<date>", or "<category-slug>-<index>" when
// there is no parseable date (Selected Work).
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

// imageZoom.js loads as its own module script; poll until window.openImageZoom exists.
const waitForZoomReady = (cb: () => void, attempts = 20) => {
    if (typeof window.openImageZoom === 'function') {
        cb();
        return;
    }
    if (attempts <= 0) return;
    window.setTimeout(() => waitForZoomReady(cb, attempts - 1), 100);
};

export default function ArtMasonryGrid({ artEntries }: { artEntries: OptimizedImage[] }) {
    const [active, setActive] = useState(ALL);

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
        const alts = list.map((piece) => piece.alt);
        setPieceParam(pieceSlugMap.get(list[index].originalSrc) ?? null);
        window.openImageZoom?.(srcs[index], {
            srcs,
            previewSrcs,
            alts,
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
        const initialPieceSlug = new URLSearchParams(window.location.search).get(PIECE_PARAM);
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
        <div className="flex flex-col gap-4 lg:contents">
            {/* Filter nav */}
            <nav aria-label="Art categories" className="site-inset flex flex-row flex-wrap justify-start gap-x-2 gap-y-2 sm:gap-x-3 lg:col-start-2 lg:flex-nowrap">
                {categories.map((cat) => (
                    <a
                        key={cat}
                        href={cat === ALL ? '#' : `#${slugify(cat)}`}
                        aria-current={active === cat ? 'true' : undefined}
                        onClick={(e) => {
                            e.preventDefault();
                            setActive(cat);
                        }}
                        // Not redundant with sm:text-xs; the larger size wraps the row on small phones.
                        className={`text-left font-serif text-[0.6875rem] leading-none tracking-normal hover:text-inherit sm:text-xs sm:tracking-wide ${
                            active === cat ? 'font-semibold underline underline-offset-2' : 'text-ink-muted'
                        }`}
                    >
                        {cat}
                    </a>
                ))}
            </nav>

            {/* Grid */}
            <div className="min-w-0 lg:col-span-2 lg:row-start-2">
                {/* Justified rows: each tile grows in proportion to its aspect ratio, so a
                    full row fills the width at one shared height without cropping. The
                    ::after filler keeps the last row from stretching. Sized in CSS, not
                    from window.innerWidth, so the grid renders on the server. */}
                <div className="flex flex-wrap gap-[2px] [--art-row:9rem] after:flex-[999_1_var(--art-row)] after:content-[''] min-[400px]:gap-[5px] min-[400px]:[--art-row:12.5rem] sm:[--art-row:16rem] lg:[--art-row:19rem]">
                    {visible.map((img, i) => {
                        const ratio = img.width / img.height;
                        return (
                            <div
                                key={img.originalSrc + i}
                                className="max-w-full"
                                style={{ aspectRatio: `${img.width} / ${img.height}`, flexGrow: ratio, flexBasis: `calc(${ratio} * var(--art-row))` }}
                            >
                                <button
                                    type="button"
                                    aria-haspopup="dialog"
                                    className="group block h-full w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                                    onClick={(e) => {
                                        // The img keeps .zoomable for hover preloading; stop imageZoom.js's
                                        // document click handler from opening a second modal for it.
                                        e.stopPropagation();
                                        openPieceAt(visible, i);
                                    }}
                                >
                                    <img
                                        src={img.src}
                                        srcSet={img.srcSet}
                                        sizes="(min-width: 640px) 40vw, 60vw"
                                        alt={img.alt}
                                        className="zoomable block h-full w-full transition-[filter] duration-300 dark:brightness-(--thumb-dim) dark:group-hover:brightness-100 dark:group-focus-visible:brightness-100"
                                        // Roughly the first screen of the grid; the rest wait for scroll.
                                        loading={i < 8 ? 'eager' : 'lazy'}
                                        width={img.width}
                                        height={img.height}
                                        data-zoom-src={img.originalSrc}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}