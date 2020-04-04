import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './style.css';

let originalBodyOverflow = null;

function preventDefault(e) {
  e.preventDefault();
}
export default class Overlay extends PureComponent {
  node = document.createElement('div');

  componentDidMount() {
    const { parentSelector } = this.props;
    Overlay.preventScrolling();
    const parent = parentSelector();
    parent.appendChild(this.node);
  }

  componentDidUpdate(prevProps) {
    const { parentSelector } = this.props;
    const currentParent = parentSelector();
    const prevParent = prevProps.parentSelector();

    if (prevParent !== currentParent) {
      prevParent.removeChild(this.node);
      currentParent.appendChild(this.node);
    }
  }

  componentWillUnmount() {
    if (this.layer) {
      this.layer.removeEventListener('touchstart', preventDefault);
    }
    const { parentSelector } = this.props;
    const parent = parentSelector();
    if (!this.node) return;
    parent.removeChild(this.node);
    Overlay.allowScrolling();
  }

  getLayer = el => {
    if (el) {
      this.layer = el;
      el.addEventListener('touchstart', preventDefault);
    }
  };

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
    const { className, parentSelector, ...other } = this.props;
    return ReactDOM.createPortal(
      <div
        className={classNames('image-slides-overlay', className)}
        ref={this.getLayer}
        {...other}
      />,
      this.node,
    );
  }
}
Overlay.propTypes = {
  parentSelector: PropTypes.func,
};

Overlay.defaultProps = {
  parentSelector() {
    return document.body;
  },
};
