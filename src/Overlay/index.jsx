import React, { PureComponent } from 'react';
// import { autobind } from 'core-decorators';
import './style.css';

let originalBodyOverflow = null;
let lockingCounter = 0;

export default class Overlay extends PureComponent {
  componentDidMount() {
    if (this.props.lock === true) {
      this.preventScrolling();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lock !== nextProps.lock) {
      if (nextProps.lock) {
        this.preventScrolling();
      } else {
        this.allowScrolling();
      }
    }
  }

  componentWillUnmount() {
    this.allowScrolling();
  }

  locked = false;
  preventScrolling() {
    if (this.locked === true) {
      return;
    }
    lockingCounter += 1;
    if (lockingCounter === 1) {
      const body = document.body;
      originalBodyOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
    }
  }
  allowScrolling() {
    if (this.locked === true) {
      lockingCounter -= 1;
      this.locked = false;
    }

    if (lockingCounter === 0 && originalBodyOverflow !== null) {
      const body = document.body;
      body.style.overflow = originalBodyOverflow || '';
      originalBodyOverflow = null;
    }
  }

  render() {
    return (
      <div styleName="overlay">
        {this.props.children}
      </div>
    );
  }
 }
