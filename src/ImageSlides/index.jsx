import React, { PureComponent } from 'react';
import AlloyFinger from 'alloyfinger';
import ImageControllerCreator from '../ImageControllerCreator';
import touchEmulator from '../utils/touchEmulator';
import resizeImage from '../utils/resizeImage';
import Overlay from '../Overlay';
import './style.css';

const GUTTER_WIDTH = 10;
export default class ImageSlides extends PureComponent {
  static defaultProps = {
    images: [],
    index: 0,
    isOpen: false,
  }
  state = {
    index: 0,
    loaded: {},
    isOpen: false,
  };

  lastContainerOffsetX = 0;
  initialStyle = {};
  imageController = {};

  componentWillMount() {
    const {
      index,
      images,
      isOpen,
    } = this.props;
    this.setState({
      index: index || this.state.index,
      isOpen,
    });
    this.preload(images[index || this.state.index]);
  }

  componentWillReceiveProps(newProps) {
    const {
      index,
      isOpen,
    } = this.props;
    const {
      index: newIndex,
      isOpen: newIsOpen,
    } = newProps;
    if (isOpen !== newIsOpen) {
      this.setState({
        isOpen: newIsOpen,
      });
    }
    if (newIndex && index !== newIndex) {
      this.setState({
        index: newIndex,
      });
    }
  }

  getContainer = el => {
    if (el) {
      const {
        useTouchEmulator,
      } = this.props;
      const gesturesManager = new AlloyFinger(el, {});
      this.containerEl = el;
      this.containerController = gesturesManager;
      const style = this.containerEl.style;
      if (useTouchEmulator) {
        touchEmulator(el);
      }
      gesturesManager.on('touchStart', () => {
        style.transition = '';
      });
      gesturesManager.on('pressMove', this.containerOnMove);
      gesturesManager.on('touchEnd', () => {
        const swipeTrigger = this.viewPortEl.clientWidth * 0.2;
        if (this.lastContainerOffsetX > swipeTrigger) {
          if (this.getMedianIndex() > 0 && this.state.index !== 1) {
            style.transform = `translate3d(${this.lastContainerOffsetX - ((GUTTER_WIDTH + this.viewPortEl.clientWidth) * 2)}px, 0, 0)`;
          } else if (this.state.index === 1) {
            style.transform = `translate3d(${this.lastContainerOffsetX - (GUTTER_WIDTH + this.viewPortEl.clientWidth)}px, 0, 0)`;
          }
          this.last();
        } else if (this.lastContainerOffsetX < -swipeTrigger) {
          style.transform = `translate3d(${this.lastContainerOffsetX}px, 0, 0)`;
          if (this.state.index === 0) {
            style.transition = 'all 0.3s';
          }
          this.next();
        }
        style.transition = 'all 0.3s';
        style.transform = `translate3d(${-(GUTTER_WIDTH + this.viewPortEl.clientWidth) * this.getMedianIndex()}px, 0, 0)`;
        this.lastContainerOffsetX = 0;
        this.isMoving = false;
      });
    }
  }

  getImageEl = el => {
    if (el) {
      this.gesturesHandler(el);
    }
  }

  getViewPort = el => {
    this.viewPortEl = el;
  }

  getMedianIndex() {
    const {
      index,
    } = this.state;
    const {
        images,
    } = this.props;
    const displayMax = ((index + 2) > images.length ? images.length : (index + 2));
    const displayMin = (index - 1) < 0 ? 0 : (index - 1);
    let center = parseInt((displayMax - displayMin) / 2, 10);
    if (index < 1) {
      center = index;
    } else if (index > images.length - 2) {
      center = images.length - index;
    }
    return center;
  }

  containerOnMove = offset => {
    this.isMoving = true;
    const deltaX = parseInt(offset.deltaX, 10);
    const style = this.containerEl ? this.containerEl.style : {};
    this.lastContainerOffsetX = deltaX + this.lastContainerOffsetX;
    const offsetX = this.lastContainerOffsetX
      - ((GUTTER_WIDTH + this.viewPortEl.clientWidth) * this.getMedianIndex());
    style.transform = `translate3d(${offsetX}px, 0, 0)`;
  };

