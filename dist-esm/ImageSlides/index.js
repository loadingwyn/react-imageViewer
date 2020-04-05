import React, { PureComponent } from 'react';
import transform from 'css3transform';
import AlloyFinger from 'alloyfinger/react/AlloyFinger';
import ImageController from '../ImageController';
import Overlay from '../Overlay';
import './style.css';
const GUTTER_WIDTH = 10;
const SWIPE_TRIGGER = 40;
function preload(url) {
    if (url) {
        const loader = new Image();
        return new Promise((resolve, reject) => {
            loader.onload = resolve;
            loader.onerror = reject;
            loader.src = url;
        }).catch(e => e);
    }
    return null;
}
export default class ImageSlides extends PureComponent {
    constructor(props) {
        super(props);
        this.lastContainerOffsetX = 0;
        this.initialStyle = {};
        this.imageController = {};
        this.containerEl = null;
        this.containerOffsetX = 0;
        this.getContainer = (el) => {
            if (el) {
                transform(el);
                this.containerEl = el;
            }
        };
        this.getControl = () => {
            const { focused } = this.state;
            if (!focused) {
                this.setState({
                    focused: true,
                });
            }
        };
        this.handleContainerMove = (e) => {
            e.persist();
            window.requestAnimationFrame(this.move(e));
            e.preventDefault();
            e.stopPropagation();
            if (e.changedTouches[0].pageX > window.innerWidth || e.changedTouches[0].pageX < 0) {
                this.handleTouchEnd(e);
            }
        };
        this.move = (e) => () => {
            if (!this.containerEl)
                return;
            const { focused } = this.state;
            if (focused) {
                this.containerEl.translateX += Math.floor(e.deltaX);
            }
        };
        this.handleTouchEnd = (e) => {
            e.preventDefault();
            if (!this.containerEl)
                return;
            const { focused, index } = this.state;
            if (focused) {
                const { onChange, images } = this.props;
                const boardWidth = GUTTER_WIDTH + window.innerWidth;
                const baseline = boardWidth * this.getMedianIndex();
                if (-this.containerEl.translateX - baseline > SWIPE_TRIGGER) {
                    const step = this.transition(160, 'next');
                    if (onChange && index < images.length - 1) {
                        onChange(index + 1);
                    }
                    window.requestAnimationFrame(step);
                }
                else if (baseline + this.containerEl.translateX > SWIPE_TRIGGER) {
                    const step = this.transition(160, 'prev');
                    if (onChange && index > 0) {
                        onChange(index - 1);
                    }
                    window.requestAnimationFrame(step);
                }
                else {
                    const step = this.transition(160, 'noMove');
                    window.requestAnimationFrame(step);
                }
                this.setState({
                    focused: false,
                });
            }
        };
        this.updatePosition = () => {
            if (!this.containerEl)
                return;
            this.containerEl.translateX = -(GUTTER_WIDTH + window.innerWidth) * this.getMedianIndex();
        };
        this.next = () => {
            const { index } = this.state;
            const { images } = this.props;
            if (index < images.length - 1) {
                preload(images[index + 2]);
                this.setState({
                    index: index + 1,
                }, this.updatePosition);
            }
            else {
                this.updatePosition();
            }
        };
        this.prev = () => {
            const { index } = this.state;
            const { images } = this.props;
            if (index > 0) {
                preload(images[index - 2]);
                this.setState({
                    index: index - 1,
                }, this.updatePosition);
            }
            else {
                this.updatePosition();
            }
        };
        this.handleCloseViewer = (e) => {
            const { index } = this.state;
            const { onClose } = this.props;
            this.setState({
                isOpen: false,
            });
            if (onClose)
                onClose(e, index);
        };
        const { index, isOpen } = props;
        this.state = {
            index,
            focused: false,
            isOpen,
            prevIsOpen: false,
            prevIndex: 0,
        };
    }
    componentDidMount() {
        const { images } = this.props;
        const { index } = this.state;
        preload(images[index]);
        preload(images[index + 1]);
        preload(images[index - 1]);
    }
    static getDerivedStateFromProps(props, state) {
        let newState = null;
        if (props.index !== state.prevIndex) {
            newState = {};
            newState.prevIndex = props.index;
            newState.index = props.index;
        }
        if (props.isOpen !== state.prevIsOpen) {
            if (!newState) {
                newState = {};
            }
            newState.prevIsOpen = props.isOpen;
            newState.isOpen = props.isOpen;
        }
        return newState;
    }
    transition(time, direction) {
        if (!this.containerEl)
            return () => { };
        const { index } = this.state;
        const { images } = this.props;
        const boardWidth = GUTTER_WIDTH + window.innerWidth;
        let startTime;
        const startPos = this.containerEl.translateX;
        const size = (index === 0 && direction === 'prev') ||
            (index === images.length - 1 && direction === 'next') ||
            direction === 'noMove'
            ? 0
            : 1;
        const step = (timestamp) => {
            if (!this.containerEl)
                return;
            if (!startTime)
                startTime = timestamp;
            const progress = timestamp - startTime;
            this.containerEl.translateX = Math.floor(startPos +
                (progress / time) *
                    (-boardWidth * (this.getMedianIndex() + (direction === 'next' ? size : -size)) -
                        startPos));
            if (progress < time) {
                window.requestAnimationFrame(step);
            }
            else if (direction === 'next') {
                this.next();
            }
            else if (direction === 'prev') {
                this.prev();
            }
            else {
                this.updatePosition();
            }
        };
        return step;
    }
    getMedianIndex() {
        const { index } = this.state;
        const { images } = this.props;
        const displayMax = index + 2 > images.length ? images.length : index + 2;
        const displayMin = index - 1 < 0 ? 0 : index - 1;
        let center = Math.floor((displayMax - displayMin) / 2);
        if (index < 1) {
            center = index;
        }
        else if (index > images.length - 2) {
            center = images.length - index;
        }
        return center;
    }
    render() {
        const { index, isOpen, focused } = this.state;
        const { images, addon, tapClose, loadingIcon, showPageButton } = this.props;
        const displayMax = index + 2 > images.length ? images.length : index + 2;
        const displayMin = index - 1 < 0 ? 0 : index - 1;
        return isOpen ? (React.createElement(Overlay, null,
            React.createElement("div", { className: "image-slides-view-port" },
                addon &&
                    addon(index, {
                        close: this.handleCloseViewer,
                        next: this.next,
                        prev: this.prev,
                    }),
                index > 0 && showPageButton ? (React.createElement("button", { className: "image-slides-page-button image-slides-prev", onClick: this.prev },
                    React.createElement("svg", { version: "1.1", id: "Layer_1", xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", width: "30px", height: "30px", viewBox: "0 0 24 24" },
                        React.createElement("path", { stroke: "#eee", fill: "#eee", d: "M15.41,16.59L10.83,12l4.58-4.59L14,6l-6,6l6,6L15.41,16.59z" })))) : null,
                index < images.length - 1 && showPageButton ? (React.createElement("button", { className: "image-slides-page-button image-slides-next", onClick: this.next },
                    React.createElement("svg", { version: "1.1", id: "Layer_1", xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", width: "30px", height: "30px", viewBox: "0 0 24 24" },
                        React.createElement("path", { stroke: "#eee", fill: "#eee", d: "M8.59,16.59L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.59z" })))) : null,
                React.createElement(AlloyFinger
                // onSwipe={this.handleSwipe}
                , { 
                    // onSwipe={this.handleSwipe}
                    onSingleTap: tapClose || this.handleCloseViewer, onTouchEnd: this.handleTouchEnd, onPressMove: this.handleContainerMove },
                    React.createElement("div", { className: "image-slides-container", ref: this.getContainer }, images.slice(displayMin, displayMax).map((url, ind) => (
                    /* eslint-disable */
                    React.createElement(ImageController, { containerFocused: focused, loadingIcon: loadingIcon, onExceedLimit: this.getControl, url: url, key: url + (ind + displayMin), presented: ind === this.getMedianIndex() })))))))) : null;
    }
}
ImageSlides.defaultProps = {
    images: [],
    index: 0,
    showPageButton: false,
    tapClose: true,
    isOpen: false,
};
