import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import './style.css';

let originalBodyOverflow = null;
let lockingCounter = 0;

export default class Overlay extends PureComponent {
  static defaultProps = {
    lock: false,
    parentSelector() {
      return document.body;
    },
  };
  locked = false;

  componentDidMount() {
    if (this.props.lock === true) {
      this.preventScrolling();
    }
    this.node = document.createElement('div');
    const parent = this.props.parentSelector();
    parent.appendChild(this.node);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.lock !== newProps.lock) {
      if (newProps.lock) {
        this.preventScrolling();
      } else {
        this.allowScrolling();
      }
    }
    const currentParent = this.props.parentSelector();
    const newParent = newProps.parentSelector();

    if (newParent !== currentParent) {
      currentParent.removeChild(this.node);
      newParent.appendChild(this.node);
    }
  }

  componentWillUnmount() {
    const parent = this.props.parentSelector();
    if (!this.node || !this.content) return;
    parent.removeChild(this.node);
    this.allowScrolling();
  }

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
    return ReactDOM.createPortal(
      <div className="image-slides-overlay">{this.props.children}</div>,
      this.node,
    );
  }
}
