import React, { PureComponent, ReactNode } from 'react';
interface ControllerProps {
    presented: boolean;
    url: string;
    onExceedLimit: () => void;
    containerFocused: boolean;
    loadingIcon: ReactNode;
}
interface ControllerStates {
    isLoaded: boolean;
    desktopMode: boolean;
}
export interface TransformedElement extends HTMLElement {
    translateX: number;
    translateY: number;
    originX: number;
    originY: number;
    scaleX: number;
    scaleY: number;
}
export default class ImageController extends PureComponent<ControllerProps, ControllerStates> {
    static defaultProps: {
        presented: boolean;
        loadingIcon: JSX.Element;
    };
    clientX: number;
    clientY: number;
    initScale: number;
    style: {};
    unMount: boolean;
    target: TransformedElement | null;
    constructor(props: Readonly<ControllerProps>);
    componentDidMount(): void;
    componentDidUpdate(prevProps: ControllerProps): void;
    componentWillUnmount(): void;
    getImageEl: (el: HTMLElement | null) => void;
    checkPosition: (deltaX: number, deltaY: number) => void;
    reset: () => void;
    handleMove: (e: any) => void;
    handleMultipointStart: (e: any) => void;
    handleDoubleClick: (e: any) => void;
    handleDoubleTap: (e: any) => void;
    handlePinch: (e: any) => void;
    handleTouchEnd: (e: React.SyntheticEvent<Element, Event>) => void;
    handleMultipointEnd: (e: any) => void;
    handleMouseDown: (e: any) => void;
    handleMouseMove: (e: any) => void;
    handleMouseUp: (e: any) => void;
    handleDrag: (e: any) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=index.d.ts.map