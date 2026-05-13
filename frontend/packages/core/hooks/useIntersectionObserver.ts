"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * useIntersectionObserver — Lazy load ve infinite scroll için
 *
 * @param options - IntersectionObserver seçenekleri
 * @returns [ref, isIntersecting] — ref'i hedef elemente bağla
 *
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
 * return <div ref={ref}>{isVisible && <HeavyComponent />}</div>;
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
): [React.RefCallback<Element>, boolean] {
  const { threshold = 0, root = null, rootMargin = "0%", freezeOnceVisible = false } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const frozen = isIntersecting && freezeOnceVisible;

  const ref: React.RefCallback<Element> = (node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node && !frozen) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry) setIsIntersecting(entry.isIntersecting);
        },
        { threshold, root, rootMargin },
      );
      observerRef.current.observe(node);
    }
  };

  // Cleanup — observer her zaman disconnect edilir
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [ref, isIntersecting];
}
