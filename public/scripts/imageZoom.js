// Lightweight image zoom: click a .zoomable image to open modal
const createModal = () => {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.left = 0;
  modal.style.top = 0;
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.background = 'rgba(0,0,0,0.8)';
  modal.style.zIndex = 9999;
  modal.style.cursor = 'zoom-out';

  const img = document.createElement('img');
  img.style.maxWidth = '95%';
  img.style.maxHeight = '95%';
  img.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)';
  img.style.borderRadius = '6px';

  modal.appendChild(img);

  modal.addEventListener('click', () => {
    modal.remove();
  });

  return { modal, img };
};

export function initImageZoom() {
  if (typeof window === 'undefined') return;
  const imgs = document.querySelectorAll('img.zoomable');
  if (!imgs.length) return;

  imgs.forEach((el) => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', (e) => {
      const { modal, img } = createModal();
      img.src = el.currentSrc || el.src;
      document.body.appendChild(modal);
    });
  });
}

// auto-init on DOMContentLoaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initImageZoom();
  });
}
