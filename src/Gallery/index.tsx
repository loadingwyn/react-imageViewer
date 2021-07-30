/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, {
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  TouchEventHandler,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import AlloyFinger from 'alloyfinger/react/AlloyFinger';
import ImageController, { ContainerRect, GAP_WIDTH } from '../ImageController';
import { Portal } from '../Overlay';
import './style.css';
import useMouseEvents from '../utils/useMouseEvents';
import { getTranslateValue, setTranslateValue } from '../utils/translate';

export interface GalleryProps {
  images: string[];
  index: number;
  isOpen: boolean;
  onChange: (index: number) => void;
  imageRenderer?: (
    url: string,
    index: number,
    containerRect: ContainerRect,
    imageSize: { width: number; height: number },
  ) => ReactElement;
  loadingIcon?: ReactNode;
  onClick?: MouseEventHandler<HTMLUListElement>;
  onKeyPress?: KeyboardEventHandler<HTMLUListElement>;
  onSingleTap?: (event: TouchEvent) => void;
}

export default function Gallery({
  isOpen,
  images,
  index,
  onChange,
  imageRenderer,
  loadingIcon,
  onClick,
  onKeyPress,
  onSingleTap,
}: GalleryProps) {
  const [isMovable, setIsMovable] = useState(false);
  const [containerRect, setContainerRect] = useState<ContainerRect>({
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [containerNode, setContainerNode] = useState<HTMLElement | null>(null);

  const resizeObserverRef = useRef(
    new ResizeObserver(entires => {
      setContainerRect({ ...entires[0]?.contentRect });
    }),
  );
  const containerRef = useCallback(node => {
    setContainerNode(node);
  }, []);
  useLayoutEffect(() => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver(entires => {
      const { width, height, top, right, bottom, left } = entires[0]?.contentRect;
      setContainerRect({ width, height, top, right, bottom, left });
    });
  }, [setContainerRect]);
  useLayoutEffect(() => {
    resizeObserverRef.current?.disconnect();
    if (containerNode) {
      resizeObserverRef.current?.observe(containerNode);
    }
  }, [containerNode, resizeObserverRef]);
  useLayoutEffect(() => {
    if (containerNode) {
      setTranslateValue(containerNode, -index * (containerRect.width + GAP_WIDTH));
    }
  }, [containerNode, index, containerRect]);
  const handleTouchEnd = useCallback(() => {
    setIsMovable(false);
    if (!containerNode) return;
    (containerNode.style.transition as any) = null;
    const originalOffset = -index * (containerRect.width + GAP_WIDTH);
    const offset = getTranslateValue(containerNode);
    requestAnimationFrame(() => {
      const maxOffset = Math.min(containerRect.width * 0.2, 200);
      if (offset - originalOffset < -maxOffset && onChange && index < images.length - 1) {
        onChange(index + 1);
      } else if (offset - originalOffset > maxOffset && onChange && index > 0) {
        onChange(index - 1);
      } else {
        setTranslateValue(containerNode, originalOffset);
      }
    });
  }, [onChange, containerNode, index, images, containerRect, setIsMovable]);
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
        <AlloyFinger onTouchEnd={handleTouchEnd} onPressMove={handleMove} onSingleTap={onSingleTap}>
          <ul
            className="image-slides-gallery"
            ref={containerRef}
            onClick={onClick}
            onKeyPress={onKeyPress}
            onMouseDown={handleMouseEvents[0]}
            onMouseMove={handleMouseEvents[1]}
            onMouseUp={handleMouseEvents[2]}
            onMouseLeave={handleMouseEvents[2]}>
            {index > 0 ? (
              <ImageController
                containerRect={containerRect}
                isMovable={!isMovable}
                index={index - 1}
                imageRenderer={imageRenderer}
                key={index - 1}
                loadingIcon={loadingIcon}
                onMove={handleImageMove}
                url={images[index - 1]}
              />
            ) : null}
            <ImageController
              containerRect={containerRect}
              isMovable={!isMovable}
              index={index}
              imageRenderer={imageRenderer}
              key={index}
              loadingIcon={loadingIcon}
              onMove={handleImageMove}
              url={images[index]}
            />
            {index < images.length - 1 ? (
              <ImageController
                containerRect={containerRect}
                isMovable={!isMovable}
                index={index + 1}
                imageRenderer={imageRenderer}
                key={index + 1}
                loadingIcon={loadingIcon}
                onMove={handleImageMove}
                url={images[index + 1]}
              />
            ) : null}
          </ul>
        </AlloyFinger>
      </div>
    </Portal>
  );
}
