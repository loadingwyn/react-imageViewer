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
  }

  preProcess(newState) {
    this.state = {
      ...this.state,
      ...newState,
    };
    this.state.scale = this.state.scale;
    const { clientWidth, clientHeight } = this.target;
    const {
      lastOffsetX, lastOffsetY, scale, originX, originY,
    } = this.state;
    if (scale <= 1 && (lastOffsetX || lastOffsetY)) {
      this.reset();
    }
    this.restrictMovement(
      ((clientWidth - originX + this.target.clientWidth / 2) * scale -
        this.viewPortWidth) /
        2,
      ((clientWidth + originX - this.target.clientWidth / 2) * scale -
        this.viewPortWidth) /
        2,
      (clientHeight * scale +
        Math.abs(originY - this.target.clientHeight / 2) -
        this.viewPortHeight) /
        2 + 100,
    );
  }

  restrictMovement(leftRange, rightRange, yRange) {
    let isInLimit = true;
    const result = {};
    const {
      offsetX, offsetY, lastOffsetX, lastOffsetY,
    } = this.state;
    if (
      Math.abs(lastOffsetX + offsetX) > rightRange &&
      lastOffsetX + offsetX > lastOffsetX
    ) {
      result.offsetX = 0;
      result.lastOffsetX = lastOffsetX;
      isInLimit = false;
    } else if (
      Math.abs(lastOffsetX + offsetX) > leftRange &&
      lastOffsetX + offsetX < lastOffsetX
    ) {
      result.offsetX = 0;
      result.lastOffsetX = lastOffsetX;
      isInLimit = false;
    }
    if (
      Math.abs(lastOffsetY + offsetY) > yRange &&
      Math.abs(lastOffsetY + offsetY) > Math.abs(lastOffsetY)
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

  reset() {
    this.set({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      lastOffsetX: 0,
      lastOffsetY: 0,
      lastScale: 1,
      originX: this.target.clientWidth / 2,
      originY: this.target.clientHeight / 2,
    });
    this.target.style.transition = 'transform 0.1s';
  }

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
}
