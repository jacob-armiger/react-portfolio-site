// Lightweight image zoom: click a .zoomable image to open modal.
// Zoom via +/− buttons; drag-to-pan with mouse, touch, or trackpad.

const imagePreloadCache = new Set();

export function preloadImageZoomSrc(src) {
  if (!src || imagePreloadCache.has(src)) return;
  imagePreloadCache.add(src);
  const preloadImg = new Image();
  preloadImg.decoding = 'async';
  preloadImg.src = src;
}

const createModal = ({ srcs = [], startIndex = 0, previewSrcs = [], onIndexChange, onClose } = {}) => {
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

  const topFade = document.createElement('div');
  topFade.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 38vh;
    pointer-events: none;
    z-index: 10001;
    opacity: 0.22;
    transition: opacity 0.18s cubic-bezier(0.22, 1, 0.36, 1);
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.58) 28%,
      rgba(0, 0, 0, 0.2) 62%,
      rgba(0, 0, 0, 0) 100%
    );
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
  const isTouchUI = window.matchMedia('(pointer: coarse)').matches;
  // When there's more than one image, a thumbnail strip is pinned to the
  // bottom center; keep the toolbar at the top instead so they never overlap.
  const showThumbStrip = srcs.length > 1;
  if (isTouchUI || showThumbStrip) {
    toolbar.style.top = '16px';
    toolbar.style.right = '16px';
    toolbar.style.bottom = 'auto';
  }
  if (showThumbStrip) {
    // Mobile: portrait images are often width-constrained and never reach
    // max-height, so centering (with a shrunk max-height that guarantees
    // bottom clearance) keeps the leftover space symmetric and avoids an
    // awkward dead gap. Larger screens have room to spare, so anchor the
    // image near the top instead — that reclaims the space a centered
    // layout would otherwise waste above the image, letting it render
    // bigger while still clearing the thumbnail strip below.
    const isLargeViewport = window.matchMedia('(min-width: 768px)').matches;
    if (isLargeViewport) {
      const TOP_MARGIN = 24;
      const BOTTOM_RESERVE = 90;
      modal.style.alignItems = 'flex-start';
      img.style.marginTop = `${TOP_MARGIN}px`;
      img.style.maxHeight = `calc(100vh - ${TOP_MARGIN + BOTTOM_RESERVE}px)`;
    } else {
      img.style.maxHeight = 'calc(95vh - 110px)';
    }
  }
  if (isTouchUI) {
    toolbar.append(btnClose);
  } else {
    toolbar.append(btnZoomIn, btnZoomOut, btnClose);
  }

  let scale = 1;
  let tx = 0;
  let ty = 0;
  const BUTTON_STEP = 1.1;
  const CLICK_SCALE = 2.2;
  const MIN_SCALE = 1;
  const MAX_SCALE = 8;
  const EPSILON = 0.001;
  const SWIPE_RELEASE_CLOSE_MIN = 22;
  const SWIPE_CLAMP_DISTANCE = 220;
  const SWIPE_TRAVEL_DISTANCE = 260;
  const SWIPE_RESET_TRANSITION = 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
  const SWIPE_CLOSE_PHASE1_MS = 110;
  const SWIPE_CLOSE_PHASE2_MS = 90;
  const SWIPE_FADEOUT_VIEWPORT_RATIO = 0.72;
  const SWIPE_FLICK_EXTRA = 96;

  let currentIndex = startIndex;
  const hasNav = srcs.length > 1;
  const thumbButtons = [];

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
  let swipeResetTimer = null;
  let closeTimer = null;
  let isClosing = false;
  let sourceLoadToken = 0;
  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  let pinchAnchorLX = 0;
  let pinchAnchorLY = 0;
  let pinchBaseLeft = 0;
  let pinchBaseTop = 0;
  let touchMode = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let swipeDY = 0;
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;

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

  const resetViewState = () => {
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
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

  const clampIndex = (index) => Math.max(0, Math.min(srcs.length - 1, index));

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
  let thumbStrip = null;

  const updateNavState = () => {
    if (!hasNav) return;

    const atFirst = currentIndex <= 0;
    const atLast = currentIndex >= srcs.length - 1;

    if (btnPrev) {
      btnPrev.disabled = atFirst;
      btnPrev.style.opacity = atFirst ? '0.35' : '1';
      btnPrev.style.cursor = atFirst ? 'default' : 'pointer';
    }

    if (btnNext) {
      btnNext.disabled = atLast;
      btnNext.style.opacity = atLast ? '0.35' : '1';
      btnNext.style.cursor = atLast ? 'default' : 'pointer';
    }

    thumbButtons.forEach((thumbBtn, i) => {
      const isActive = i === currentIndex;
      thumbBtn.style.opacity = isActive ? '1' : '0.6';
      thumbBtn.style.borderColor = isActive
        ? 'rgba(255,255,255,0.95)'
        : 'rgba(255,255,255,0.35)';
    });
  };

  const warmNeighbors = (index) => {
    preloadImageZoomSrc(srcs[index]);
    preloadImageZoomSrc(srcs[index - 1]);
    preloadImageZoomSrc(srcs[index + 1]);
  };

  const setImageSourceForIndex = (index) => {
    const fullSrc = srcs[index];
    const previewSrc = previewSrcs[index] || fullSrc;

    if (previewSrc) {
      img.src = previewSrc;
    }

    if (!fullSrc || fullSrc === previewSrc) {
      warmNeighbors(index);
      return;
    }

    const thisLoadToken = ++sourceLoadToken;
    preloadImageZoomSrc(fullSrc);

    const fullImg = new Image();
    fullImg.decoding = 'async';
    fullImg.onload = () => {
      if (thisLoadToken !== sourceLoadToken) return;
      img.src = fullSrc;
      warmNeighbors(index);
    };
    fullImg.onerror = () => {
      warmNeighbors(index);
    };
    fullImg.src = fullSrc;

    if (fullImg.complete) {
      fullImg.onload?.();
    }
  };

  const setCurrentIndex = (nextIndex) => {
    const clamped = clampIndex(nextIndex);
    const didChange = clamped !== currentIndex;
    currentIndex = clamped;

    if (didChange || img.src !== srcs[currentIndex]) {
      resetViewState();
      setImageSourceForIndex(currentIndex);
    }

    updateNavState();

    if (didChange) {
      onIndexChange?.(currentIndex);
    }
  };

  const navigate = (delta) => {
    setCurrentIndex(currentIndex + delta);
  };

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

    thumbStrip = document.createElement('div');
    thumbStrip.style.cssText = `
      position: fixed;
      left: 50%; bottom: 14px;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      max-width: min(76vw, 720px);
      padding: 6px 8px;
      overflow-x: auto;
      overflow-y: hidden;
      border-radius: 10px;
      background: rgba(0,0,0,0.35);
      backdrop-filter: blur(4px);
      z-index: 10000;
      scrollbar-width: thin;
    `;

    srcs.forEach((src, i) => {
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.style.cssText = `
        width: 42px; height: 42px;
        border: 1px solid rgba(255,255,255,0.35);
        border-radius: 6px;
        overflow: hidden;
        padding: 0;
        background: transparent;
        cursor: pointer;
        flex: 0 0 auto;
        transition: opacity 0.12s ease, border-color 0.12s ease;
      `;

      const thumbImg = document.createElement('img');
      thumbImg.src = src;
      thumbImg.alt = `Preview ${i + 1}`;
      thumbImg.style.cssText = `
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
      `;

      thumbBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setCurrentIndex(i);
      });

      thumbBtn.appendChild(thumbImg);
      thumbStrip.appendChild(thumbBtn);
      thumbButtons.push(thumbBtn);
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

  const distanceBetweenTouches = (touchA, touchB) => {
    const dx = touchA.clientX - touchB.clientX;
    const dy = touchA.clientY - touchB.clientY;
    return Math.hypot(dx, dy);
  };

  const midpointBetweenTouches = (touchA, touchB) => ({
    x: (touchA.clientX + touchB.clientX) / 2,
    y: (touchA.clientY + touchB.clientY) / 2,
  });

  const beginPinch = (touchA, touchB) => {
    const midpoint = midpointBetweenTouches(touchA, touchB);
    const rect = img.getBoundingClientRect();
    pinchStartDistance = distanceBetweenTouches(touchA, touchB);
    pinchStartScale = scale;
    pinchAnchorLX = (midpoint.x - rect.left) / scale;
    pinchAnchorLY = (midpoint.y - rect.top) / scale;
    pinchBaseLeft = rect.left - tx;
    pinchBaseTop = rect.top - ty;
  };

  const resetSwipeVisual = () => {
    if (!isTouchUI) return;
    if (swipeResetTimer !== null) {
      window.clearTimeout(swipeResetTimer);
      swipeResetTimer = null;
    }
    modal.style.transition = SWIPE_RESET_TRANSITION;
    modal.style.transform = '';
    modal.style.opacity = '';
    topFade.style.opacity = '0.22';
    swipeResetTimer = window.setTimeout(() => {
      modal.style.transition = '';
      swipeResetTimer = null;
    }, 220);
  };

  const setSwipeVisual = (progress) => {
    const easedProgress = 1 - Math.pow(1 - progress, 0.45);
    const travel = easedProgress * SWIPE_TRAVEL_DISTANCE;
    const fade = Math.max(0.34, 1 - travel / 360);
    modal.style.transform = `translateY(${travel}px)`;
    modal.style.opacity = String(fade);
    topFade.style.opacity = String(Math.min(0.98, 0.22 + easedProgress * 0.72));
  };

  const runSwipeCloseFlick = () => {
    const fadeOutY = Math.round(window.innerHeight * SWIPE_FADEOUT_VIEWPORT_RATIO);
    const flickY = window.innerHeight + SWIPE_FLICK_EXTRA;

    // Phase 1: fade out before reaching screen bottom.
    modal.style.transition = `transform ${SWIPE_CLOSE_PHASE1_MS}ms cubic-bezier(0.24, 0.92, 0.28, 1), opacity 95ms cubic-bezier(0.4, 0, 1, 1)`;
    modal.style.transform = `translateY(${fadeOutY}px)`;
    modal.style.opacity = '0';
    topFade.style.opacity = '1';

    closeTimer = window.setTimeout(() => {
      if (isClosing) {
        closeTimer = null;
        return;
      }

      // Phase 2: short flick downward while invisible.
      modal.style.transition = `transform ${SWIPE_CLOSE_PHASE2_MS}ms cubic-bezier(0.2, 0.82, 0.35, 1)`;
      modal.style.transform = `translateY(${flickY}px)`;

      closeTimer = window.setTimeout(() => {
        close();
        closeTimer = null;
      }, SWIPE_CLOSE_PHASE2_MS);
    }, SWIPE_CLOSE_PHASE1_MS);
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
    if (isClosing) return;
    isClosing = true;

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('mouseleave', stopDrag);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchCancel);
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
    if (swipeResetTimer !== null) {
      window.clearTimeout(swipeResetTimer);
      swipeResetTimer = null;
    }
    if (closeTimer !== null) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    btnPrev?.remove();
    btnNext?.remove();
    thumbStrip?.remove();
    topFade.remove();
    document.body.style.overflow = '';
    toolbar.remove();
    modal.remove();

    onClose?.();
  };

  btnClose.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  img.addEventListener('click', (e) => {
    if (isTouchUI) return;
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

  const onMouseDown = (e) => {
    if (scale <= MIN_SCALE) return;
    e.preventDefault();
    startPan(e.clientX, e.clientY);
    setCursor();
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    movePan(e.clientX, e.clientY);
    setCursor();
  };

  img.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('mouseleave', stopDrag);

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      touchMode = 'pinch';
      didDrag = true;
      beginPinch(e.touches[0], e.touches[1]);
      return;
    }

    if (e.touches.length !== 1) return;
    e.preventDefault();

    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
    swipeDY = 0;

    if (scale > MIN_SCALE + EPSILON) {
      touchMode = 'pan';
      startPan(touch.clientX, touch.clientY);
      return;
    }

    touchMode = 'swipe';
  };

  const onTouchMove = (e) => {
    if (touchMode === 'pinch' && e.touches.length === 2) {
      e.preventDefault();
      if (pinchStartDistance <= 0) return;

      const nextDistance = distanceBetweenTouches(e.touches[0], e.touches[1]);
      const midpoint = midpointBetweenTouches(e.touches[0], e.touches[1]);
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchStartScale * (nextDistance / pinchStartDistance)));
      let nextTx = midpoint.x - pinchAnchorLX * nextScale - pinchBaseLeft;
      let nextTy = midpoint.y - pinchAnchorLY * nextScale - pinchBaseTop;

      if (nextScale === MIN_SCALE) {
        nextTx = 0;
        nextTy = 0;
      } else {
        const constrained = constrainTranslation(scale, nextTx, nextTy, nextScale);
        nextTx = constrained.tx;
        nextTy = constrained.ty;
      }

      scale = nextScale;
      tx = nextTx;
      ty = nextTy;
      applyTransform();
      return;
    }

    if (e.touches.length !== 1) return;
    e.preventDefault();

    const touch = e.touches[0];
    if (touchMode === 'pan') {
      movePan(touch.clientX, touch.clientY);
      return;
    }

    if (touchMode !== 'swipe' || scale > MIN_SCALE + EPSILON) return;
    const dy = touch.clientY - touchStartY;
    const dx = touch.clientX - touchStartX;
    if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) return;

    swipeDY = dy;
    const clamped = Math.min(SWIPE_CLAMP_DISTANCE, dy);
    const progress = clamped / SWIPE_CLAMP_DISTANCE;
    setSwipeVisual(progress);
  };

  const onTouchEnd = () => {
    const now = Date.now();
    const tapDuration = now - touchStartTime;
    const movedX = Math.abs(lastTapX - touchStartX);
    const movedY = Math.abs(lastTapY - touchStartY);

    if (touchMode === 'swipe') {
      if (swipeDY > SWIPE_RELEASE_CLOSE_MIN) {
        runSwipeCloseFlick();
        return;
      }
      resetSwipeVisual();

      const isQuickTap = swipeDY < 12 && tapDuration < 280;
      const isDoubleTap = isQuickTap && (now - lastTapTime) < 320 && movedX < 24 && movedY < 24;
      if (isDoubleTap) {
        if (scale <= MIN_SCALE + EPSILON) {
          zoomTo(CLICK_SCALE, touchStartX, touchStartY);
        } else {
          zoomTo(MIN_SCALE);
        }
        lastTapTime = 0;
      } else if (isQuickTap) {
        lastTapTime = now;
        lastTapX = touchStartX;
        lastTapY = touchStartY;
      }
    }

    if (touchMode === 'pinch') {
      pinchStartDistance = 0;
    }

    touchMode = null;
    swipeDY = 0;
    stopDrag();
  };

  const onTouchCancel = () => {
    touchMode = null;
    pinchStartDistance = 0;
    swipeDY = 0;
    resetSwipeVisual();
    stopDrag();
  };

  img.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);
  window.addEventListener('touchcancel', onTouchCancel);

  modal.addEventListener('click', (e) => {
    if (didDrag) {
      didDrag = false;
      return;
    }
    if (e.target === modal) close();
  });

  modal.appendChild(img);
  modal.appendChild(topFade);
  setCurrentIndex(currentIndex);

  if (hasNav) {
    document.body.appendChild(btnPrev);
    document.body.appendChild(btnNext);
    document.body.appendChild(thumbStrip);
  }

  return { modal, toolbar };
};

