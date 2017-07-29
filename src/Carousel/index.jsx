  import React, { PureComponent } from 'react';
  import { autobind } from 'core-decorators';
  import Hammer from 'hammerjs';
  import touchEmulator from '../utils/touchEmulator';
  import './style.css';

  export default class Carousel extends PureComponent {
    static defaultProps = {
      count: 2,
    }
    state = {
      index: 0,
    };

    @autobind
    getViewPort(el) {
      this.viewPortDom = el;
    }

    @autobind
    getContainer(el) {
      this.containerDom = el;
      const gesturesManager = new Hammer.Manager(el);
      if (!this.props.isMobile && !(('ontouchstart' in window)
      || (window.Modernizr && window.Modernizr.touch)
      || (navigator.msMaxTouchPoints || navigator.maxTouchPoints) > 2)) {
        touchEmulator(el);
      }
      gesturesManager.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
      gesturesManager.add(new Hammer.Swipe({
        velocity: 0.2,
        threshold: 40,
      })).recognizeWith(gesturesManager.get('pan'));
      const style = this.containerDom.style;
      gesturesManager.on('panstart', () => {
        style.transition = 'all 0.3s';
      });
      gesturesManager.on('panmove', offset => {
        style.transition = '';
        style.transform = `translateX(${offset.deltaX - (this.viewPortDom.clientWidth * this.state.index)}px)`;
      });
      gesturesManager.on('panend', () => {
        style.transition = 'all 0.3s';
        style.transform = `translateX(${-this.viewPortDom.clientWidth * this.state.index}px)`;
      });
      gesturesManager.on('swipeleft', this.next);
      gesturesManager.on('swiperight', this.last);
    }

  @autobind
    next() {
      if (this.state.index < this.props.count - 1) {
        this.setState({
          index: this.state.index + 1,
        });
      }
    }

  @autobind
    last() {
      if (this.state.index > 0) {
        this.setState({
          index: this.state.index - 1,
        });
      }
    }

    render() {
      const {
      width,
      height,
    } = this.props;
      if (this.containerDom && this.viewPortDom) {
        this.containerDom.style.transform = `translateX(${-this.state.index * this.viewPortDom.clientWidth}px)`;
      }
      return (
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
            <div styleName="content0" />
            <div styleName="content1" />
          </div>
        </div>
      );
    }
 }
