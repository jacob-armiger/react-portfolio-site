import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export default function ZoomableImage({ src, alt, width, height, className }) {
  return (
    <Zoom>
      <img src={src} alt={alt} width={width} height={height} className={className} />
    </Zoom>
  );
}
