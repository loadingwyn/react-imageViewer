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
    //   let tmpDeltaX = 0;
    //   let lastIsOutOfRange = false;
      const style = this.containerEl.style;
    //   const gesturesManager = new Hammer.Manager(el);
    //   const backgroundPan = new Hammer.Pan({ threshold: 0, pointers: 0 });
    //   const backgroundSwipe = new Hammer.Swipe({
    //     velocity: 0.2,
    //     threshold: 40,
    //   });
      if (this.touchDisabled) {
        touchEmulator(el);
      }
    //   gesturesManager.add(backgroundPan);
    //   gesturesManager.add(backgroundSwipe).recognizeWith(gesturesManager.get('pan'));
      gesturesManager.on('touchStart', () => {
        style.transition = 'all 0.3s';
      });
      // gesturesManager.on('pressMove', this.containerOnMove);
      gesturesManager.on('touchEnd', () => {
        style.transition = 'all 0.3s';
        style.transform = `translateX(${-this.viewPortEl.clientWidth * this.state.index}px)`;
        this.imageController.resume();
        this.isMoving = false;
      });
    //   gesturesManager.on('swipeleft', this.next);
    //   gesturesManager.on('swiperight', this.last);
    }
  }

  @autobind
  getImageEl(el) {
    if (el && !this.imageEls[el.src]) {
      this.imageEls[el.src] = el;
      this.gesturesHandler(el);
    }
  }

  containerOnMove = offset => {
    this.isMoving = true;
    this.imageController.pause();
    const style = this.containerEl ? this.containerEl.style : {};
    const lastPosition = /translateX\((-?\d+)px\)/.exec(style.transform);
    style.transition = '';
    style.transform = `translateX(${offset.deltaX + parseInt(lastPosition ? lastPosition[1] : 0, 10)}px)`;
  };

  initialStyle = {};
  imageEls = {};
  imageController = {};
  gesturesHandler(el) {
    // const imageController = new ImageControllerCreator(
    //   this.imageEls[el.src],
    //   () => {
    //     this.isOutOfRange = false;
    //   },
    //   () => {
    //     this.isOutOfRange = true;
    //   },
    // );
    // const gesturesManager = new Hammer.Manager(this.imageEls[el.src], {});
    // if (!this.touchDisabled) {
    //   gesturesManager.on('swipeleft', this.next);
    //   gesturesManager.on('swiperight', this.last);
    // }
    // this.imageController[el.src] = imageController;
    // gesturesManager.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
    // gesturesManager.add(new Hammer.Swipe({
    //   velocity: 0.88,
    //   threshold: 40,
    // })).recognizeWith(gesturesManager.get('pan'));
    // gesturesManager.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([
    //   gesturesManager.get('pan'),
    // ]);
    // gesturesManager.on('pinchout', imageController.enlarge(2));
    // gesturesManager.on('pinchin', imageController.enlarge(-2));
    // gesturesManager.on('panmove', imageController.move.bind(imageController));
    // gesturesManager.on('panend', offset => {
    //   imageController.record(offset);
    //   this.isOutOfRange = false;
    // });
    if (this.touchDisabled) {
      touchEmulator(el);
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
    const gesturesManager = new AlloyFinger(el, {});
    gesturesManager.on(
      'pressMove',
      offset => {
        imageController.move.bind(imageController)(offset);
      });
    el.addEventListener('wheel', event => {
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
      this.containerEl.style.transform = `translateX(${-this.state.index * this.viewPortEl.clientWidth}px)`;
    }
    return (
      <Overlay lock>
        <div
          style={{
            width,
            height,
          }}
          styleName="viewPort"
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
