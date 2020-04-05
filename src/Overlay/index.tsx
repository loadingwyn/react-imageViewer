import React, { PureComponent, SyntheticEvent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './style.css';

let originalBodyOverflow: string | null = null;

function preventDefault(e: Event) {
  e.preventDefault();
}

interface OverlayProps {
  className?: string;
  parentSelector: () => HTMLElement;
}
export default class Overlay extends PureComponent<OverlayProps> {
  static defaultProps = {
    parentSelector() {
      return document.body;
    },
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

  node = document.createElement('div');
  layer: HTMLDivElement | null = null;

  componentDidMount() {
    const { parentSelector } = this.props;
    Overlay.preventScrolling();
    const parent = parentSelector();
    parent.appendChild(this.node);
  }

  componentDidUpdate(prevProps: OverlayProps) {
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

  getLayer = (el: HTMLDivElement) => {
    if (el) {
      this.layer = el;
      el.addEventListener('touchstart', preventDefault);
    }
  };

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
