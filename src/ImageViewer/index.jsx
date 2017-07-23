import React, { PureComponent } from 'react';
import { autobind } from 'core-decorators';
// import AlloyFinger from 'alloyfinger';
import Hammer from 'hammerjs';
import Overlay from '../Overlay';
import ImageControllerCreator from '../ImageControllerCreator';
import touchEmulator from '../utils/touchEmulator';
import './style.css';

function resizeImage(
  imageWidth,
  imageHeight,
) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight * 0.7;
  const screenRadio = screenWidth / screenHeight;
  const imageRadio = imageWidth / imageHeight;
  if (imageRadio > screenRadio) {
    return {
      width: screenWidth < imageWidth ? '100%' : `${imageWidth}px`,
      height: 'auto',
    };
  }
  return {
    width: 'auto',
    height: screenHeight < imageHeight ? '100%' : `${imageWidth}px`,
  };
}

export default class ImageViewer extends PureComponent {
  state = {
    loaded: false,
    index: 0,
  }

  componentWillMount() {
    const {
      index,
      images,
    } = this.props;
    this.setState({
      index,
    });
    this.preload(images[index]);
  }

  componentWillReceiveProps(nextProps) {
    const {
      index,
    } = this.props;
    const {
      index: newIndex,
    } = nextProps;
    if (index !== newIndex) {
      this.setState({
        index: newIndex,
      });
    }
  }

  @autobind
  getImage(el) {
    if (el && this.image !== el) {
      this.image = el;
      this.gesturesHandler();
    }
  }

  @autobind
  getContainer(el) {
    this.imageContainer = el;
  }

  gesturesHandler() {
    if (this.imageController) {
      this.imageController.changeTarget(this.image);
    } else {
      const imageController = new ImageControllerCreator(this.image);
      const gesturesManager = new Hammer.Manager(this.imageContainer, {});
      if (!this.props.isMobile && !(('ontouchstart' in window)
        || (window.Modernizr && window.Modernizr.touch)
        || (navigator.msMaxTouchPoints || navigator.maxTouchPoints) > 2)) {
        touchEmulator(this.imageContainer);
      } else {
        gesturesManager.on('swipeleft', this.next);
        gesturesManager.on('swiperight', this.last);
        // gesturesManager.on('swipe', event => {
        //   if (event.direction === 'Right') {
        //     this.next();
        //   } else if (event.direction === 'Left') {
        //     this.last();
        //   }
        // });
      }
      // gesturesManager.on('pinch', event => {
      //   imageController.enlarge(event.zoom > 1 ? 2 : -2);
      // });
      // gesturesManager.on('pressMove', imageController.move.bind(imageController));
      this.imageController = imageController;
      gesturesManager.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
      gesturesManager.add(new Hammer.Swipe({
        velocity: 0.5,
        threshold: 40,
      })).recognizeWith(gesturesManager.get('pan'));
      gesturesManager.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([
        gesturesManager.get('pan'),
      ]);
      gesturesManager.on('pinchout', imageController.enlarge(2));
      gesturesManager.on('pinchin', imageController.enlarge(-2));
      gesturesManager.on('panmove', imageController.move.bind(imageController));
      gesturesManager.on('panend', imageController.record.bind(imageController));

      this.imageContainer.addEventListener('wheel', event => {
        if (event.deltaY < 0) {
          imageController.enlarge(12)();
        } else if (event.deltaY > 0) {
          imageController.enlarge(-12)();
        }
      });
    }
  }

  preload(url) {
    const loader = new Image();
    new Promise((resolve, reject) => {
      loader.onload = resolve;
      loader.onerror = reject;
      loader.src = url;
    }).then(() => {
      this.initialStyle = resizeImage(loader.width, loader.height);
      this.setState({
        loaded: true,
      });
    });
  }

  @autobind
  next() {
    this.changeIndex(1);
  }

  @autobind
  last() {
    this.changeIndex(-1);
  }

  @autobind
  close() {
    this.props.onClose();
  }

  changeIndex(num) {
    const {
      images,
    } = this.props;
    const {
      index,
    } = this.state;
    if (this.imageController) {
      this.imageController.reset();
    }
    const newIndex = index + num;
    if (newIndex < images.length && newIndex >= 0) {
      this.setState({
        loaded: false,
        index: newIndex,
      });
      this.preload(images[newIndex]);
    }
  }

  initialStyle;
  imageController;
  image;
  imageContainer;
  render() {
    const {
      loaded,
      index,
    } = this.state;
    const {
      images,
      isMobile,
    } = this.props;
    return (
      <Overlay lock>
        <button styleName="close" onClick={this.close}>
          <svg fill="#FAFAFA" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </button>
        {!isMobile && (
          <div>
            <button styleName="next" onClick={this.next}>
              <svg fill="#FAFAFA" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
                <path d="M0-.25h24v24H0z" fill="none" />
              </svg>
            </button>
            <button styleName="last" onClick={this.last}>
              <svg fill="#FAFAFA" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
                <path d="M0-.5h24v24H0z" fill="none" />
              </svg>
            </button>
          </div>
        )}
        <div styleName="container" ref={this.getContainer}>
          {loaded ? (
            <img
              src={images[index]}
              styleName="content"
              alt="图片"
              style={{
                ...this.initialStyle,
              }}
              ref={this.getImage}
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
        <div styleName="index">{`${index + 1}/${images.length}`}</div>
      </Overlay>
    );
  }
 }
