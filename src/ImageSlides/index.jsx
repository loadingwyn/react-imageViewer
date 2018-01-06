import React, { PureComponent } from 'react';
import AlloyFinger from 'alloyfinger';
import PropTypes from 'prop-types';
import ImageControllerCreator from '../ImageControllerCreator';
import touchEmulator from '../utils/touchEmulator';
import resizeImage from '../utils/resizeImage';
import Overlay from '../Overlay';
import './style.css';

const GUTTER_WIDTH = 10;
export default class ImageSlides extends PureComponent {
  static propTypes = {
    images: PropTypes.arrayOf(PropTypes.string),
    index: PropTypes.number,
    isOpen: PropTypes.bool,
    useTouchEmulator: PropTypes.bool,
    addon: PropTypes.func,
    onClose: PropTypes.func,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    images: [],
    index: 0,
    isOpen: false,
    addon: null,
    useTouchEmulator: false,
    onClose: null,
    onChange: null,
  };
  state = {
    index: 0,
    loaded: {},
    isOpen: false,
  };

  lastContainerOffsetX = 0;
  initialStyle = {};
  imageController = {};

  componentWillMount() {
    const { index, images, isOpen } = this.props;
    const finalIndex = index || this.state.index;
    this.setState({
      index: finalIndex,
      isOpen,
    });
    this.preload(images[finalIndex]);
    this.preload(images[finalIndex + 1]);
    this.preload(images[finalIndex - 1]);
  }

