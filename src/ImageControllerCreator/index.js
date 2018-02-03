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
      lastOffsetX + offsetX > 0 &&
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
    console.log(!isInLimit);
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
      const cr = this.target.getBoundingClientRect();
      const imgCenterX = cr.left + cr.width / 2;
      const imgCenterY = cr.top + cr.height / 2;
      const centerX = Math.min(
        Math.max(e.changedTouches[0].pageX, cr.left),
        cr.left + cr.width,
      );
      const centerY = Math.min(
        Math.max(e.changedTouches[0].pageY, cr.top),
        cr.top + cr.height,
      );
      const offX = centerX - imgCenterX;
      const offY = centerY - imgCenterY;
      const preOriginX = this.state.originX;
      const preOriginY = this.state.originY;
      const newOriginX = preOriginX + offX / this.state.scale;
      const newOriginY = preOriginY + offY / this.state.scale;
      // reset translateX and translateY
      const newScale = Math.max(
        this.viewPortWidth / cr.width * 0.75,
        this.viewPortHeight / cr.height * 0.75,
        2,
      );
      if (newScale * cr.width <= this.viewPortWidth) {
        this.state.originX = preOriginX;
      } else {
        this.state.originX = newOriginX;
      }
      this.state.originY = newOriginY;
      this.state.scale = newScale;
      this.recordScale();
      // debugger;
      this.onGetControl();
    }
  };
}
