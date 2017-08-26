import React, { PureComponent } from 'react';
import { autobind } from 'core-decorators';
// import Hammer from 'hammerjs';
import AlloyFinger from 'alloyfinger';
import ImageControllerCreator from '../ImageControllerCreator';
import touchEmulator from '../utils/touchEmulator';
import resizeImage from '../utils/resizeImage';
import Overlay from '../Overlay';
import './style.css';

export default class Carousel extends PureComponent {
  static defaultProps = {
    images: [],
  }
  state = {
    index: 2,
    loaded: {},
  };
  componentWillMount() {
    const {
      index,
      images,
      isMobile,
    } = this.props;
    this.setState({
      index: index || this.state.index,
    });
    this.preload(images[index || this.state.index]);
    this.touchDisabled = !isMobile;
    // this.touchDisabled = !isMobile && !(('ontouchstart' in window)
    //   || (window.Modernizr && window.Modernizr.touch)
    //   || (navigator.msMaxTouchPoints || navigator.maxTouchPoints) > 2);
  }

  componentWillReceiveProps(nextProps) {
    const {
        index,
      } = this.props;
    const {
        index: newIndex,
      } = nextProps;
    if (newIndex && index !== newIndex) {
      this.setState({
        index: newIndex,
      });
    }
  }

  @autobind
  getViewPort(el) {
    this.viewPortEl = el;
  }

  @autobind
  getContainer(el) {
    if (el) {
      this.containerEl = el;
      const gesturesManager = new AlloyFinger(el, {});
      this.containerController = gesturesManager;
      const style = this.containerEl.style;
      if (this.touchDisabled) {
        touchEmulator(el);
      }
      gesturesManager.on('touchStart', () => {
        style.transition = 'all 0.3s';
      });
      gesturesManager.on('touchEnd', () => {
        const lastPosition = /translateX\((-?\d+)px\)/.exec(style.transform);
        const offsetX = parseInt(lastPosition ? lastPosition[1] : 0, 10);
        const base = this.viewPortEl.clientWidth * this.state.index;
        style.transition = 'all 0.3s';
        if (offsetX + base > this.viewPortEl.clientWidth / 3) {
          this.last();
        } else if (offsetX + base < -this.viewPortEl.clientWidth / 3) {
          this.next();
        }
        style.transform = `translateX(${-(10 + this.viewPortEl.clientWidth) * this.state.index}px)`;
        this.imageController.resume();
        this.isMoving = false;
      });
    }
  }

  @autobind
  getImageEl(el) {
    if (el) {
      this.gesturesHandler(el);
    }
  }

  containerOnMove = offset => {
    this.isMoving = true;
    this.imageController.pause();
    const style = this.containerEl ? this.containerEl.style : {};
    const lastPosition = /translateX\((-?\d+)px\)/.exec(style.transform);
    const offsetX = offset.deltaX + parseInt(lastPosition ? lastPosition[1] : 0, 10);
    style.transition = '';
    style.transform = `translateX(${offsetX}px)`;
  };

  initialStyle = {};
  imageController = {};
  gesturesHandler(el) {
    if (this.touchDisabled) {
      touchEmulator(el.parentElement);
    }

    const imageController = new ImageControllerCreator(
      el, {
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
      },
    );
    this.imageController = imageController;
    const gesturesManager = new AlloyFinger(el.parentElement, {});
    gesturesManager.on(
      'pressMove',
      offset => {
        imageController.move.bind(imageController)(offset);
      });
    el.parentElement.addEventListener('wheel', event => {
      if (event.deltaY < 0) {
        imageController.enlarge(12)();
      } else if (event.deltaY > 0) {
        imageController.enlarge(-12)();
      }
    });
  }

  @autobind
  next() {
    if (this.state.index < this.props.images.length - 1) {
      const {
          images,
        } = this.props;
      this.setState({
        index: this.state.index + 1,
      });
      this.preload(images[this.state.index + 1]);
    }
  }

  @autobind
  last() {
    if (this.state.index > 0) {
      const {
          images,
        } = this.props;
        // this.imageController.changeTarget(this.imageEls[images[this.state.index - 1]]);
      this.setState({
        index: this.state.index - 1,
      });
      this.preload(images[this.state.index - 1]);
    }
  }

  preload(url) {
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

  render() {
    const {
        loaded,
      } = this.state;
    const {
        width,
        height,
        images,
      } = this.props;
    if (this.containerEl && this.viewPortEl) {
      this.containerEl.style.transform = `translateX(${-this.state.index * (this.viewPortEl.clientWidth + 10)}px)`;
    }
    return (
      <Overlay lock>
        <div
          style={{
            width,
            height,
          }}
          styleName="view-port"
          ref={this.getViewPort}
        >
          <div
            styleName="container"
            ref={this.getContainer}
          >
            {images.map(url => (
              <div
                key={url}
                styleName="blackboard"
              >
                {loaded[url] ? (
                  <img
                    styleName="content"
                    style={{
                      ...this.initialStyle[url],
                    }}
                    src={url}
                    alt="图片"
                    ref={this.getImageEl}
                  />
                ) : (
                  <div styleName="loading">
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
    );
  }
 }
