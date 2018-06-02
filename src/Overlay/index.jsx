import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';

let originalBodyOverflow = null;

export default class Overlay extends PureComponent {
  static propTypes = {
    parentSelector: PropTypes.func,
  };

  static defaultProps = {
    parentSelector() {
      return document.body;
    },
  };

  node = document.createElement('div');

  componentDidMount() {
    Overlay.preventScrolling();
    const parent = this.props.parentSelector();
    parent.appendChild(this.node);
  }

  componentWillReceiveProps(newProps) {
    const currentParent = this.props.parentSelector();
    const newParent = newProps.parentSelector();

    if (newParent !== currentParent) {
      currentParent.removeChild(this.node);
      newParent.appendChild(this.node);
    }
  }

  componentWillUnmount() {
    const parent = this.props.parentSelector();
    if (!this.node) return;
    parent.removeChild(this.node);
    Overlay.allowScrolling();
  }

  getLayer = el => {
    if (el) {
      el.addEventListener('touchstart', e => e.preventDefault());
      el.addEventListener('touchmove', e => e.preventDefault());
      el.addEventListener('touchend', e => e.preventDefault());
    }
  }
  static preventScrolling() {
    const { body } = document;
    originalBodyOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
  }

  static allowScrolling() {
    const { body } = document;
    body.style.overflow = originalBodyOverflow || '';
    originalBodyOverflow = null;
  }

  render() {
    const { onClose } = this.props;
    return ReactDOM.createPortal(
      <div className="image-slides-overlay" ref={this.getLayer}>
        <button className="image-slides-close" onClick={onClose}>
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
