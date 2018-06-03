import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import transform from 'css3transform';
import AlloyFinger from '../AlloyFinger';
import ImageController from '../ImageController';
import touchEmulator from '../utils/touchEmulator';
import Overlay from '../Overlay';
import './style.css';

const GUTTER_WIDTH = 10;
const SWIPE_TRIGGER = 60;

function preload(url) {
  if (url) {
    const loader = new Image();
    return new Promise((resolve, reject) => {
      loader.onload = resolve;
      loader.onerror = reject;
      loader.src = url;
    });
  }
  return null;
}
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
    haveControl: true,
    isOpen: false,
  };

  lastContainerOffsetX = 0;
  initialStyle = {};
  imageController = {};

  constructor(props) {
    super(props);
    const { index, isOpen } = props;
    this.state = {
      index: index || this.state.index,
      haveControl: false,
      isOpen,
    };
  }

  componentDidMount() {
    const {
      images,
    } = this.props;
    const {
      index,
    } = this.state;
    preload(images[index]);
    preload(images[index + 1]);
    preload(images[index - 1]);
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
      this.containerEl = el;
      if (useTouchEmulator) {
        touchEmulator(el);
      }
    }
  };

  getControl = () => {
    if (!this.state.haveControl) {
      this.setState({
        haveControl: true,
      });
    }
  };

  handleContainerMove = e => {
    window.requestAnimationFrame(this.move(e));
    e.preventDefault();
    e.stopPropagation();
  };

  move = e => () => {
    if (this.state.haveControl) {
      this.containerEl.translateX = this.containerEl.translateX + parseInt(e.deltaX, 10);
    }
  };

  handleTouchEnd = e => {
    e.preventDefault();
    if (this.state.haveControl) {
      const boardWidth = (GUTTER_WIDTH + window.innerWidth);
      const baseline = boardWidth * this.getMedianIndex();
      if (-this.containerEl.translateX - baseline > SWIPE_TRIGGER) {
        const step = this.transition(160, 'next');
        window.requestAnimationFrame(step);
      } else if (baseline + this.containerEl.translateX > SWIPE_TRIGGER) {
        const step = this.transition(160, 'last');
        window.requestAnimationFrame(step);
      } else {
        const step = this.transition(160, 'noMove');
        window.requestAnimationFrame(step);
      }
      this.setState({
        haveControl: false,
      });
    }
  };

  transition(time, direction) {
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
    };
    return step;
  }


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

  updatePosition = () => {
    this.containerEl.translateX = -(GUTTER_WIDTH + window.innerWidth) *
    this.getMedianIndex();
  };

  next() {
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
    }
  }

  last() {
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
    }
  }

  handleCloseViewer = e => {
    const { index } = this.state;
    const { onClose } = this.props;
    this.setState({
      isOpen: false,
    });
    if (onClose) onClose(e, index);
  };

  render() {
    const { index, isOpen } = this.state;
    const { images, addon } = this.props;
    const displayMax = index + 2 > images.length ? images.length : index + 2;
    const displayMin = index - 1 < 0 ? 0 : index - 1;
    return isOpen ? (
      <Overlay onClose={this.onCloseViewer}>
        <div className="image-slides-view-port" >
          {images.length > 0 && (
            <div className="image-slides-index">
              {`${index + 1} / ${images.length}`}
            </div>
          )}
          {addon && addon(images[index], index)}
          <AlloyFinger
            onSingleTap={this.handleCloseViewer}
            onTouchEnd={this.handleTouchEnd}
            onPressMove={this.handleContainerMove}>
            <div
              className="image-slides-container"
              ref={this.getContainer}>
              {images.slice(displayMin, displayMax).map((url, ind) => (
                /* eslint-disable */
                <ImageController
                  onGiveupControl={this.getControl}
                  url={url}
                  key={url + (ind + displayMin)}
                  focused={ind === this.getMedianIndex()} />
            ))}
            </div>
          </AlloyFinger>
        </div>
      </Overlay>
    ) : null;
  }
}
