// import { autobind } from 'core-decorators';

export default class ImageControllerCreator {
  state = {
    scale: 0,
    offsetX: 0,
    offsetY: 0,
    lastOffsetX: 0,
    lastOffsetY: 0,
  }
  constructor(element, option = {}) {
    this.target = element;
    this.originalWidth = element.clientWidth;
    this.maxOffsetX = (window.innerWidth / 2) - 10;
    this.maxOffsetY = (window.innerHeight / 2) - 10;
    this.viewPortWidth = option.viewPortWidth;
    this.viewPortHeight = option.viewPortHeight;
    this.onGetControl = option.onGetControl;
    this.onLoseControl = option.onLoseControl;
    this.isControlled = true;
    this.stop = true;
  }

  changeTarget(newEle) {
    this.target = newEle;
    this.originalWidth = newEle.clientWidth;
  }

  set(newState) {
    // const oldState = this.state;
    this.state = {
      ...this.state,
      ...newState,
    };
    const {
      style,
      clientWidth,
      clientHeight,
    } = this.target;
    const scaleMultiples = 1 + (this.state.scale / 100);
    if (scaleMultiples <= 1 && (
      this.state.lastOffsetX ||
      this.state.lastOffsetY
    )) {
      this.onGetControl();
      this.onLoseControl();
      this.reset();
    }
    this.state = {
      ...this.state,
      ...this.restrictMovement(
        this.state,
        ((clientWidth * scaleMultiples) - this.viewPortWidth) / 2,
        ((clientHeight * scaleMultiples) - this.viewPortHeight) / 2,
      ),
    };
    const {
      offsetX,
      offsetY,
      lastOffsetX,
      lastOffsetY,
    } = this.state;
    // style.width = `${(scale * 2) + this.originalWidth}px`;
    // style.height = 'auto';
    style.transform = `translate3d(calc(${offsetX + lastOffsetX}px - 50%), calc(${offsetY + lastOffsetY}px - 50%), 0) scale(${scaleMultiples})`;
    if (this.onChange) {
      this.onChange(this.state);
    }
    this.state.lastOffsetX = offsetX + lastOffsetX;
    this.state.lastOffsetY = offsetY + lastOffsetY;
  }

  restrictMovement(state, xRange, yRange) {
    let flag = true;
    const result = {};
    const {
      offsetX,
      offsetY,
      lastOffsetX,
      lastOffsetY,
    } = state;
    if (Math.abs(lastOffsetX + offsetX) > xRange) {
      result.offsetX = 0;
      result.lastOffsetX = lastOffsetX;
      flag = false;
    }
    if (Math.abs(lastOffsetY + offsetY) > yRange) {
      result.offsetY = 0;
      result.lastOffsetY = lastOffsetY;
      // flag = false;
    }
    // if (this.stop) {
    //   result.offsetX = 0;
    //   result.offsetY = 0;
    // }
    if (!this.stop && flag === true && this.onGetControl) {
      this.onGetControl();
    }
    if (flag === false && this.isControlled === true && this.onLoseControl) {
      this.onGetControl();
      this.onLoseControl();
    }
    this.stop = false;
    this.isControlled = flag;
    return result;
  }

  reset() {
    this.set({
      scale: 0,
      offsetX: 0,
      offsetY: 0,
      lastOffsetX: 0,
      lastOffsetY: 0,
    });
  }

  enlarge(delta) {
    return () => {
      const {
        scale,
      } = this.state;
      const newScale = scale + delta;
      if (newScale < 350 && newScale > 0) {
        this.set({ scale: newScale });
      } else if (newScale <= 0) {
        this.set({ scale: 0 });
      }
    };
  }

  move(offset) {
    // this.set({
    //   lastOffsetX: offset.deltaX + this.state.lastOffsetX,
    //   lastOffsetY: offset.deltaY + this.state.lastOffsetY,
    // });
    this.set({
      offsetX: offset.deltaX,
      offsetY: offset.deltaY,
    });
  }

  record(offset) {
    this.set({
      lastOffsetX: offset.deltaX + this.state.lastOffsetX,
      lastOffsetY: offset.deltaY + this.state.lastOffsetY,
      offsetX: 0,
      offsetY: 0,
    });
  }
  pause() {
    this.stop = true;
  }
  resume() {
    this.stop = false;
  }
}
