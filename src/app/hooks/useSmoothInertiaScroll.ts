'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

const detectLowSpec = () => {
  try {
    const mem = (navigator as any).deviceMemory || 4;
    const cores = (navigator as any).hardwareConcurrency || navigator.hardwareConcurrency || 4;
    return (mem && mem <= 1.5) || (cores && cores <= 2);
  } catch (e) {
    return false;
  }
};

export const useLenisScroll = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lowSpec = detectLowSpec();

    // Low-spec 環境では RAF を自動に任せ、multiplier を抑える
    const lenis = new Lenis({
      lerp: lowSpec ? 0.08 : 0.15,
      duration: lowSpec ? 1.4 : 1.0,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !lowSpec, // 低スペックでは通常スクロール挙動を優先
      wheelMultiplier: lowSpec ? 0.9 : 1.2,
      touchMultiplier: lowSpec ? 0.9 : 1.2,
      infinite: false,
      autoResize: true,
      autoRaf: lowSpec ? true : false, // 低スペでは Lenis に RAF を任せて負荷を抑制
      syncTouch: false,
      syncTouchLerp: 0.08,
      touchInertiaExponent: 1.0,
      overscroll: false,
    });

    lenisRef.current = lenis;

    // 手動 RAF を使う場合のみフレームループを実行
    let rafId: number | undefined;
    if (!lenis.options.autoRaf) {
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    interface ScrollEvent {
      scroll: number;
      direction: number;
      velocity: number;
    }

    // スロットル間隔は低スペで広めにする
    const throttleMs = lowSpec ? 120 : 16;
    let scrollTimeout: any = null;
    const throttledScrollHandler = ({ scroll, direction, velocity }: ScrollEvent) => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        const header = document.querySelector('nav');
        if (header && Math.abs(velocity) > 1.5) {
          const shouldHide = direction === 1 && scroll > 100;
          (header as HTMLElement).style.transform = shouldHide ? 'translateY(-100%)' : 'translateY(0)';
        }
        scrollTimeout = null;
      }, throttleMs);
    };

    lenis.on('scroll', throttledScrollHandler);

    (window as unknown as { lenis: Lenis }).lenis = lenis;

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      lenis.destroy();
      (window as unknown as { lenis: Lenis | null }).lenis = null;
    };
  }, []);

  return lenisRef.current;
};