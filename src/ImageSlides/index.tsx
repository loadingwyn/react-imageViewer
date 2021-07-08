/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { ReactNode, useCallback, useLayoutEffect, useState } from 'react';
import AlloyFinger from 'alloyfinger/react/AlloyFinger';
import ImageController from '../ImageController';
import { Portal } from '../Overlay';
import { ownerWindow } from '../utils/disableScrolling';
import './style.css';
import useMouseEvents from '../utils/useMouseEvents';

const GUTTER_WIDTH = 10;
const SWIPE_TRIGGER = 40;

function getTranslateValue(node: HTMLElement): number {
  if (!node) return 0;
  const containerWindow = ownerWindow(node);
  const computedStyle = containerWindow.getComputedStyle(node);
  const transform =
    computedStyle.getPropertyValue('-webkit-transform') ||
    computedStyle.getPropertyValue('transform');
  let offsetX = 0;
  if (transform && transform !== 'none' && typeof transform === 'string') {
    const transformValues = transform.split('(')[1].split(')')[0].split(',');
    offsetX = parseInt(transformValues[4], 10);
  }
  return offsetX;
}

function setTranslateValue(node: HTMLElement, offset: number) {
  if (!node) return;
  const newTranslate = `translateX(${offset}px)`;
  node.style.webkitTransform = newTranslate;
  node.style.transform = newTranslate;
}

export interface GalleryProps {
  images: string[];
  index: number;
  isOpen: boolean;
  showPageButton?: boolean | 'auto';
  tapClose: boolean;
  loadingIcon?: ReactNode;
  onClose?: (index: number) => any;
  onChange: (index: number) => any;
}

export function Gallery({ isOpen, images, index, onChange, showPageButton = true }: GalleryProps) {
  const [isMovable, setIsMovable] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [containerNode, setContainerNode] = useState<HTMLElement | null>(null);

  const containerRef = useCallback(node => {
    setContainerNode(node);
  }, []);
  useLayoutEffect(() => {
    if (containerNode) {
      const size = containerNode.getBoundingClientRect();
      setContainerSize({ width: size.width, height: size.height });
    }
  }, [containerNode]);
  useLayoutEffect(() => {
    if (containerNode) {
      setTranslateValue(containerNode, -index * containerSize.width);
    }
  }, [containerNode, index, containerSize]);
  const handleTouchEnd = useCallback(() => {
    setIsMovable(false);
    if (!containerNode) return;
    (containerNode.style.transition as any) = null;
    const originalOffset = -index * containerSize.width;
    const offset = getTranslateValue(containerNode);
    requestAnimationFrame(() => {
      if (offset - originalOffset < -SWIPE_TRIGGER && onChange && index < images.length - 1) {
        onChange(index + 1);
      } else if (offset - originalOffset > SWIPE_TRIGGER && onChange && index > 0) {
        onChange(index - 1);
      } else {
        setTranslateValue(containerNode, originalOffset);
      }
    });
  }, [onChange, containerNode, index, images, containerSize, setIsMovable]);
  const handleMove = useCallback(
    e => {
      if (e.persist) {
        e.persist();
      }
      if (containerNode) {
        containerNode.style.transition = 'none';
      }
      if (isMovable) {
        window.requestAnimationFrame(() => {
          if (containerNode) {
            const oldOffsetX = getTranslateValue(containerNode);
            setTranslateValue(containerNode, oldOffsetX + Math.floor(e.deltaX));
          }
        });
      }
    },
    [containerNode, isMovable],
  );
  const handleImageMove = useCallback(
    (galleryIsMovable: boolean) => {
      setIsMovable(galleryIsMovable);
    },
    [setIsMovable],
  );
  const handleMouseEvents = useMouseEvents(handleMove, handleTouchEnd);
  return (
    <Portal open={isOpen}>
      <div className="image-slides-view-port" aria-roledescription="carousel">
        {index > 0 && showPageButton ? (
          <button
            type="button"
            className="image-slides-page-button image-slides-prev"
            onClick={() => onChange(index - 1)}>
            <svg
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="30px"
              height="30px"
              viewBox="0 0 24 24">
              <path
                stroke="#eee"
                fill="#eee"
                d="M15.41,16.59L10.83,12l4.58-4.59L14,6l-6,6l6,6L15.41,16.59z"
              />
            </svg>
          </button>
        ) : null}
        {index < images.length - 1 && showPageButton ? (
          <button
            type="button"
            className="image-slides-page-button image-slides-next"
            onClick={() => onChange(index + 1)}>
            <svg
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="30px"
              height="30px"
              viewBox="0 0 24 24">
              <path
                stroke="#eee"
                fill="#eee"
                d="M8.59,16.59L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.59z"
              />
            </svg>
          </button>
        ) : null}
        <AlloyFinger onTouchEnd={handleTouchEnd} onPressMove={handleMove}>
          <ul
            className="image-slides-container"
            ref={containerRef}
            onMouseDown={handleMouseEvents[0]}
            onMouseMove={handleMouseEvents[1]}
            onMouseUp={handleMouseEvents[2]}
            // onClick={tapClose ? this.handleCloseViewer : undefined}>
          >
            {index > 0 ? (
              <ImageController
                isMovable={!isMovable}
                containerSize={containerSize}
                index={index - 1}
                key={index - 1}
                onMove={handleImageMove}>
                <img className="image-slides-content" src={images[index - 1]} alt="" />
              </ImageController>
            ) : null}
            <ImageController
              isMovable={!isMovable}
              containerSize={containerSize}
              index={index}
              key={index}
              onMove={handleImageMove}>
              <img className="image-slides-content" src={images[index]} alt="" />
            </ImageController>
            {index < images.length - 1 ? (
              <ImageController
                isMovable={!isMovable}
                containerSize={containerSize}
                index={index + 1}
                key={index + 1}
                onMove={handleImageMove}>
                <img className="image-slides-content" src={images[index + 1]} alt="" />
              </ImageController>
            ) : null}
          </ul>
        </AlloyFinger>
      </div>
    </Portal>
  );
}
