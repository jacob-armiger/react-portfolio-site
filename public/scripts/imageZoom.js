// Lightweight image zoom: click a .zoomable image to open modal.
// Zoom via +/− buttons; drag-to-pan when zoomed in.
const createModal = () => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.85);
    z-index: 9999;
    overflow: hidden;
  `;
  // Use window.innerHeight so the backdrop covers the full visual viewport
  // on mobile Safari (avoids the URL-bar gap that 100dvh/100vh can leave).
  const setModalHeight = () => { modal.style.height = window.innerHeight + 'px'; };
  setModalHeight();
  window.addEventListener('resize', setModalHeight);

  // Disable page scroll while modal is open
  document.body.style.overflow = 'hidden';

  const img = document.createElement('img');
  img.style.cssText = `
    max-width: 95vw; max-height: 95vh;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    border-radius: 6px;
    transform-origin: 0 0;
    user-select: none;
    transition: transform 0.15s ease;
  `;

  // --- toolbar (bottom-right) ---
  const toolbar = document.createElement('div');
  toolbar.style.cssText = `
    position: fixed; bottom: 16px; right: 16px;
    display: flex; gap: 8px;
    z-index: 10000;
  `;

  const btnStyle = `
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 6px;
    color: #fff;
    font-size: 20px; line-height: 1;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  `;

  const makeBtn = (label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.style.cssText = btnStyle;
    btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(255,255,255,0.3)');
    btn.addEventListener('mouseleave', () => btn.style.background = 'rgba(255,255,255,0.15)');
    return btn;
  };

  const btnZoomIn  = makeBtn('+');
  const btnZoomOut = makeBtn('−');
  const btnClose   = makeBtn('×');

  toolbar.append(btnZoomIn, btnZoomOut, btnClose);

  // --- zoom / pan state ---
  let scale = 1;
  let tx = 0;
  let ty = 0;
  const STEP      = 1.5;
  const MIN_SCALE = 1;
  const MAX_SCALE = 8;

  const applyTransform = () => {
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    img.style.cursor = scale > 1 ? 'grab' : 'default';
    btnZoomOut.disabled = scale <= MIN_SCALE;
    btnZoomIn.disabled  = scale >= MAX_SCALE;
    btnZoomOut.style.opacity = scale <= MIN_SCALE ? '0.35' : '1';
    btnZoomIn.style.opacity  = scale >= MAX_SCALE ? '0.35' : '1';
  };

  // Clamp so at least 80 px of the image stays on screen
  const clamp = () => {
    const r = img.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight, m = 80;
    tx = Math.min(tx, vw  - m - (r.left - tx) - 1);
    tx = Math.max(tx, m - r.width  + (tx - r.left) + 1);
    ty = Math.min(ty, vh - m - (r.top  - ty) - 1);
    ty = Math.max(ty, m - r.height + (ty - r.top)  + 1);
  };

  // Zoom centred on the image centre
  const zoomBy = (factor) => {
    const rect = img.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const lx = (cx - rect.left) / scale;
    const ly = (cy - rect.top)  / scale;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
    tx = cx - lx * newScale - (rect.left - tx);
    ty = cy - ly * newScale - (rect.top  - ty);
    scale = newScale;
    if (scale === MIN_SCALE) { tx = 0; ty = 0; }
    else clamp();
    applyTransform();
  };

  btnZoomIn.addEventListener('click',  (e) => { e.stopPropagation(); zoomBy(STEP); });
  btnZoomOut.addEventListener('click', (e) => { e.stopPropagation(); zoomBy(1 / STEP); });

  // --- Drag-to-pan (mouse + touch) ---
  let dragging = false, dragStartX = 0, dragStartY = 0;
  let txAtDrag = 0, tyAtDrag = 0, didDrag = false;

  const startPan = (clientX, clientY) => {
    dragging = true; didDrag = false;
    dragStartX = clientX; dragStartY = clientY;
    txAtDrag = tx; tyAtDrag = ty;
    img.style.transition = 'none';
  };

  const movePan = (clientX, clientY) => {
    if (!dragging) return;
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag = true;
    tx = txAtDrag + dx; ty = tyAtDrag + dy;
    clamp(); applyTransform();
  };

  const stopDrag = () => {
    if (!dragging) return;
    dragging = false;
    img.style.cursor = scale > 1 ? 'grab' : 'default';
    img.style.transition = 'transform 0.15s ease';
  };

  // Mouse
  img.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    img.style.cursor = 'grabbing';
    startPan(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    movePan(e.clientX, e.clientY);
    img.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup',    stopDrag);
  window.addEventListener('mouseleave', stopDrag);

  // Touch
  img.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    startPan(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  window.addEventListener('touchmove', (e) => {
    if (!dragging || e.touches.length !== 1) return;
    e.preventDefault();
    movePan(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  window.addEventListener('touchend',    stopDrag);
  window.addEventListener('touchcancel', stopDrag);

  // --- Close ---
  const close = () => {
    window.removeEventListener('mouseup',    stopDrag);
    window.removeEventListener('mouseleave', stopDrag);
    window.removeEventListener('touchend',    stopDrag);
    window.removeEventListener('touchcancel', stopDrag);
    window.removeEventListener('resize', setModalHeight);
    document.body.style.overflow = '';
    toolbar.remove();
    modal.remove();
  };

  btnClose.addEventListener('click', (e) => { e.stopPropagation(); close(); });

  modal.addEventListener('click', (e) => {
    if (didDrag) { didDrag = false; return; }
    if (e.target === modal) close();
  });

  modal.appendChild(img);

  return { modal, toolbar };
};

export function initImageZoom() {
  if (typeof window === 'undefined') return;

  document.addEventListener('click', (e) => {
    const el = e.target.closest('img.zoomable');
    if (!el) return;
    el.style.cursor = 'zoom-in';
    const { modal, toolbar } = createModal();
    modal.querySelector('img').src = el.dataset.zoomSrc || el.currentSrc || el.src;
    document.body.appendChild(toolbar);
    document.body.appendChild(modal);
  });
}

// auto-init on DOMContentLoaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initImageZoom();
  });
}
