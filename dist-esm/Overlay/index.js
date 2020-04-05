var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import './style.css';
let originalBodyOverflow = null;
function preventDefault(e) {
    e.preventDefault();
}
export default class Overlay extends PureComponent {
    constructor() {
        super(...arguments);
        this.node = document.createElement('div');
        this.layer = null;
        this.getLayer = (el) => {
            if (el) {
                this.layer = el;
                el.addEventListener('touchstart', preventDefault);
            }
        };
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
        if (!this.node)
            return;
        parent.removeChild(this.node);
        Overlay.allowScrolling();
    }
    render() {
        const _a = this.props, { className, parentSelector } = _a, other = __rest(_a, ["className", "parentSelector"]);
        return ReactDOM.createPortal(React.createElement("div", Object.assign({ className: classNames('image-slides-overlay', className), ref: this.getLayer }, other)), this.node);
    }
}
Overlay.defaultProps = {
    parentSelector() {
        return document.body;
    },
};
