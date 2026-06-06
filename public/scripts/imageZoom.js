// Lightweight image zoom: click a .zoomable image to open modal.
// Zoom via +/− buttons; drag-to-pan with mouse, touch, or trackpad.

const createModal = ({ srcs = [], startIndex = 0 } = {}) => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.85);
    z-index: 9999;
    overflow: hidden;
    touch-action: none;
  `;

  const setModalHeight = () => {
    modal.style.height = window.innerHeight + 'px';
  };
  setModalHeight();
  window.addEventListener('resize', setModalHeight);

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
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  `;

  const makeBtn = (label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.style.cssText = btnStyle;
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255,255,255,0.3)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(255,255,255,0.15)';
    });
    return btn;
  };

  const btnZoomIn = makeBtn('+');
  const btnZoomOut = makeBtn('−');
  const btnClose = makeBtn('×');
  toolbar.append(btnZoomIn, btnZoomOut, btnClose);

  let scale = 1;
  let tx = 0;
  let ty = 0;
  const BUTTON_STEP = 1.1;
  const CLICK_SCALE = 2.2;
  const MIN_SCALE = 1;
  const MAX_SCALE = 8;
  const EPSILON = 0.001;

  let currentIndex = startIndex;
  const hasNav = srcs.length > 1;

  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let txAtDrag = 0;
  let tyAtDrag = 0;
  let didDrag = false;

  let wheelDX = 0;
  let wheelDY = 0;
  let wheelRaf = null;
  let wheelEndTimer = null;

  const setCursor = () => {
    if (dragging && scale > MIN_SCALE + EPSILON) {
      img.style.cursor = 'grabbing';
      return;
    }
    img.style.cursor = scale > MIN_SCALE + EPSILON ? 'zoom-out' : 'zoom-in';
  };

  const applyTransform = () => {
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    setCursor();
    btnZoomOut.disabled = scale <= MIN_SCALE;
    btnZoomIn.disabled = scale >= MAX_SCALE;
    btnZoomOut.style.opacity = scale <= MIN_SCALE ? '0.35' : '1';
    btnZoomIn.style.opacity = scale >= MAX_SCALE ? '0.35' : '1';
  };

  const constrainTranslation = (currentScale, nextTx, nextTy, nextScale = currentScale) => {
    const rect = img.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const baseLeft = rect.left - tx;
    const baseTop = rect.top - ty;
    const baseWidth = rect.width / currentScale;
    const baseHeight = rect.height / currentScale;
    const nextWidth = baseWidth * nextScale;
    const nextHeight = baseHeight * nextScale;

    let constrainedTx = nextTx;
    let constrainedTy = nextTy;

    if (nextWidth <= vw) {
      constrainedTx = (vw - nextWidth) / 2 - baseLeft;
    } else {
      const minTx = vw - baseLeft - nextWidth;
      const maxTx = -baseLeft;
      constrainedTx = Math.max(minTx, Math.min(maxTx, constrainedTx));
    }

    if (nextHeight <= vh) {
      constrainedTy = (vh - nextHeight) / 2 - baseTop;
    } else {
      const minTy = vh - baseTop - nextHeight;
      const maxTy = -baseTop;
      constrainedTy = Math.max(minTy, Math.min(maxTy, constrainedTy));
    }

    return { tx: constrainedTx, ty: constrainedTy };
  };

  const zoomTo = (nextScale, centerX, centerY) => {
    const rect = img.getBoundingClientRect();
    const currentScale = scale;
    const cx = centerX ?? (rect.left + rect.width / 2);
    const cy = centerY ?? (rect.top + rect.height / 2);
    const lx = (cx - rect.left) / currentScale;
    const ly = (cy - rect.top) / currentScale;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));

    const nextTx = cx - lx * newScale - (rect.left - tx);
    const nextTy = cy - ly * newScale - (rect.top - ty);

    if (newScale === MIN_SCALE) {
      scale = newScale;
      tx = 0;
      ty = 0;
    } else {
      const constrained = constrainTranslation(currentScale, nextTx, nextTy, newScale);
      tx = constrained.tx;
      ty = constrained.ty;
      scale = newScale;
    }

    applyTransform();
  };

  const zoomBy = (factor) => zoomTo(scale * factor);

  btnZoomIn.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomBy(BUTTON_STEP);
  });
  btnZoomOut.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomBy(1 / BUTTON_STEP);
  });

  const navigate = (delta) => {
    currentIndex = (currentIndex + delta + srcs.length) % srcs.length;
    img.src = srcs[currentIndex];
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
  };

  const navBtnStyle = `
    position: fixed;
    top: 50%; transform: translateY(-50%);
    width: 44px; height: 44px;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 6px;
    color: #fff; font-size: 22px; line-height: 1;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    z-index: 10000;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  `;

  let btnPrev = null;
  let btnNext = null;
  if (hasNav) {
    btnPrev = document.createElement('button');
    btnPrev.type = 'button';
    btnPrev.textContent = '❮';
    btnPrev.style.cssText = navBtnStyle + 'left: 8px;';
    btnPrev.addEventListener('mouseenter', () => {
      btnPrev.style.background = 'rgba(255,255,255,0.3)';
    });
    btnPrev.addEventListener('mouseleave', () => {
      btnPrev.style.background = 'rgba(255,255,255,0.15)';
    });
    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate(-1);
    });

    btnNext = document.createElement('button');
    btnNext.type = 'button';
    btnNext.textContent = '❯';
    btnNext.style.cssText = navBtnStyle + 'right: 8px;';
    btnNext.addEventListener('mouseenter', () => {
      btnNext.style.background = 'rgba(255,255,255,0.3)';
    });
    btnNext.addEventListener('mouseleave', () => {
      btnNext.style.background = 'rgba(255,255,255,0.15)';
    });
    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate(1);
    });
  }

  const startPan = (clientX, clientY) => {
    dragging = true;
    didDrag = false;
    dragStartX = clientX;
    dragStartY = clientY;
    txAtDrag = tx;
    tyAtDrag = ty;
    img.style.transition = 'none';
  };

  const movePan = (clientX, clientY) => {
    if (!dragging) return;
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag = true;

    const constrained = constrainTranslation(scale, txAtDrag + dx, tyAtDrag + dy);
    tx = constrained.tx;
    ty = constrained.ty;
    applyTransform();
  };

  const stopDrag = () => {
    if (!dragging) return;
    dragging = false;
    img.style.transition = 'transform 0.15s ease';
    setCursor();
  };

  const flushWheelPan = () => {
    wheelRaf = null;
    if (wheelDX === 0 && wheelDY === 0) return;

    const prevTx = tx;
    const prevTy = ty;
    const constrained = constrainTranslation(scale, tx - wheelDX, ty - wheelDY);
    tx = constrained.tx;
    ty = constrained.ty;
    wheelDX = 0;
    wheelDY = 0;

    if (Math.abs(tx - prevTx) > 0.5 || Math.abs(ty - prevTy) > 0.5) {
      didDrag = true;
    }

    applyTransform();
  };

  const onWheel = (e) => {
    if (scale <= MIN_SCALE + EPSILON) return;
    e.preventDefault();

    img.style.transition = 'none';
    if (wheelEndTimer !== null) window.clearTimeout(wheelEndTimer);
    wheelEndTimer = window.setTimeout(() => {
      wheelEndTimer = null;
      if (!dragging) img.style.transition = 'transform 0.15s ease';
    }, 80);

    const unit = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? window.innerHeight : 1);
    wheelDX += e.deltaX * unit;
    wheelDY += e.deltaY * unit;

    if (wheelRaf === null) {
      wheelRaf = window.requestAnimationFrame(flushWheelPan);
    }
  };
  modal.addEventListener('wheel', onWheel, { passive: false });

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (!hasNav) return;
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  };
  document.addEventListener('keydown', onKeyDown);

  const close = () => {
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('mouseleave', stopDrag);
    window.removeEventListener('touchend', stopDrag);
    window.removeEventListener('touchcancel', stopDrag);
    window.removeEventListener('resize', setModalHeight);
    modal.removeEventListener('wheel', onWheel);
    document.removeEventListener('keydown', onKeyDown);

    if (wheelRaf !== null) {
      window.cancelAnimationFrame(wheelRaf);
      wheelRaf = null;
    }
    if (wheelEndTimer !== null) {
      window.clearTimeout(wheelEndTimer);
      wheelEndTimer = null;
    }

    btnPrev?.remove();
    btnNext?.remove();
    document.body.style.overflow = '';
    toolbar.remove();
    modal.remove();
  };

  btnClose.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  img.addEventListener('click', (e) => {
    e.stopPropagation();
    if (didDrag) {
      didDrag = false;
      return;
    }

    if (scale <= MIN_SCALE + EPSILON) {
      zoomTo(CLICK_SCALE, e.clientX, e.clientY);
      return;
    }

    zoomTo(MIN_SCALE);
  });

  img.addEventListener('mousedown', (e) => {
    if (scale <= MIN_SCALE) return;
    e.preventDefault();
    startPan(e.clientX, e.clientY);
    setCursor();
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    movePan(e.clientX, e.clientY);
    setCursor();
  });
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('mouseleave', stopDrag);

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
  window.addEventListener('touchend', stopDrag);
  window.addEventListener('touchcancel', stopDrag);

  modal.addEventListener('click', (e) => {
    if (didDrag) {
      didDrag = false;
      return;
    }
    if (e.target === modal) close();
  });

  modal.appendChild(img);
  applyTransform();

  if (hasNav) {
    document.body.appendChild(btnPrev);
    document.body.appendChild(btnNext);
  }

  return { modal, toolbar };
};

export function openImageZoom(src, { srcs = [], startIndex = 0 } = {}) {
  const allSrcs = srcs.length > 0 ? srcs : [src];
  const idx = srcs.length > 0 ? startIndex : 0;
  const { modal, toolbar } = createModal({ srcs: allSrcs, startIndex: idx });
  modal.querySelector('img').src = allSrcs[idx];
  document.body.appendChild(toolbar);
  document.body.appendChild(modal);
}

export function initImageZoom() {
  if (typeof window === 'undefined') return;
  if (window.__imageZoomInitialized) return;
  window.__imageZoomInitialized = true;

  document.addEventListener('click', (e) => {
    const el = e.target.closest('img.zoomable');
    if (!el) return;
    openImageZoom(el.dataset.zoomSrc || el.currentSrc || el.src);
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      initImageZoom();
    }, { once: true });
  } else {
    initImageZoom();
  }
  window.openImageZoom = openImageZoom;
}