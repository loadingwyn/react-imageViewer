/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, {
  cloneElement,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import AlloyFinger from 'alloyfinger/react/AlloyFinger';
import {
  getScale,
  identity,
  matrixArrayToCssMatrix,
  multiplyArrayOfMatrices,
  scaleMatrix,
  translateMatrix,
} from '../utils/transform';
import useMouseEvents from '../utils/useMouseEvents';
import fitToViewport from '../utils/fitToViewport';

export interface ContainerRect {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export interface ControllerProps {
  containerRect: ContainerRect;
  index: number;
  isMovable: boolean;
  onMove: (isMovable: boolean) => void;
  imageRenderer?: (
    url: string,
    index: number,
    containerRect: ContainerRect,
    imageSize: { width: number; height: number },
  ) => ReactElement;
  loadingIcon?: ReactNode;
  url?: string;
}

export const GAP_WIDTH = 10;
export const defaultLoadingIcon = (
  <div className="image-slides-loading">
    <div />
    <div />
    <div />
    <div />
    <div />
  </div>
);
export function defaultImageRenderer(
  url: string,
  index: number,
  containerRect: ContainerRect,
  imageSize: { width: number; height: number },
): ReactElement {
  const style = fitToViewport(imageSize, containerRect);
  return <img className="image-slides-content" src={url} alt="" style={style} />;
}
export default function ImageController({
  containerRect,
  index,
  isMovable,
  onMove,
  imageRenderer = defaultImageRenderer,
  loadingIcon = defaultLoadingIcon,
  url = '',
}: ControllerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const imageContainerRef = useRef<HTMLLIElement>(null);
  const imageRef = useRef<HTMLElement>(null);
  const transformRef = useRef(identity());
  const scaleRef = useRef(1);
  useLayoutEffect(() => {
    if (imageRef?.current) {
      imageRef.current.style.transform = matrixArrayToCssMatrix(transformRef.current);
    }
  }, [imageContainerRef, transformRef]);
  useEffect(() => {
    if (url) {
      const loader = new Image();
      const imagePromise = new Promise((resolve, reject) => {
        loader.onload = resolve;
        loader.onerror = reject;
        loader.src = url;
      }).catch(e => e);
      imagePromise
        .then(() => {
          setImageSize({ width: loader.naturalWidth, height: loader.naturalHeight });
        })
        .finally(() => {
          setIsLoaded(true);
        });
    } else {
      setIsLoaded(true);
    }
  }, [url]);
  const scaleImage = useCallback(
    (center: { x: number; y: number }, scale) => {
      if (!imageRef?.current) {
        return;
      }
      onMove(false);
      const imageElement = imageRef.current;
      const matrix = transformRef.current;
      const cr = imageElement.getBoundingClientRect();
      const { left, right, top, bottom } = imageElement.getBoundingClientRect();
      const newOriginRelativeX = Math.min(Math.max(center.x, left), right) - cr.left;
      const newOriginRelativeY = Math.min(Math.max(center.y, top), bottom) - cr.top;
      const oldTranslate = [matrix[12], matrix[13], matrix[14]];
      const newOriginAbsoluteX = newOriginRelativeX + oldTranslate[0];
      const newOriginAbsoluteY = newOriginRelativeY + oldTranslate[1];
      transformRef.current = multiplyArrayOfMatrices([
        scaleMatrix(scale, scale, 1),
        translateMatrix(
          newOriginAbsoluteX * (1 / scale - 1),
          newOriginAbsoluteY * (1 / scale - 1),
          0,
        ),
        matrix,
      ]);
      imageRef.current.style.transform = matrixArrayToCssMatrix(transformRef.current);
    },
    [imageRef, transformRef, onMove],
  );
  const handleDoubleTap = useCallback(
    e => {
      if (!imageRef?.current) {
        return;
      }
      const matrix = transformRef.current;
      const imageElement = imageRef.current;
      const cr = imageElement.getBoundingClientRect();
      const oldScale = getScale(matrix)[0];
      const maxScale = Math.max(
        (containerRect.width / cr.width) * 0.75,
        (containerRect.height / cr.height) * 0.75,
        5,
      );
      const newScale = Math.min(1.5, maxScale / oldScale);
      if (oldScale >= maxScale - 0.0001) {
        transformRef.current = identity();
        imageRef.current.style.transform = matrixArrayToCssMatrix(transformRef.current);
        return;
      }
      scaleImage({ x: e.origin[0], y: e.origin[1] }, newScale);
    },
    [scaleImage, containerRect],
  );
  const handlePressMove = useCallback(
    e => {
      if (!isMovable) {
        return;
      }
      if (!isLoaded) {
        onMove(true);
        return;
      }
      if (!imageRef?.current) {
        return;
      }
      const imageElement = imageRef.current;
      const matrix = transformRef.current;
      const { left, right, top, bottom, width, height } = imageElement.getBoundingClientRect();
      const {
        width: containerWidth,
        height: containerHeight,
        top: containerTop,
        left: containerLeft,
      } = containerRect;
      const { deltaX, deltaY } = e;
      const offsetX = left + width / 2 - containerLeft - containerWidth / 2;
      const offsetY = top + height / 2 - containerTop - containerHeight / 2;
      const isMovableByX =
        (deltaX > 0 && (offsetX < 0 || left < 0)) ||
        (deltaX < 0 && (offsetX > 0 || right > containerWidth));
      const isMovableByY =
        (deltaY > 0 && (offsetY < 0 || top < 0)) ||
        (deltaY < 0 && (offsetY > 0 || bottom > containerHeight));
      const shiftX =
        deltaX > 0
          ? Math.min(deltaX, Math.max(-left, -offsetX))
          : Math.max(deltaX, Math.min(containerWidth - right, -offsetX));
      let shiftY =
        deltaY > 0
          ? Math.min(deltaY, Math.max(-top, -offsetY))
          : Math.max(deltaY, Math.min(containerHeight - bottom, -offsetY));
      if (!isMovableByX && deltaX !== 0) {
        if (Math.abs(deltaY) < (isMovableByY ? 2 : 20)) {
          // optimization for looooong pictures
          onMove(true);
        } else {
          shiftY = 0;
        }
      }
      if (!isMovableByX && !isMovableByY) {
        return;
      }
      transformRef.current = multiplyArrayOfMatrices([
        translateMatrix(isMovableByX ? shiftX : 0, isMovableByY ? shiftY : 0, 0),
        matrix,
      ]);
      imageRef.current.style.transform = matrixArrayToCssMatrix(transformRef.current);
    },
    [isLoaded, containerRect, imageRef, onMove, isMovable],
  );
  const handleMultipointStart = useCallback(
    e => {
      if (!imageRef?.current || scaleRef.current == null) {
        return;
      }
      const matrix = transformRef.current;
      const oldScale = getScale(matrix)[0];
      scaleRef.current = oldScale;
    },
    [scaleRef, transformRef],
  );
  const handlePinch = useCallback(
    e => {
      if (!imageRef?.current || scaleRef.current == null) {
        return;
      }
      const matrix = transformRef.current;
      const imageElement = imageRef.current;
      const cr = imageElement.getBoundingClientRect();
      const oldScale = getScale(matrix)[0];
      const touchCenterX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
      const touchCenterY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
      const maxScale = Math.max(
        (containerRect.width / cr.width) * 0.75,
        (containerRect.height / cr.height) * 0.75,
        5,
      );
      const newScale = Math.max(
        Math.min((e.scale * scaleRef.current) / oldScale, maxScale / oldScale),
        1 / oldScale,
      );
      if (oldScale * newScale <= 1) {
        transformRef.current = identity();
        imageRef.current.style.transform = matrixArrayToCssMatrix(transformRef.current);
        return;
      }
      scaleImage({ x: touchCenterX, y: touchCenterY }, newScale);
    },
    [scaleImage, containerRect, scaleRef],
  );
  const handleDoubleClick = useCallback(
    e => {
      e.origin = [e.clientX, e.clientY];
      handleDoubleTap(e);
    },
    [handleDoubleTap],
  );
  const content = imageRenderer(url, index, containerRect, imageSize);
  const imageContent = cloneElement(content, {
    ref: imageRef,
  });
  const handleMouseEvents = useMouseEvents(handlePressMove);
  return (
    <AlloyFinger
      onPinch={handlePinch}
      onDoubleTap={handleDoubleTap}
      onPressMove={handlePressMove}
      onMultipointStart={handleMultipointStart}>
      <li
        style={{ left: (GAP_WIDTH + containerRect.width) * index }}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseEvents[0]}
        onMouseMove={handleMouseEvents[1]}
        onMouseUp={handleMouseEvents[2]}
        onMouseLeave={handleMouseEvents[2]}
        className="image-slides-blackboard"
        ref={imageContainerRef}>
        {isLoaded ? imageContent : loadingIcon}
      </li>
    </AlloyFinger>
  );
}
