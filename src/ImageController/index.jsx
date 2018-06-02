import transform from 'css3transform';
import React, { PureComponent } from 'react';
import AlloyFinger from '../AlloyFinger';
import resizeImage from '../utils/resizeImage';

const VERTICAL_BUFFER = 0;
export default class ImageController extends PureComponent {
  static defaultProps = {
    alt: 'picture',
    focused: false,
  };

  state = {
    isLoaded: false,
  };

  componentDidMount() {
    const {
      url,
    } = this.props;
    const loader = new Image();
    if (url) {
      new Promise((resolve, reject) => {
        loader.onload = resolve;
        loader.onerror = reject;
        loader.src = url;
      }).then(() => {
        if (!this.unMount) {
          this.style = resizeImage(loader.naturalWidth, loader.naturalHeight);
          this.setState({
            isLoaded: true,
          });
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.focused === true && this.props.focused === false) {
      this.reset();
    }
  }
  componentWillUnmount() {
    this.unMount = true;
  }

  initScale = 1;
  style = {};
  getImageEl = el => {
    if (el) {
      this.target = el;
      transform(el);
    }
  };

  checkPosition = (deltaX, deltaY) => {
    const {
      onGiveupControl,
    } = this.props;
    const {
      left,
      right,
      top,
      bottom,
    } = this.target.getBoundingClientRect();
    if (!(deltaX > 0 && left > 0) && !(deltaX < 0 && right < window.innerWidth)) {
      this.target.translateX += parseInt(deltaX, 10);
    } else if (onGiveupControl) {
      onGiveupControl();
    }
    if (!(deltaY >= 0 && top > VERTICAL_BUFFER)
      && !(deltaY <= 0 && bottom < window.innerHeight - VERTICAL_BUFFER)) {
      this.target.translateY += parseInt(deltaY, 10);
    }
  };


  reset = () => {
    this.target.translateX = 0;
    this.target.translateY = 0;
    this.target.scaleX = 1;
    this.target.scaleY = 1;
    this.target.originX = 0;
    this.target.originY = 0;
  };

  handleMove = e => {
    e.persist();
    e.preventDefault();
    window.requestAnimationFrame(() => this.checkPosition(
      parseInt(e.deltaX, 10),
      parseInt(e.deltaY, 10),
    ));
  };

  handleMultipointStart = e => {
    const centerX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
    const centerY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
    const cr = this.target.getBoundingClientRect();
    const imgCenterX = cr.left + cr.width / 2;
    const imgCenterY = cr.top + cr.height / 2;
    const offX = centerX - imgCenterX;
    const offY = centerY - imgCenterY;
    const preOriginX = this.target.originX;
    const preOriginY = this.target.originY;
    this.target.originX = offX / this.target.scaleX;
    this.target.originY = offY / this.target.scaleY;
    this.target.translateX += offX - preOriginX * this.target.scaleX;
    this.target.translateY += offY - preOriginY * this.target.scaleX;
    this.initScale = this.target.scaleX;
  };

  handleDoubleTap = () => {
    this.target.scaleX = 2;
    this.target.scaleY = 2;
  };

  handlePinch = e => {
    this.target.scaleX = this.initScale * e.zoom;
    this.target.scaleY = this.initScale * e.zoom;
  };
  handleTouchEnd = e => {
    e.preventDefault();
  }
  render() {
    const {
      isLoaded,
    } = this.state;
    const {
      url,
      alt,
      onGiveupControl,
      focused,
      ...other
    } = this.props;
    return (
      isLoaded ? (
        <AlloyFinger
          onTouchEnd={this.handleTouchEnd}
          onMultipointStart={this.handleMultipointStart}
          onPressMove={this.handleMove}
          onDoubleTap={this.handleDoubleTap}
          onPinch={this.handlePinch}>
          <div className="image-slides-blackboard">
            <img
              className="image-slides-content"
              alt={alt}
              src={url}
              ref={this.getImageEl}
              style={this.style}
              {...other} />
          </div>
        </AlloyFinger>
      ) : (
        <AlloyFinger onPressMove={this.handleMove}>
          <div className="image-slides-blackboard">
            <div className="image-slides-loading" key="loading" ref={this.getImageEl}>
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
        </AlloyFinger>
      )
    );
  }
}
