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
import transform from 'css3transform';
import React, { PureComponent } from 'react';
import AlloyFinger from 'alloyfinger/react/AlloyFinger';
import resizeImage from '../utils/resizeImage';
const VERTICAL_RANGE = 50;
const BUFFER = 2;
export default class ImageController extends PureComponent {
    constructor(props) {
        super(props);
        this.clientX = 0;
        this.clientY = 0;
        this.initScale = 1;
        this.style = {};
        this.unMount = false;
        this.target = null;
        this.getImageEl = (el) => {
            if (el) {
                transform(el);
                this.target = el;
            }
        };
        this.checkPosition = (deltaX, deltaY) => {
            if (!this.target)
                return;
            const { onExceedLimit, containerFocused } = this.props;
            const { desktopMode } = this.state;
            const { left, right, top, bottom } = this.target.getBoundingClientRect();
            const { translateX, translateY, originX, originY, scaleX, scaleY } = this.target;
            if (containerFocused && !desktopMode)
                return;
            const XcanMove = ((deltaX <= 0 || left < 0) && (deltaX >= 0 || right > window.innerWidth)) ||
                Math.abs(translateX + deltaX - originX * scaleX) < Math.abs(translateX - originX * scaleX);
            const YcanMove = ((deltaY < 0 || top < VERTICAL_RANGE) &&
                (deltaY > 0 || bottom > window.innerHeight - VERTICAL_RANGE)) ||
                Math.abs(translateY + deltaY - originY * scaleY) < Math.abs(translateY - originY * scaleY);
            // If the image overflows or is moving towards the center of screen, it should be abled to move.
            if (XcanMove) {
                this.target.translateX += deltaX;
            }
            else if (onExceedLimit && Math.abs(deltaY) < (YcanMove ? BUFFER : 20)) {
                // optimize for looong picture
                onExceedLimit();
            }
            if (YcanMove) {
                this.target.translateY += deltaY;
            }
        };
        this.reset = () => {
            if (!this.target)
                return;
            this.target.translateX = 0;
            this.target.translateY = 0;
            this.target.scaleX = 1;
            this.target.scaleY = 1;
            this.target.originX = 0;
            this.target.originY = 0;
        };
        this.handleMove = (e) => {
            e.preventDefault();
            window.requestAnimationFrame(() => this.checkPosition(parseInt(e.deltaX, 10), parseInt(e.deltaY, 10)));
        };
        // Refer to https://github.com/AlloyTeam/AlloyCrop.
        this.handleMultipointStart = (e) => {
            if (!this.target)
                return;
            const cr = this.target.getBoundingClientRect();
            const realX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
            const realY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
            const centerX = Math.min(Math.max(realX, cr.left), cr.left + cr.width);
            const centerY = Math.min(Math.max(realY, cr.top), cr.top + cr.height);
            const imgCenterX = cr.left + cr.width / 2;
            const imgCenterY = cr.top + cr.height / 2;
            const offX = centerX - imgCenterX;
            const offY = centerY - imgCenterY;
            const preOriginX = this.target.originX;
            const preOriginY = this.target.originY;
            this.target.originX = offX / this.target.scaleX;
            this.target.originY = offY / this.target.scaleY;
            this.target.translateX += offX - preOriginX * this.target.scaleX;
            this.target.translateY += offY - preOriginY * this.target.scaleX;
            this.initScale = this.target.scaleX;
        };
        this.handleDoubleClick = (e) => {
            const { desktopMode } = this.state;
            this.setState({
                desktopMode: !desktopMode,
            });
            e.origin = [e.clientX, e.clientY];
            this.handleDoubleTap(e);
        };
        this.handleDoubleTap = (e) => {
            if (!this.target)
                return;
            if (this.target.scaleX > 1) {
                this.reset();
            }
            else {
                const cr = this.target.getBoundingClientRect();
                const imgCenterX = cr.left + cr.width / 2;
                const imgCenterY = cr.top + cr.height / 2;
                const centerX = Math.min(Math.max(e.origin[0], cr.left), cr.left + cr.width);
                const centerY = Math.min(Math.max(e.origin[1], cr.top), cr.top + cr.height);
                const offX = centerX - imgCenterX;
                const offY = centerY - imgCenterY;
                const preOriginX = this.target.originX;
                const preOriginY = this.target.originY;
                this.target.originX = offX;
                this.target.originY = offY;
                this.target.translateX += offX - preOriginX * this.target.scaleX;
                this.target.translateY += offY - preOriginY * this.target.scaleX;
                const newScale = Math.max((window.innerWidth / cr.width) * 0.5, (window.innerHeight / cr.height) * 0.5, 2);
                this.target.scaleX = newScale;
                this.target.scaleY = newScale;
            }
        };
        this.handlePinch = (e) => {
            if (!this.target)
                return;
            const scale = Math.max(Math.min(4, this.initScale * e.scale), 1);
            this.target.scaleX = scale;
            this.target.scaleY = scale;
        };
        this.handleTouchEnd = (e) => {
            e.preventDefault();
        };
        this.handleMultipointEnd = (e) => {
            if (!this.target)
                return;
            if (this.target.scaleX <= 1 && e.scale < 1) {
                this.reset();
            }
        };
        this.handleMouseDown = (e) => {
            this.clientX = e.clientX;
            this.clientY = e.clientY;
            e.target.addEventListener('mousemove', this.handleMouseMove);
            e.target.addEventListener('mouseup', this.handleMouseUp);
        };
        this.handleMouseMove = (e) => {
            e.deltaX = e.clientX - this.clientX;
            e.deltaY = e.clientY - this.clientY;
            this.clientX = e.clientX;
            this.clientY = e.clientY;
            this.handleMove(e);
        };
        this.handleMouseUp = (e) => {
            e.target.removeEventListener('mousemove', this.handleMouseMove);
            e.target.removeEventListener('mouseup', this.handleMouseUp);
        };
        this.handleDrag = (e) => {
            e.preventDefault();
        };
        this.state = {
            isLoaded: false,
            desktopMode: false,
        };
    }
    componentDidMount() {
        const { url } = this.props;
        const loader = new Image();
        if (url) {
            new Promise((resolve, reject) => {
                loader.onload = resolve;
                loader.onerror = reject;
                loader.src = url;
            }).then(() => {
                if (!this.unMount) {
                    this.style = resizeImage(loader.naturalWidth, loader.naturalHeight);
                    this.setState({
                        isLoaded: true,
                    });
                }
            }, e => e);
        }
    }
    componentDidUpdate(prevProps) {
        const { presented } = this.props;
        if (prevProps.presented === true && presented === false) {
            this.reset();
        }
    }
    componentWillUnmount() {
        this.unMount = true;
    }
    render() {
        const { isLoaded } = this.state;
        const _a = this.props, { url, onExceedLimit, presented, loadingIcon, containerFocused } = _a, other = __rest(_a, ["url", "onExceedLimit", "presented", "loadingIcon", "containerFocused"]);
        let loading = loadingIcon;
        return isLoaded ? (React.createElement(AlloyFinger, { onTouchEnd: this.handleTouchEnd, onMultipointStart: this.handleMultipointStart, onMultipointEnd: this.handleMultipointEnd, onPressMove: this.handleMove, onDoubleTap: this.handleDoubleTap, onPinch: this.handlePinch },
            React.createElement("div", { className: "image-slides-blackboard", onDoubleClick: this.handleDoubleClick, onMouseDown: this.handleMouseDown },
                React.createElement("img", Object.assign({ onDragStart: this.handleDrag, className: "image-slides-content", src: url, ref: this.getImageEl, style: this.style }, other))))) : (React.createElement(AlloyFinger, { onPressMove: this.handleMove },
            React.createElement("div", { className: "image-slides-blackboard" },
                React.createElement("div", { ref: this.getImageEl }, loading))));
    }
}
ImageController.defaultProps = {
    presented: false,
    loadingIcon: (React.createElement("div", { className: "image-slides-loading" },
        React.createElement("div", null),
        React.createElement("div", null),
        React.createElement("div", null),
        React.createElement("div", null),
        React.createElement("div", null))),
};