  componentWillReceiveProps(newProps) {
    const { index, isOpen } = this.props;
    const { index: newIndex, isOpen: newIsOpen } = newProps;
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
      const { useTouchEmulator } = this.props;
      const gesturesManager = new AlloyFinger(el, {});
      this.containerEl = el;
      this.containerController = gesturesManager;
      const { style } = this.containerEl;
      if (useTouchEmulator) {
        touchEmulator(el);
      }
      gesturesManager.on('touchStart', e => {
        style.transition = '';
        e.preventDefault();
      });
      gesturesManager.on('pressMove', this.containerOnMove);
      gesturesManager.on('touchEnd', e => {
        const swipeTrigger = window.innerWidth * 0.2;
        if (this.lastContainerOffsetX > swipeTrigger) {
          if (this.getMedianIndex() > 0 && this.state.index !== 1) {
            style.transform = `translate3d(${this.lastContainerOffsetX -
              (GUTTER_WIDTH + window.innerWidth) * 2}px, 0, 0)`;
          } else if (this.state.index === 1) {
            style.transform = `translate3d(${this.lastContainerOffsetX -
              (GUTTER_WIDTH + window.innerWidth)}px, 0, 0)`;
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
        style.transform = `translate3d(${-(GUTTER_WIDTH + window.innerWidth) *
          this.getMedianIndex()}px, 0, 0)`;
        this.lastContainerOffsetX = 0;
        e.preventDefault();
      });
    }
    this.gesturesHandlers = [];
  };

  getImageEl = el => {
    if (el) {
      this.gesturesHandler(el);
    }
  };

  getViewPort = el => {
    this.viewPortEl = el;
  };

  getMedianIndex() {
    const { index } = this.state;
    const { images } = this.props;
    const displayMax = index + 2 > images.length ? images.length : index + 2;
    const displayMin = index - 1 < 0 ? 0 : index - 1;
    let center = parseInt((displayMax - displayMin) / 2, 10);
    if (index < 1) {
      center = index;
    } else if (index > images.length - 2) {
      center = images.length - index;
    }
    return center;
  }

  containerOnMove = offset => {
    const deltaX = parseInt(offset.deltaX, 10);
    const style = this.containerEl ? this.containerEl.style : {};
    this.lastContainerOffsetX = deltaX + this.lastContainerOffsetX;
    const offsetX =
      this.lastContainerOffsetX -
      (GUTTER_WIDTH + window.innerWidth) * this.getMedianIndex();
    style.transform = `translate3d(${offsetX}px, 0, 0)`;
    offset.preventDefault();
    offset.stopPropagation();
  };

  gesturesHandler(el) {
    const { useTouchEmulator } = this.props;
    if (useTouchEmulator) {
      touchEmulator(el.parentElement);
    }
    const imageController = new ImageControllerCreator(el, {
      viewPortWidth: this.viewPortEl.clientWidth,
      viewPortHeight: this.viewPortEl.clientHeight,
      onGetControl: () => {
        if (this.containerController) {
          this.containerController.off('pressMove', this.containerOnMove);
        }
      },
      onLoseControl: () => {
        if (this.containerController) {
          this.containerController.on('pressMove', this.containerOnMove);
        }
      },
    });
    this.gesturesHandlers.push(imageController);
    const gesturesManager = new AlloyFinger(el.parentElement, {});
    gesturesManager.on('pressMove', offset => {
      imageController.move(offset);
    });
    gesturesManager.on('doubleTap', e => {
      if (imageController.state.scale > 1) {
        imageController.reset();
      } else {
        const centerX = e.changedTouches[0].pageX;
        const centerY = e.changedTouches[0].pageY;
        const cr = el.getBoundingClientRect();
        const imgCenterX = cr.left + cr.width / 2;
        const imgCenterY = cr.top + cr.height / 2;
        const offX = centerX - imgCenterX;
        const offY = centerY - imgCenterY;
        const preOriginX = imageController.state.originX;
        const preOriginY = imageController.state.originY;
        imageController.state.originX =
          preOriginX + offX / imageController.state.scale;
        imageController.state.originY =
          preOriginY + offY / imageController.state.scale;
        // reset translateX and translateY
        imageController.state.offsetX +=
          offX - preOriginX * imageController.state.scale;
        imageController.state.offsetY +=
          offY - preOriginY * imageController.state.scale;
        imageController.enlargeBytimes(1.8);
        imageController.recordScale();
        imageController.onGetControl();
      }
    });
    gesturesManager.on('touchEnd', e => {
      imageController.recordScale();
      e.preventDefault();
    });
  }

  next() {
    const { index } = this.state;
    const { images } = this.props;
    if (index < images.length - 1) {
      this.preload(images[index + 2]);
      this.setState(
        {
          index: index + 1,
        },
        this.ignore,
      );
    }
  }

  last() {
    const { index } = this.state;
    const { images } = this.props;
    if (index > 0) {
      this.preload(images[index - 2]);
      this.setState(
        {
          index: index - 1,
        },
        this.ignore,
      );
    }
  }

  ignore() {
    if (this.props.onChange) {
      this.props.onChange(this.state.index);
    }
    this.gesturesHandlers.forEach(controller => controller.reset());
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
    const { index } = this.state;
    const { onClose } = this.props;
    this.setState({
      isOpen: false,
    });
    if (onClose) onClose(event, index);
  };

  render() {
    const { loaded, index, isOpen } = this.state;
    const { images, addon } = this.props;
    const displayMax = index + 2 > images.length ? images.length : index + 2;
    const displayMin = index - 1 < 0 ? 0 : index - 1;
    const Loading = (
      <div className="image-slides-loading" key="loading">
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    );
    return isOpen ? (
      <Overlay onClose={this.onCloseViewer}>
        <div className="image-slides-view-port" ref={this.getViewPort}>
          {images.length > 0 && (
            <div className="image-slides-index">
              {`${index + 1} / ${images.length}`}
            </div>
          )}
          {addon && addon(images[index], index)}
          <div
            className="image-slides-container"
            ref={this.getContainer}
            key={this.viewPortEl && this.viewPortEl.clientWidth} // chrome transform
            style={{
              transform: `translate3d(${-this.getMedianIndex() *
                window.innerWidth +
                GUTTER_WIDTH}px, 0, 0)`,
            }}>
            {images.slice(displayMin, displayMax).map((url, ind) => (
              <div
                /* eslint-disable */
                key={url + (ind + displayMin)}
                /* eslint-enable */
                className="image-slides-blackboard">
                {loaded[url] ? (
                  <img
                    className="image-slides-content"
                    src={url}
                    alt="图片"
                    ref={this.getImageEl}
                    style={{
                      ...this.initialStyle[url],
                    }} />
                ) : (
                  Loading
                )}
              </div>
            ))}
          </div>
        </div>
      </Overlay>
    ) : null;
  }
}
