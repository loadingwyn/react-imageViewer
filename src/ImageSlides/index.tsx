import React, { PureComponent, ReactNode } from 'react';
import transform from 'css3transform';
import AlloyFinger from 'alloyfinger/react/AlloyFinger';
import ImageController, { TransformedElement } from '../ImageController';
import Overlay from '../Overlay';
import './style.css';

const GUTTER_WIDTH = 10;
const SWIPE_TRIGGER = 40;

function preload(url: string): Promise<any> | null {
  if (url) {
    const loader = new Image();
    return new Promise((resolve, reject) => {
      loader.onload = resolve;
      loader.onerror = reject;
      loader.src = url;
    }).catch(e => e);
  }
  return null;
}
type Operations = {
  close: (e?: MouseEvent | TouchEvent) => void;
  next: () => void;
  prev: () => void;
};
interface SlidesProps {
  images: string[];
  index: number;
  isOpen: boolean;
  showPageButton: boolean;
  tapClose: boolean;
  loadingIcon?: ReactNode;
  addon?: (index: number, operations: Operations) => ReactNode;
  onClose?: (e: MouseEvent | TouchEvent, index: number) => void;
  onChange?: (index: number) => void;
}

interface SlidesStates {
  index: number;
  focused: boolean;
  isOpen: boolean;
  prevIsOpen: boolean;
  prevIndex: number;
}

export default class ImageSlides extends PureComponent<SlidesProps, SlidesStates> {
  static defaultProps = {
    images: [],
    index: 0,
    showPageButton: false,
    tapClose: true,
    isOpen: false,
  };
  lastContainerOffsetX = 0;

  initialStyle = {};

  imageController = {};

  containerEl: TransformedElement | null = null;

  containerOffsetX = 0;

  constructor(props: Readonly<SlidesProps>) {
    super(props);
    const { index, isOpen } = props;
    this.state = {
      index,
      focused: false,
      isOpen,
      prevIsOpen: false,
      prevIndex: 0,
    };
  }

  componentDidMount() {
    const { images } = this.props;
    const { index } = this.state;
    preload(images[index]);
    preload(images[index + 1]);
    preload(images[index - 1]);
  }

  static getDerivedStateFromProps(props: SlidesProps, state: SlidesStates) {
    let newState: Partial<SlidesStates> | null = null;

    if (props.index !== state.prevIndex) {
      newState = {};
      newState.prevIndex = props.index;
      newState.index = props.index;
    }
    if (props.isOpen !== state.prevIsOpen) {
      if (!newState) {
        newState = {};
      }
      newState.prevIsOpen = props.isOpen;
      newState.isOpen = props.isOpen;
    }
    return newState;
  }

  getContainer = (el: HTMLElement | null) => {
    if (el) {
      transform(el);
      this.containerEl = el as TransformedElement;
    }
  };

  getControl = () => {
    const { focused } = this.state;
    if (!focused) {
      this.setState({
        focused: true,
      });
    }
  };

  handleContainerMove = (e: any) => {
    e.persist();
    window.requestAnimationFrame(this.move(e));
    e.preventDefault();
    e.stopPropagation();
    if (e.changedTouches[0].pageX > window.innerWidth || e.changedTouches[0].pageX < 0) {
      this.handleTouchEnd(e);
    }
  };

  move = (e: any) => () => {
    if (!this.containerEl) return;
    const { focused } = this.state;
    if (focused) {
      this.containerEl.translateX += Math.floor(e.deltaX);
    }
  };

  handleTouchEnd = (e: any) => {
    e.preventDefault();
    if (!this.containerEl) return;
    const { focused, index } = this.state;
    if (focused) {
      const { onChange, images } = this.props;
      const boardWidth = GUTTER_WIDTH + window.innerWidth;
      const baseline = boardWidth * this.getMedianIndex();
      if (-this.containerEl.translateX - baseline > SWIPE_TRIGGER) {
        const step = this.transition(160, 'next');
        if (onChange && index < images.length - 1) {
          onChange(index + 1);
        }
        window.requestAnimationFrame(step);
      } else if (baseline + this.containerEl.translateX > SWIPE_TRIGGER) {
        const step = this.transition(160, 'prev');
        if (onChange && index > 0) {
          onChange(index - 1);
        }
        window.requestAnimationFrame(step);
      } else {
        const step = this.transition(160, 'noMove');
        window.requestAnimationFrame(step);
      }
      this.setState({
        focused: false,
      });
    }
  };

