import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  cloneElement,
  forwardRef,
  ReactElement,
  KeyboardEvent,
  SyntheticEvent,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react';
import createChainedFunction from '../utils/createChainedFunction';
import './style.css';
import { getPaddingRight, getScrollbarSize, isOverflowing } from '../utils/disableScrolling';
import useEnhancedEffect from '../utils/useEnhancedEffect';
import useEventCallback from '../utils/useEventCallback';
import useForkRef from '../utils/useForkRef';
import ownerWindow from '../utils/ownerWindow';
import ownerDocument from '../utils/ownerDocument';

function ariaHidden(element: Element, show: boolean): void {
  if (show) {
    element.setAttribute('aria-hidden', 'true');
  } else {
    element.removeAttribute('aria-hidden');
  }
}
export interface RenderModalDialogProps {
  style: React.CSSProperties | undefined;
  className: string | undefined;
  tabIndex: number;
  role: string;
  ref: React.RefCallback<Element>;
  'aria-modal': boolean | undefined;
}

export interface RenderModalBackdropProps {
  ref: React.RefCallback<Element>;
  onClick: (event: React.SyntheticEvent) => void;
}
export interface PortalProps {
  onEnter?(node: HTMLElement, isAppearing: boolean): any;
  onExited?(node: HTMLElement): any;
  children: ReactElement;
  backdrop?: ReactElement;
  role?: string;
  style?: React.CSSProperties;
  className?: string;
  disablePortal?: boolean;
  disableEscapeKeyDown?: boolean;
  open: boolean;
  container?: HTMLElement;
  keepMounted?: boolean;
  onOpen?: () => void;
  onClose?: (e: SyntheticEvent, reason: string) => void;
  onHide?: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  hideBackdrop?: boolean;
  onBackdropClick?: (e: React.SyntheticEvent) => void;
  containerClassName?: string;
  closeAfterTransition?: boolean;
  keyboard?: boolean;
  // transition?: ModalTransitionComponent;
  // backdropTransition?: ModalTransitionComponent;
}

