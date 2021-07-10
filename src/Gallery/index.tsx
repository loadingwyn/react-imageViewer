/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { ReactNode, useCallback, useLayoutEffect, useState } from 'react';
import AlloyFinger from 'alloyfinger/react/AlloyFinger';
import ImageController, { GAP_WIDTH } from '../ImageController';
import { Portal } from '../Overlay';
import { ownerWindow } from '../utils/disableScrolling';
import './style.css';
import useMouseEvents from '../utils/useMouseEvents';

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
  loadingIcon?: ReactNode;
  onClose?: (index: number) => any;
  onChange: (index: number) => any;
}

export default function Gallery({ isOpen, images, index, loadingIcon, onChange }: GalleryProps) {
  const [isMovable, setIsMovable] = useState(false);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [containerNode, setContainerNode] = useState<HTMLElement | null>(null);

  const containerRef = useCallback(node => {
    setContainerNode(node);
  }, []);
  useLayoutEffect(() => {
    if (containerNode) {
      const size = containerNode.getBoundingClientRect();
      setContainerSize(size);
    }
  }, [containerNode]);
  useLayoutEffect(() => {
    if (containerNode) {
      setTranslateValue(containerNode, -index * (containerSize.width + GAP_WIDTH));
    }
  }, [containerNode, index, containerSize]);
  const handleTouchEnd = useCallback(() => {
    setIsMovable(false);
    if (!containerNode) return;
    (containerNode.style.transition as any) = null;
    const originalOffset = -index * (containerSize.width + GAP_WIDTH);
    const offset = getTranslateValue(containerNode);
    requestAnimationFrame(() => {
      const maxOffset = Math.min(containerSize.width * 0.2, 200);
      if (offset - originalOffset < -maxOffset && onChange && index < images.length - 1) {
        onChange(index + 1);
      } else if (offset - originalOffset > maxOffset && onChange && index > 0) {
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
        <AlloyFinger onTouchEnd={handleTouchEnd} onPressMove={handleMove}>
          <ul
            className="image-slides-gallery"
            ref={containerRef}
            onMouseDown={handleMouseEvents[0]}
            onMouseMove={handleMouseEvents[1]}
            onMouseUp={handleMouseEvents[2]}
            onMouseLeave={handleMouseEvents[2]}>
            {index > 0 ? (
              <ImageController
                containerSize={containerSize}
                isMovable={!isMovable}
                index={index - 1}
                key={index - 1}
                loadingIcon={loadingIcon}
                onMove={handleImageMove}
                url={images[index - 1]}>
                <img className="image-slides-content" src={images[index - 1]} alt="" />
              </ImageController>
            ) : null}
            <ImageController
              containerSize={containerSize}
              isMovable={!isMovable}
              index={index}
              key={index}
              loadingIcon={loadingIcon}
              onMove={handleImageMove}
              url={images[index]}>
              <img className="image-slides-content" src={images[index]} alt="" />
            </ImageController>
            {index < images.length - 1 ? (
              <ImageController
                containerSize={containerSize}
                isMovable={!isMovable}
                index={index + 1}
                key={index + 1}
                loadingIcon={loadingIcon}
                onMove={handleImageMove}
                url={images[index + 1]}>
                <img className="image-slides-content" src={images[index + 1]} alt="" />
              </ImageController>
            ) : null}
          </ul>
        </AlloyFinger>
      </div>
    </Portal>
  );
}
