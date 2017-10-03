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
  node = document.createElement('div');
  componentDidMount() {
    if (this.props.lock === true) {
      this.preventScrolling();
    }
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
    const {
      onClose,
    } = this.props;
    return ReactDOM.createPortal(
      <div className="image-slides-overlay">
        <button
          className="image-slides-close"
          onClick={onClose} >
          <svg
            fill="#fff"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            transform="scale(1.5)">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </button>
        {this.props.children}
      </div>,
      this.node,
    );
  }
}
