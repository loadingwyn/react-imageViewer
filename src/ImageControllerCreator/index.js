import throttle from 'lodash.throttle';

export default class ImageControllerCreator {
  state = {
    scale: 1,
    lastScale: 1,
    offsetX: 0,
    offsetY: 0,
    lastOffsetX: 0,
    lastOffsetY: 0,
  };

  constructor(element, option = {}) {
    this.target = element;
    this.originalWidth = element.clientWidth;
    this.state.originX = this.target.clientWidth / 2;
    this.state.originY = this.target.clientHeight / 2;
    this.viewPortWidth = option.viewPortWidth;
    this.viewPortHeight = option.viewPortHeight;
    this.onGetControl = option.onGetControl;
    this.onLoseControl = option.onLoseControl;
  }

  changeTarget(newEle) {
    this.target = newEle;
    this.originalWidth = newEle.clientWidth;
  }

  set(newState) {
    this.preProcess(newState);
    const { style } = this.target;
    const {
      offsetX,
      offsetY,
      lastOffsetX,
      lastOffsetY,
      scale,
      originX,
      originY,
    } = this.state;
    style.transform = `translate3d(calc(${offsetX +
      lastOffsetX}px - 50%), calc(${offsetY +
      lastOffsetY}px - 50%), 0) scale(${scale})`;
    style.transformOrigin = `${originX}px ${originY}px`;
    if (this.onChange) {
      this.onChange(this.state);
    }
    this.state.lastOffsetX = offsetX + lastOffsetX;
    this.state.lastOffsetY = offsetY + lastOffsetY;
    this.state.offsetX = 0;
    this.state.offsetY = 0;
  }

  preProcess(newState) {
    this.state = {
      ...this.state,
      ...newState,
    };
    this.state.scale = this.state.scale;
    const { clientWidth, clientHeight } = this.target;
    const { scale, originX, originY } = this.state;

    throttle(() => {
      this.restrictMovement(
        ((clientWidth + originX - this.target.clientWidth / 2) * scale -
          this.viewPortWidth) /
          2,
        ((clientWidth - originX + this.target.clientWidth / 2) * scale -
          this.viewPortWidth) /
          2,
        ((clientHeight + originY - this.target.clientHeight / 2) * scale -
          this.viewPortHeight) /
          2 +
          100,
        ((clientHeight - originY + this.target.clientHeight / 2) * scale -
          this.viewPortHeight) /
          2 +
          100,
      );
    }, 100)();
  }

  restrictMovement(leftRange, rightRange, topRange, bottomRange) {
    let isInLimit = true;
    const result = {};
    const {
      offsetX, offsetY, lastOffsetX, lastOffsetY,
    } = this.state;
    if (
      lastOffsetX + offsetX < 0 &&
      Math.abs(lastOffsetX + offsetX) > rightRange - 1 &&
      lastOffsetX + offsetX <= lastOffsetX
    ) {
      result.offsetX = 0;
      result.lastOffsetX = lastOffsetX;
      isInLimit = false;
    } else if (
      lastOffsetX + offsetX >= 0 &&
      lastOffsetX + offsetX > leftRange - 1 &&
      lastOffsetX + offsetX >= lastOffsetX
    ) {
      result.offsetX = 0;
      result.lastOffsetX = lastOffsetX;
      isInLimit = false;
    }
    if (
      lastOffsetY + offsetY < 0 &&
      Math.abs(lastOffsetY + offsetY) > bottomRange - 1 &&
      lastOffsetY + offsetY <= lastOffsetY
    ) {
      result.offsetY = 0;
      result.lastOffsetY = lastOffsetY;
    } else if (
      lastOffsetY + offsetY >= 0 &&
      lastOffsetY + offsetY > topRange - 1 &&
      lastOffsetY + offsetY >= lastOffsetY
    ) {
      result.offsetY = 0;
      result.lastOffsetY = lastOffsetY;
    }
    if (!isInLimit && this.onLoseControl) {
      this.onGetControl();
      this.onLoseControl();
    } else {
      this.onGetControl();
    }
    this.state = {
      ...this.state,
      ...result,
    };
  }

  reset = () => {
    this.set({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      lastOffsetX: 0,
      lastOffsetY: 0,
      lastScale: 1,
      originX: this.target ? this.target.clientWidth / 2 : 0,
      originY: this.target ? this.target.clientHeight / 2 : 0,
    });
  };

  enlargeBytimes(times) {
    const { lastScale = 1 } = this.state;
    const newScale = times * lastScale;
    if (newScale < 3.5 && newScale > 1) {
      this.set({ scale: newScale });
    } else if (newScale <= 1) {
      this.set({ scale: 1 });
    }
  }

  recordScale() {
    this.set({
      lastScale: this.state.scale,
    });
  }

  move(offset) {
    this.set({
      offsetX: parseInt(offset.deltaX, 10),
      offsetY: parseInt(offset.deltaY, 10),
    });
    offset.preventDefault();
  }

  record(offset) {
    this.set({
      lastOffsetX: offset.deltaX + this.state.lastOffsetX,
      lastOffsetY: offset.deltaY + this.state.lastOffsetY,
      offsetX: 0,
      offsetY: 0,
    });
    offset.preventDefault();
  }

  onDoubleTap = e => {
    if (this.state.scale > 1) {
      this.reset();
    } else {
      const centerX = e.changedTouches[0].pageX;
      const centerY = e.changedTouches[0].pageY;
      const cr = this.target.getBoundingClientRect();
      const imgCenterX = cr.left + cr.width / 2;
      const imgCenterY = cr.top + cr.height / 2;
      const offX = centerX - imgCenterX;
      const offY = centerY - imgCenterY;
      const preOriginX = this.state.originX;
      const preOriginY = this.state.originY;
      this.state.originX = preOriginX + offX / this.state.scale;
      this.state.originY = preOriginY + offY / this.state.scale;
      // reset translateX and translateY
      this.state.scale = this.viewPortEl
        ? Math.max(
          this.viewPortWidth / cr.width * 0.75,
          this.viewPortHeight / cr.height * 0.75,
          1.6,
        )
        : 2;
      this.recordScale();
      // debugger;
      this.onGetControl();
    }
  };
}
