import React, { PureComponent } from 'react';
import AlloyFinger from 'alloyfinger';
import PropTypes from 'prop-types';
import transform from 'css3transform';
import ImageController from '../ImageController';
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
    // onChange: PropTypes.func,
  };

  static defaultProps = {
    images: [],
    index: 0,
    isOpen: false,
    useTouchEmulator: false,
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
      transform(el);
      const gesturesManager = new AlloyFinger(el, {});
      this.containerEl = el;
      this.containerController = gesturesManager;
      if (useTouchEmulator) {
        touchEmulator(el);
      }
      gesturesManager.on('touchEnd', e => {
        const boardWidth = (GUTTER_WIDTH + window.innerWidth);
        const trigger = 120;
        const baseline = boardWidth * this.getMedianIndex();
        if (-this.containerEl.translateX - baseline > trigger) {
          const step = this.transition(160, 'next');
          window.requestAnimationFrame(step);
        } else if (baseline + this.containerEl.translateX > trigger) {
          const step = this.transition(160, 'last');
          window.requestAnimationFrame(step);
        } else {
          const step = this.transition(160, 'noMove');
          window.requestAnimationFrame(step);
        }
        e.preventDefault();
      });
    }
    this.gesturesHandlers = [];
  };

  transition = (time, direction) => {
    const boardWidth = (GUTTER_WIDTH + window.innerWidth);
    let startTime;
    const startPos = this.containerEl.translateX;
    const size = (this.state.index === 0 && direction === 'last')
      || (this.state.index === this.props.images.length - 1 && direction === 'next')
      || direction === 'noMove' ? 0 : 1;
    const step = timestamp => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      this.containerEl.translateX = parseInt(startPos
        + progress / time * (-boardWidth * (this.getMedianIndex() + (direction === 'next' ? size : -size)) - startPos), 10);
      if (progress < time) {
        window.requestAnimationFrame(step);
      } else if (direction === 'next') {
        this.next();
      } else if (direction === 'last') {
        this.last();
      }
      this.isMoving = false;
      this.containerController.off('pressMove', this.containerOnMove);
    };
    return step;
  }

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

  containerOnMove = e => {
    this.isMoving = true;
    this.containerEl.translateX = this.containerEl.translateX + parseInt(e.deltaX, 10);
    e.preventDefault();
    e.stopPropagation();
  };

  gesturesHandler(el) {
    const { useTouchEmulator } = this.props;
    if (useTouchEmulator) {
      touchEmulator(el.parentElement);
    }
    const imageController = new ImageController(el, {
      viewPortWidth: window.innerWidth,
      viewPortHeight: window.innerHeight,
      onLoseControl: () => {
        if (this.containerController && !this.isMoving) {
          this.containerController.off('pressMove', this.containerOnMove);
          this.containerController.on('pressMove', this.containerOnMove);
        }
      },
    });
    const gesturesManager = new AlloyFinger(el.parentElement, {});
    if (el.tagName === 'IMG') {
      gesturesManager.on('multipointStart', imageController.onMultipointStart);
      gesturesManager.on('pinch', imageController.onPinch);
      //   this.containerController.off('pressMove', this.containerOnMove);
      // });
      gesturesManager.on('doubleTap', e => {
        imageController.onDoubleTap(e);
        // this.containerController.off('pressMove', this.containerOnMove);
      });
      this.gesturesHandlers.push(imageController);
    }
    gesturesManager.on('pressMove', imageController.move);
    gesturesManager.on('touchEnd', e => {
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
        () => {
          this.containerEl.translateX = -(GUTTER_WIDTH + window.innerWidth) *
          this.getMedianIndex();
          this.handleChange();
        },
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
        () => {
          this.containerEl.translateX = -(GUTTER_WIDTH + window.innerWidth) *
          this.getMedianIndex();
          this.handleChange();
        },
      );
    }
  }

  handleChange() {
    this.gesturesHandlers.forEach(controller => controller.reset());
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
      <div className="image-slides-loading" key="loading" >
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
            key={this.viewPortEl && window.innerWidth}>
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
