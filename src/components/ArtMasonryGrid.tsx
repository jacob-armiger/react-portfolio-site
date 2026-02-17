import { Image } from "astro:assets";
import { RegularMasonryGrid as MasonryGrid, Frame } from '@masonry-grid/react'

export default function ArtMasonryGrid({ artEntries }: { artEntries: ImageMetadata[] }) {
    // https://www.reddit.com/r/astrojs/comments/1bia6lq/how_to_utilize_image_with_react_component/
    return (
        <MasonryGrid frameWidth={300} gap={10} >
                {artEntries.map((img: ImageMetadata) => (
                    <Frame width={img.width} height={img.height}>
                        <img src={img.src} alt="Artwork" className="zoomable" />
                    </Frame>
                ))}
        </MasonryGrid>
    );
}