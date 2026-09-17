'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from '@/components/common/Image';
import type { SanityImageAsset } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface ProjectGalleryItem {
  id: string;
  source?: SanityImageAsset;
  src?: string;
  alt: string;
  caption?: string;
}

interface ProjectGalleryProps {
  images: ProjectGalleryItem[];
  projectTitle: string;
  variant?: 'cover' | 'grid';
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={direction === 'left' ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'} />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
    </svg>
  );
}

export function ProjectGallery({ images, projectTitle, variant = 'grid' }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastTrigger = useRef(0);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pointerStartX = useRef<number | null>(null);
  const wasOpen = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const show = useCallback(
    (index: number) => {
      if (!images.length) return;
      setActiveIndex((index + images.length) % images.length);
    },
    [images.length],
  );

  const close = useCallback(() => setOpen(false), []);

  const openAt = (index: number) => {
    lastTrigger.current = index;
    setActiveIndex(index);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    document.body.dataset.galleryOpen = 'true';
    wasOpen.current = true;
    window.setTimeout(() => closeRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') show(activeIndex - 1);
      if (event.key === 'ArrowRight') show(activeIndex + 1);
      if (event.key === 'Home') show(0);
      if (event.key === 'End') show(images.length - 1);
      if (event.key === 'Tab') {
        const buttons = Array.from(
          lightboxRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [],
        );
        if (!buttons.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      delete document.body.dataset.galleryOpen;
    };
  }, [activeIndex, close, images.length, open, show]);

  useEffect(() => {
    if (!open && mounted && wasOpen.current) {
      triggerRefs.current[lastTrigger.current]?.focus();
      wasOpen.current = false;
    }
  }, [mounted, open]);

  if (!images.length) return null;

  const activeImage = images[activeIndex];
  const lightbox = (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={lightboxRef}
          className="project-lightbox on-inverse"
          role="dialog"
          aria-modal="true"
          aria-label={`${projectTitle} image gallery`}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.28 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="project-lightbox-topbar">
            <p>
              {projectTitle}
              <span aria-hidden="true"> / </span>
              <span className="numeric">
                {String(activeIndex + 1).padStart(2, '0')} —{' '}
                {String(images.length).padStart(2, '0')}
              </span>
            </p>
            <button ref={closeRef} type="button" onClick={close} aria-label="Close gallery">
              <CloseIcon />
            </button>
          </div>

          <div
            className="project-lightbox-stage"
            onPointerDown={(event) => {
              pointerStartX.current = event.clientX;
            }}
            onPointerUp={(event) => {
              if (pointerStartX.current === null) return;
              const distance = event.clientX - pointerStartX.current;
              pointerStartX.current = null;
              if (Math.abs(distance) < 45) return;
              show(distance > 0 ? activeIndex - 1 : activeIndex + 1);
            }}
            onPointerCancel={() => {
              pointerStartX.current = null;
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={activeImage.id}
                className="project-lightbox-slide"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 1.01 }}
                transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  source={activeImage.source}
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  priority
                  cdnWidth={2200}
                  sizes="100vw"
                  className="object-contain"
                  wrapperClassName="project-lightbox-image-frame"
                />
              </motion.figure>
            </AnimatePresence>
          </div>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                className="project-lightbox-arrow project-lightbox-arrow--left"
                onClick={() => show(activeIndex - 1)}
                aria-label="Previous image"
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                type="button"
                className="project-lightbox-arrow project-lightbox-arrow--right"
                onClick={() => show(activeIndex + 1)}
                aria-label="Next image"
              >
                <ArrowIcon direction="right" />
              </button>
            </>
          ) : null}

          <div className="project-lightbox-bottom">
            <p aria-live="polite">{activeImage.caption ?? activeImage.alt}</p>
            <div className="project-lightbox-filmstrip" role="tablist" aria-label="Choose an image">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`View image ${index + 1}: ${image.alt}`}
                  onClick={() => show(index)}
                  className={cn(index === activeIndex && 'is-active')}
                >
                  <Image
                    source={image.source}
                    src={image.src}
                    alt=""
                    fill
                    cdnWidth={220}
                    sizes="96px"
                    wrapperClassName="h-full w-full"
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      {variant === 'cover' ? (
        <button
          ref={(element) => {
            triggerRefs.current[0] = element;
          }}
          type="button"
          className="project-gallery-cover group"
          onClick={() => openAt(0)}
          aria-label={`Open ${projectTitle} gallery`}
        >
          <Image
            source={images[0].source}
            src={images[0].src}
            alt={images[0].alt}
            fill
            priority
            cdnWidth={2400}
            sizes="100vw"
            wrapperClassName="h-full w-full"
            className="transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.025]"
          />
          <span className="project-gallery-cover-action" aria-hidden="true">
            <ExpandIcon />
            View gallery
          </span>
        </button>
      ) : (
        <div className="project-gallery-grid">
          {images.map((image, index) => (
            <button
              key={image.id}
              ref={(element) => {
                triggerRefs.current[index] = element;
              }}
              type="button"
              className="project-gallery-tile group"
              onClick={() => openAt(index)}
              aria-label={`Open image ${index + 1}: ${image.alt}`}
            >
              <Image
                source={image.source}
                src={image.src}
                alt={image.alt}
                fill
                cdnWidth={index === 0 ? 2000 : 1200}
                sizes={
                  index === 0
                    ? '(max-width: 768px) 100vw, 1400px'
                    : '(max-width: 768px) 100vw, 700px'
                }
                wrapperClassName="h-full w-full"
                className="transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.035]"
              />
              <span className="project-gallery-tile-number numeric" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>
      )}

      {mounted ? createPortal(lightbox, document.body) : null}
    </>
  );
}