  transition(time: number, direction: 'prev' | 'next' | 'noMove') {
    if (!this.containerEl) return () => null;
    const { index } = this.state;
    const { images } = this.props;
    const boardWidth = GUTTER_WIDTH + window.innerWidth;
    let startTime: number;
    const startPos = this.containerEl.translateX;
    const size =
      (index === 0 && direction === 'prev') ||
      (index === images.length - 1 && direction === 'next') ||
      direction === 'noMove'
        ? 0
        : 1;
    const step = (timestamp: number) => {
      if (!this.containerEl) return;
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      this.containerEl.translateX = Math.floor(
        startPos +
          (progress / time) *
            (-boardWidth * (this.getMedianIndex() + (direction === 'next' ? size : -size)) -
              startPos),
      );
      if (progress < time) {
        window.requestAnimationFrame(step);
      } else if (direction === 'next') {
        this.next();
      } else if (direction === 'prev') {
        this.prev();
      } else {
        this.updatePosition();
      }
    };
    return step;
  }

  getMedianIndex() {
    const { index } = this.state;
    const { images } = this.props;
    const displayMax = index + 2 > images.length ? images.length : index + 2;
    const displayMin = index - 1 < 0 ? 0 : index - 1;
    let center = Math.floor((displayMax - displayMin) / 2);
    if (index < 1) {
      center = index;
    } else if (index > images.length - 2) {
      center = images.length - index;
    }
    return center;
  }

  updatePosition = () => {
    if (!this.containerEl) return;
    this.containerEl.translateX = -(GUTTER_WIDTH + window.innerWidth) * this.getMedianIndex();
  };

  next = () => {
    const { index } = this.state;
    const { images } = this.props;
    if (index < images.length - 1) {
      preload(images[index + 2]);
      this.setState(
        {
          index: index + 1,
        },
        this.updatePosition,
      );
    } else {
      this.updatePosition();
    }
  };

  prev = () => {
    const { index } = this.state;
    const { images } = this.props;
    if (index > 0) {
      preload(images[index - 2]);
      this.setState(
        {
          index: index - 1,
        },
        this.updatePosition,
      );
    } else {
      this.updatePosition();
    }
  };

  handleCloseViewer = (e: MouseEvent) => {
    const { index } = this.state;
    const { onClose } = this.props;
    this.setState({
      isOpen: false,
    });
    if (onClose) onClose(e, index);
  };

  render() {
    const { index, isOpen, focused } = this.state;
    const { images, addon, tapClose, loadingIcon, showPageButton } = this.props;
    const displayMax = index + 2 > images.length ? images.length : index + 2;
    const displayMin = index - 1 < 0 ? 0 : index - 1;
    return isOpen ? (
      <Overlay>
        <div className="image-slides-view-port">
          {addon &&
            addon(index, {
              close: this.handleCloseViewer,
              next: this.next,
              prev: this.prev,
            } as Operations)}
          {index > 0 && showPageButton ? (
            <button className="image-slides-page-button image-slides-prev" onClick={this.prev}>
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
                  d="M15.41,16.59L10.83,12l4.58-4.59L14,6l-6,6l6,6L15.41,16.59z"/>
              </svg>
            </button>
          ) : null}
          {index < images.length - 1 && showPageButton ? (
            <button className="image-slides-page-button image-slides-next" onClick={this.next}>
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
                  d="M8.59,16.59L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.59z"/>
              </svg>
            </button>
          ) : null}
          <AlloyFinger
            // onSwipe={this.handleSwipe}
            onSingleTap={tapClose || this.handleCloseViewer}
            onTouchEnd={this.handleTouchEnd}
            onPressMove={this.handleContainerMove}>
            <div className="image-slides-container" ref={this.getContainer}>
              {images.slice(displayMin, displayMax).map((url, ind) => (
                /* eslint-disable */
                <ImageController
                  containerFocused={focused}
                  loadingIcon={loadingIcon}
                  onExceedLimit={this.getControl}
                  url={url}
                  key={url + (ind + displayMin)}
                  presented={ind === this.getMedianIndex()}
                />
              ))}
            </div>
          </AlloyFinger>
        </div>
      </Overlay>
    ) : null;
  }
}
