import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import transform from 'css3transform';
import AlloyFinger from 'alloyfinger/react/AlloyFinger';
import ImageController from '../ImageController';
import Overlay from '../Overlay';
import './style.css';

const GUTTER_WIDTH = 10;
const SWIPE_TRIGGER = 40;

function preload(url) {
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

export default class ImageSlides extends PureComponent {
  static propTypes = {
    images: PropTypes.arrayOf(PropTypes.string),
    index: PropTypes.number,
    isOpen: PropTypes.bool,
    showPageButton: PropTypes.bool,
    noTapClose: PropTypes.bool,
    loadingIcon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    addon: PropTypes.func,
    onClose: PropTypes.func,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    images: [],
    index: 0,
    showPageButton: false,
    noTapClose: false,
    isOpen: false,
  };

  state = {
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
      index,
      haveControl: false,
      isOpen,
    };
  }

  componentDidMount() {
    const { images } = this.props;
    const { index } = this.state;
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
      transform(el);
      this.containerEl = el;
    }
  };

  getControl = () => {
    const { haveControl } = this.state;
    if (!haveControl) {
      this.setState({
        haveControl: true,
      });
    }
  };

  handleContainerMove = e => {
    e.persist();
    window.requestAnimationFrame(this.move(e));
    e.preventDefault();
    e.stopPropagation();
    if (e.changedTouches[0].pageX > window.innerWidth || e.changedTouches[0].pageX < 0) {
      this.handleTouchEnd(e);
    }
  };

  move = e => () => {
    const { haveControl } = this.state;
    if (haveControl) {
      this.containerEl.translateX = this.containerEl.translateX + parseInt(e.deltaX, 10);
    }
  };

  handleTouchEnd = e => {
    e.preventDefault();
    const { haveControl, index } = this.state;
    if (haveControl) {
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
        haveControl: false,
      });
    }
  };

  transition(time, direction) {
    const { index } = this.state;
    const { images } = this.props;
    const boardWidth = GUTTER_WIDTH + window.innerWidth;
    let startTime;
    const startPos = this.containerEl.translateX;
    const size = (index === 0 && direction === 'prev')
      || (index === images.length - 1 && direction === 'next')
      || direction === 'noMove'
      ? 0
      : 1;
    const step = timestamp => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      this.containerEl.translateX = parseInt(
        startPos
          + (progress / time)
            * (-boardWidth * (this.getMedianIndex() + (direction === 'next' ? size : -size))
              - startPos),
        10,
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
    let center = parseInt((displayMax - displayMin) / 2, 10);
    if (index < 1) {
      center = index;
    } else if (index > images.length - 2) {
      center = images.length - index;
    }
    return center;
  }

  updatePosition = () => {
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

  handleCloseViewer = e => {
    const { index } = this.state;
    const { onClose } = this.props;
    this.setState({
      isOpen: false,
    });
    if (onClose) onClose(e, index);
  };

  render() {
    const { index, isOpen, haveControl } = this.state;
    const {
      images,
      addon,
      noTapClose,
      loadingIcon,
      showPageButton,
    } = this.props;
    const displayMax = index + 2 > images.length ? images.length : index + 2;
    const displayMin = index - 1 < 0 ? 0 : index - 1;
    return isOpen ? (
      <Overlay onClose={this.onCloseViewer}>
        <div className="image-slides-view-port">
          {addon
            && addon({
              url: images[index],
              index,
              close: this.handleCloseViewer,
              next: this.next,
              prev: this.prev,
            })}
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
                  d="M15.41,16.59L10.83,12l4.58-4.59L14,6l-6,6l6,6L15.41,16.59z" />
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
                  d="M8.59,16.59L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.59z" />
              </svg>
            </button>
          ) : null}
          <AlloyFinger
            // onSwipe={this.handleSwipe}
            onSingleTap={noTapClose ? null : this.handleCloseViewer}
            onTouchEnd={this.handleTouchEnd}
            onPressMove={this.handleContainerMove}>
            <div className="image-slides-container" ref={this.getContainer}>
              {images.slice(displayMin, displayMax).map((url, ind) => (
                /* eslint-disable */
                <ImageController
                  containerHaveControl={haveControl}
                  loadingIcon={loadingIcon}
                  onGiveupControl={this.getControl}
                  url={url}
                  key={url + (ind + displayMin)}
                  focused={ind === this.getMedianIndex()}
                />
              ))}
            </div>
          </AlloyFinger>
        </div>
      </Overlay>
    ) : null;
  }
}
