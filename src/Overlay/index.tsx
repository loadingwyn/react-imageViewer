import * as React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import './style.css';

let originalBodyOverflow: string | null = null;

function preventDefault(e: Event) {
  e.preventDefault();
}
interface OverlayProps {
  /**
   * The children to render into the `container`.
   */
  children?: React.ReactNode;
  /**
   * An HTML element or function that returns one.
   * The `container` will have the portal children appended to it.
   *
   * By default, it uses the body of the top-level document object,
   * so it's simply `document.body` most of the time.
   */
  container?: Element | (() => Element | null) | null;
  className?: string;
}

const Overlay: React.FC<OverlayProps> = (
  {
    children,
    container,
    className
  }
) => {
    const {
    BackdropComponent,
    BackdropProps,
    children,
    classes: classesProp,
    className,
    closeAfterTransition = false,
    component = 'div',
    components = {},
    componentsProps = {},
    container,
    disableAutoFocus = false,
    disableEnforceFocus = false,
    disableEscapeKeyDown = false,
    disablePortal = false,
    disableRestoreFocus = false,
    disableScrollLock = false,
    hideBackdrop = false,
    keepMounted = false,
    // private
    // eslint-disable-next-line react/prop-types
    manager = defaultManager,
    onBackdropClick,
    onClose,
    onKeyDown,
    open,
    /* eslint-disable react/prop-types */
    theme,
    onTransitionEnter,
    onTransitionExited,
    ...other
  } = props;

  const [exited, setExited] = React.useState(true);
  const modal = React.useRef({});
  const mountNodeRef = React.useRef(null);
  const modalRef = React.useRef(null);
  const handleRef = useForkRef(modalRef, ref);

  const getDoc = () => ownerDocument(mountNodeRef.current);
  const getModal = () => {
    modal.current.modalRef = modalRef.current;
    modal.current.mountNode = mountNodeRef.current;
    return modal.current;
  };

  const handleMounted = () => {
    // Fix a bug on Chrome where the scroll isn't initially 0.
    modalRef.current.scrollTop = 0;
  };

  const handleOpen = useEventCallback(() => {
    manager.add(getModal(), resolvedContainer);

    // The element was already mounted.
    if (modalRef.current) {
      handleMounted();
    }
  });

  const isTopModal = React.useCallback(() => manager.isTopModal(getModal()), [manager]);

  const handleClose = React.useCallback(() => {
    manager.remove(getModal());
  }, [manager]);

  if (!keepMounted && !open && (exited)) {
    return null;
  }

  const handleEnter = () => {
    setExited(false);

    if (onTransitionEnter) {
      onTransitionEnter();
    }
  };

  const handleExited = () => {
    setExited(true);

    if (onTransitionExited) {
      onTransitionExited();
    }

    if (closeAfterTransition) {
      handleClose();
    }
  };

  const handleBackdropClick = (event) => {
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

  const handleKeyDown = (event) => {
    if (onKeyDown) {
      onKeyDown(event);
    }

    // The handler doesn't take event.defaultPrevented into account:
    //
    // event.preventDefault() is meant to stop default behaviors like
    // clicking a checkbox to check it, hitting a button to submit a form,
    // and hitting left arrow to move the cursor in a text input etc.
    // Only special HTML elements have these default behaviors.
    if (event.key !== 'Escape' || !isTopModal()) {
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

  const childProps = {};
  if (children.props.tabIndex === undefined) {
    childProps.tabIndex = children.props.tabIndex || '-1';
  }

  // It's a Transition like component
  if (hasTransition) {
    childProps.onEnter = createChainedFunction(handleEnter, children.props.onEnter);
    childProps.onExited = createChainedFunction(handleExited, children.props.onExited);
  }

  const Root = components.Root || component;
  const rootProps = componentsProps.root || {};

      {/*
       * Marking an element with the role presentation indicates to assistive technology
       * that this element should be ignored; it exists to support the web application and
       * is not meant for humans to interact with directly.
       * https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-static-element-interactions.md
       */}
      <Root
        role="presentation"
        {...rootProps}
        {...(!isHostComponent(Root) && {
          as: component,
          styleProps: { ...styleProps, ...rootProps.styleProps },
          theme,
        })}
        {...other}
        ref={handleRef}
        onKeyDown={handleKeyDown}
        className={clsx(classes.root, rootProps.className, className)}
      >
        {!hideBackdrop && BackdropComponent ? (
          <BackdropComponent open={open} onClick={handleBackdropClick} {...BackdropProps} />
        ) : null}
        <TrapFocus
          disableEnforceFocus={disableEnforceFocus}
          disableAutoFocus={disableAutoFocus}
          disableRestoreFocus={disableRestoreFocus}
          getDoc={getDoc}
          isEnabled={isTopModal}
          open={open}
        >
          {React.cloneElement(children, childProps)}
        </TrapFocus>
      </Root>
  );
  return ReactDOM.createPortal(children, document.body);
  };

export default Overlay;
class Over {
  static defaultProps = {
    parentSelector() {
      return document.body;
    },
  static preventScrolling() {
    const { body } = document;
    originalBodyOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
  }

  static allowScrolling() {
    const { body } = document;
    body.style.overflow = originalBodyOverflow || '';
    originalBodyOverflow = null;
  }

  node = document.createElement('div');
  layer: HTMLDivElement | null = null;

  componentDidMount() {
    const { parentSelector } = this.props;
    Overlay.preventScrolling();
    const parent = parentSelector();
    parent.appendChild(this.node);
  }

  componentDidUpdate(prevProps: OverlayProps) {
    const { parentSelector } = this.props;
    const currentParent = parentSelector();
    const prevParent = prevProps.parentSelector();

    if (prevParent !== currentParent) {
      prevParent.removeChild(this.node);
      currentParent.appendChild(this.node);
    }
  }

  componentWillUnmount() {
    const { parentSelector } = this.props;
    document.body.classList.remove('image-slides-overlay-scrolling-preventer');
    const parent = parentSelector();
    if (!this.node) return;
    parent.removeChild(this.node);
    Overlay.allowScrolling();
  }

  getLayer = (el: HTMLDivElement) => {
    if (el) {
      this.layer = el;
      document.body.classList.add('image-slides-overlay-scrolling-preventer');
    }
  };

  render() {
    const { className, parentSelector, ...other } = this.props;
    return ReactDOM.createPortal(
      <div
        className={classNames('image-slides-overlay', className)}
        ref={this.getLayer}
        {...other}
      />,
      this.node,
    );
  }
}