  gesturesHandler(el) {
    const {
      useTouchEmulator,
    } = this.props;
    if (useTouchEmulator) {
      touchEmulator(el.parentElement);
    }
    const imageController = new ImageControllerCreator(
      el, {
        viewPortWidth: this.viewPortEl.clientWidth,
        viewPortHeight: this.viewPortEl.clientHeight,
        onGetControl: () => {
          if (this.containerController && !this.isMoving) {
            this.containerController.off('pressMove', this.containerOnMove);
          }
        },
        onLoseControl: () => {
          if (this.containerController && !this.isMoving) {
            this.containerController.on('pressMove', this.containerOnMove);
          }
        },
      },
    );
    const gesturesManager = new AlloyFinger(el.parentElement, {});
    gesturesManager.on(
      'pressMove',
      offset => {
        imageController.move(offset);
      },
    );
    gesturesManager.on(
      'pinch',
      event => {
        imageController.enlargeBytimes(event.zoom);
      },
    );
    gesturesManager.on(
      'doubleTap',
      () => {
        if (imageController.state.scale > 1) {
          imageController.reset();
        } else {
          imageController.enlargeBytimes(1.8);
          imageController.recordScale();
        }
      },
    );
    gesturesManager.on(
      'touchEnd',
      () => {
        imageController.recordScale();
      },
    );
  }

  next = () => {
    const {
      index,
    } = this.state;
    const {
        images,
    } = this.props;
    if (index < images.length - 1) {
      this.setState({
        index: index + 1,
      }, this.ignore);
      this.preload(images[index + 1]);
    }
  }

  last = () => {
    const {
      index,
    } = this.state;
    const {
        images,
    } = this.props;
    if (index > 0) {
      this.setState({
        index: index - 1,
      }, this.ignore);
      this.preload(images[index - 1]);
    }
  }

  ignore = () => {
    if (this.containerController) {
      this.containerController.off('pressMove', this.containerOnMove);
      this.containerController.on('pressMove', this.containerOnMove);
    }
  }

  preload(url) {
    if (url && !this.state.loaded[url]) {
      const loader = new Image();
      new Promise((resolve, reject) => {
        loader.onload = resolve;
        loader.onerror = reject;
        loader.src = url;
      }).then(() => {
        this.initialStyle[url] = resizeImage(loader.width, loader.height);
        this.setState({
          loaded: {
            ...this.state.loaded,
            [url]: true,
          },
        });
      });
    }
  }

  onCloseViewer = event => {
    const {
      index,
    } = this.state;
    const {
      onClose,
    } = this.props;
    this.setState({
      isOpen: false,
    });
    onClose(event, index);
  }

  render() {
    const {
      loaded,
      index,
      isOpen,
    } = this.state;
    const {
      images,
    } = this.props;
    const displayMax = ((index + 2) > images.length ? images.length : (index + 2));
    const displayMin = (index - 1) < 0 ? 0 : (index - 1);
    return isOpen ? (
      <Overlay lock>
        <div
          className="image-slides-view-port"
          ref={this.getViewPort}
        >
          <button
            className="image-slides-close"
            onClick={this.onCloseViewer}
          >
            <svg fill="#fff" height="24" viewBox="0 0 24 24" width="24" transform="scale(1.5)">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          </button>
          <div
            className="image-slides-index"
          >
            {`${index + 1} / ${images.length}`}
          </div>
          <div
            className="image-slides-container"
            style={{
              transform: `translate3d(${-this.getMedianIndex() * ((this.viewPortEl ? this.viewPortEl.clientWidth : 0) + GUTTER_WIDTH)}px, 0, 0)`,
            }}
            ref={this.getContainer}
          >
            {images
              .slice(
                displayMin,
                displayMax,
              ).map((url, ind) => (
                <div
                  key={url + (ind + index - (index - displayMin))}
                  className="image-slides-blackboard"
                >
                  {loaded[url] ? (
                    <img
                      className="image-slides-content"
                      style={{
                        ...this.initialStyle[url],
                      }}
                      src={url}
                      alt="图片"
                      ref={this.getImageEl}
                    />
                  ) : (
                    <div className="image-slides-loading" key="loading">
                      <div />
                      <div />
                      <div />
                      <div />
                      <div />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </Overlay>
    ) : null;
  }
 }
