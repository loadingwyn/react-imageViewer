import { MouseEvent, MouseEventHandler, useCallback, useRef, useState } from 'react';

export default function useMouseEvents(
  onMove: (e: any) => void,
  onMouseUp?: (e: MouseEvent) => void,
): MouseEventHandler[] {
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const handleMouseMove = useCallback(
    e => {
      if (isMouseMoving) {
        e.deltaX = e.clientX - mousePositionRef.current.x;
        e.deltaY = e.clientY - mousePositionRef.current.y;
        mousePositionRef.current = { x: e.clientX, y: e.clientY };
        onMove(e);
      }
    },
    [mousePositionRef, onMove, isMouseMoving],
  );

  const handleMouseUp = useCallback(
    e => {
      if (onMouseUp) {
        onMouseUp(e);
      }
      setIsMouseMoving(false);
    },
    [setIsMouseMoving, onMouseUp],
  );
  return [
    useCallback(
      (e: MouseEvent) => {
        mousePositionRef.current = { x: e.clientX, y: e.clientY };
        setIsMouseMoving(true);
        e.preventDefault();
      },
      [setIsMouseMoving],
    ),
    handleMouseMove,
    handleMouseUp,
  ];
}