export function openImageZoom(src, {
  srcs = [],
  startIndex = 0,
  previewSrc,
  previewSrcs = [],
  onIndexChange,
  onClose,
} = {}) {
  const allSrcs = srcs.length > 0 ? srcs : [src];
  const idx = srcs.length > 0 ? startIndex : 0;
  const allPreviewSrcs = srcs.length > 0
    ? previewSrcs
    : [previewSrc || src];
  const { modal, toolbar } = createModal({
    srcs: allSrcs,
    startIndex: idx,
    previewSrcs: allPreviewSrcs,
    onIndexChange,
    onClose,
  });
  document.body.appendChild(toolbar);
  document.body.appendChild(modal);
}

export function initImageZoom() {
  if (typeof window === 'undefined') return;
  if (window.__imageZoomInitialized) return;
  window.__imageZoomInitialized = true;

  const maybePreloadFromTarget = (target) => {
    const el = target?.closest?.('img.zoomable');
    if (!el) return;
    preloadImageZoomSrc(el.dataset.zoomSrc || el.currentSrc || el.src);
  };

  document.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    maybePreloadFromTarget(e.target);
  }, true);

  document.addEventListener('touchstart', (e) => {
    maybePreloadFromTarget(e.target);
  }, { passive: true });

  document.addEventListener('mousedown', (e) => {
    maybePreloadFromTarget(e.target);
  }, true);

  document.addEventListener('click', (e) => {
    const el = e.target.closest('img.zoomable');
    if (!el) return;
    openImageZoom(el.dataset.zoomSrc || el.currentSrc || el.src, {
      previewSrc: el.currentSrc || el.src,
    });
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
  window.preloadImageZoomSrc = preloadImageZoomSrc;
}