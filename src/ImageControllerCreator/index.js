// import { autobind } from 'core-decorators';

export default class ImageControllerCreator {
  state = {
    scale: 0,
    offsetX: 0,
    offsetY: 0,
    lastOffsetX: 0,
    lastOffsetY: 0,
  }
  constructor(element) {
    this.target = element;
    this.originalWidth = element.clientWidth;
    this.maxOffsetX = (window.innerWidth / 2) - 10;
    this.maxOffsetY = (window.innerHeight / 2) - 10;
  }

  changeTarget(newEle) {
    this.target = newEle;
    this.originalWidth = newEle.clientWidth;
  }

  set(newState) {
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
    this.state = {
      ...this.state,
      ...this.restrictMovement(
        (4 * clientWidth * scaleMultiples) / 7,
        (clientHeight * scaleMultiples) / 2,
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
    style.transform = `translate3d(${offsetX + lastOffsetX}px, ${offsetY + lastOffsetY}px, 0) scale(${scaleMultiples})`;
  }

  restrictMovement(xRange, yRange) {
    const result = {};
    const {
      offsetX,
      offsetY,
      lastOffsetX,
      lastOffsetY,
    } = this.state;
    if ((lastOffsetX + offsetX) > xRange) {
      result.lastOffsetX = xRange;
      result.offsetX = 0;
    }
    if ((lastOffsetX + offsetX) < -xRange) {
      result.lastOffsetX = -xRange;
      result.offsetX = 0;
    }
    if ((lastOffsetY + offsetY) > yRange) {
      result.lastOffsetY = yRange;
      result.offsetY = 0;
    }
    if ((lastOffsetY + offsetY) < -yRange) {
      result.lastOffsetY = -yRange;
      result.offsetY = 0;
    }
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
}