export const Portal = forwardRef(
  (
    {
      backdrop,
      children,
      container = document.body,
      disablePortal,
      disableEscapeKeyDown,
      hideBackdrop,
      keepMounted,
      onBackdropClick,
      onOpen,
      onClose,
      onExited,
      onEnter,
      onKeyDown,
      open = false,
      closeAfterTransition,
    }: PortalProps,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const [exited, setExited] = useState(true);
    const [originalProperties, setOriginalProperties] = useState([] as any[]);
    const [mountNode, setMountNode] = useState<HTMLElement>();
    const modalRef = useRef<HTMLDivElement>(null);
    const handleModalRef = useForkRef(modalRef, ref);
    const hasTransition = Object.prototype.hasOwnProperty.call(children.props, 'in');

    const handleMounted = useCallback(() => {
      if (onOpen) {
        onOpen();
      }

      if (isOverflowing(container)) {
        // Compute the size before applying overflow hidden to avoid any scroll jumps.
        const scrollbarSize = getScrollbarSize(ownerDocument(container));
        setOriginalProperties(prevState => [
          ...prevState,
          [container, 'padding-right', container?.style.paddingRight],
        ]);
        // Use computed style, here to get the real padding to add our scrollbar width.
        container.style.paddingRight = `${getPaddingRight(container) + scrollbarSize}px`;
      }

      setOriginalProperties(prevState => [
        ...prevState,
        [container, 'touch-action', container?.style.touchAction],
      ]);
      container.style.touchAction = 'none';
      // Block the scroll even if no scrollbar is visible to account for mobile keyboard
      // screensize shrink.
      const parent = container.parentElement;
      const containerWindow = ownerWindow(container);
      const scrollContainer =
        parent?.nodeName === 'HTML' &&
        containerWindow.getComputedStyle(parent).overflowY === 'scroll'
          ? parent
          : container;
      setOriginalProperties(prevState => [
        ...prevState,
        [scrollContainer, 'overflow', scrollContainer.style.overflow],
      ]);
      scrollContainer.style.overflow = 'hidden';
      if (modalRef?.current) {
        // Fix a bug on Chrome where the scroll isn't initially 0.
        modalRef.current.scrollTop = 0;
      }
    }, [onOpen, modalRef, container]);
    const handleClose = useEventCallback(() => {
      if (!open) {
        originalProperties.forEach(([el, property, value]) => {
          if (value) {
            el.style.setProperty(property, value);
          } else {
            el.style.removeProperty(property);
          }
          setOriginalProperties([]);
        });
      }
    }, [originalProperties]);
    const handlePortalRef = useCallback(
      node => {
        if (!node) {
          return;
        }
        if (open) {
          handleMounted();
        } else if (modalRef.current) {
          ariaHidden(modalRef.current, true);
        }
      },
      [open, handleMounted],
    );
    useEffect(() => {
      if (open) {
        handleMounted();
      } else if (!hasTransition || !closeAfterTransition) {
        handleClose();
      }
    }, [handleMounted, handleClose, closeAfterTransition, hasTransition, open]);
    useEnhancedEffect(() => {
      if (mountNode && !disablePortal) {
        handlePortalRef(mountNode);
        return () => {
          handleClose();
          handlePortalRef(null);
        };
      }
      return undefined;
    }, [handlePortalRef, mountNode, disablePortal]);
    useEnhancedEffect(() => {
      if (!disablePortal) {
        setMountNode(container || document.body);
      }
    }, [container, disablePortal]);

    if (!keepMounted && !open && (!hasTransition || exited)) {
      return null;
    }

    const handleEnter = (node: HTMLElement, isAppearing: boolean) => {
      setExited(false);

      if (onEnter) {
        onEnter(node, isAppearing);
      }
    };

    const handleExited = (node: HTMLElement) => {
      setExited(true);

      if (onExited) {
        onExited(node);
      }
      if (closeAfterTransition) {
        handleClose();
      }
    };

    const handleBackdropClick = (event: SyntheticEvent) => {
      if (event.target !== event.currentTarget) {
        return;
      }

      if (onBackdropClick) {
        onBackdropClick(event);
      }

      if (onClose) {
        onClose(event, 'backdropClick');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (onKeyDown) {
        onKeyDown(event);
      }

      // The handler doesn't take event.defaultPrevented into account:
      //
      // event.preventDefault() is meant to stop default behaviors like
      // clicking a checkbox to check it, hitting a button to submit a form,
      // and hitting left arrow to move the cursor in a text input etc.
      // Only special HTML elements have these default behaviors.
      if (event.key !== 'Escape') {
        return;
      }

      if (!disableEscapeKeyDown) {
        // Swallow the event, in case someone is listening for the escape key on the body.
        event.stopPropagation();

        if (onClose) {
          onClose(event, 'escapeKeyDown');
        }
      }
    };

    const childProps = {} as any;

    if (children.props.tabIndex === undefined) {
      childProps.tabIndex = children.props.tabIndex || '-1';
    }
    if (hasTransition) {
      childProps.onEnter = createChainedFunction(handleEnter, children.props.onEnter);
      childProps.onExited = createChainedFunction(handleExited, children.props.onExited);
    }
    const content = (
      <div
        ref={handleModalRef}
        onKeyDown={handleKeyDown}
        role="presentation"
        className="react-image-viewer-portal">
        {!hideBackdrop && backdrop
          ? cloneElement(backdrop, {
              onClick: handleBackdropClick,
              ref: disablePortal ? handlePortalRef : null,
            })
          : null}
        {cloneElement(children, childProps)}
      </div>
    );

    if (disablePortal) {
      return content;
    }
    return mountNode ? createPortal(content, mountNode) : null;
  },
);

Portal.displayName = 'Portal';
export default Portal;
