import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import './style.css';

let originalBodyOverflow = null;
let lockingCounter = 0;

export default class Overlay extends PureComponent {
  static defaultProps = {
    lock: false,
    parentSelector() { return document.body; },
  };

  componentDidMount() {
    if (this.props.lock === true) {
      this.preventScrolling();
    }
    this.node = document.createElement('div');

    const parent = this.props.parentSelector();
    parent.appendChild(this.node);
    this.renderContent(this.props);
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
    this.renderContent(newProps);
  }

  componentWillUnmount() {
    const parent = this.props.parentSelector();
    if (!this.node || !this.content) return;
    ReactDOM.unmountComponentAtNode(this.node);
    parent.removeChild(this.node);
    this.allowScrolling();
  }

  renderContent(props) {
    this.content = ReactDOM.render((
      <div className="image-slides-overlay">
        {props.children}
      </div>
    ), this.node);
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
    return null;
  }
 }
