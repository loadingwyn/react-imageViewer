import { PureComponent, ReactNode } from 'react';
import { TransformedElement } from '../ImageController';
import './style.css';
declare type Operations = {
    close: (e?: MouseEvent | TouchEvent) => void;
    next: () => void;
    prev: () => void;
};
interface SlidesProps {
    images: string[];
    index: number;
    isOpen: boolean;
    showPageButton: boolean;
    tapClose: boolean;
    loadingIcon?: ReactNode;
    addon?: (index: number, operations: Operations) => ReactNode;
    onClose?: (e: MouseEvent | TouchEvent, index: number) => void;
    onChange?: (index: number) => void;
}
interface SlidesStates {
    index: number;
    focused: boolean;
    isOpen: boolean;
    prevIsOpen: boolean;
    prevIndex: number;
}
export default class ImageSlides extends PureComponent<SlidesProps, SlidesStates> {
    static defaultProps: {
        images: never[];
        index: number;
        showPageButton: boolean;
        tapClose: boolean;
        isOpen: boolean;
    };
    lastContainerOffsetX: number;
    initialStyle: {};
    imageController: {};
    containerEl: TransformedElement | null;
    containerOffsetX: number;
    constructor(props: Readonly<SlidesProps>);
    componentDidMount(): void;
    static getDerivedStateFromProps(props: SlidesProps, state: SlidesStates): Partial<SlidesStates> | null;
    getContainer: (el: HTMLElement | null) => void;
    getControl: () => void;
    handleContainerMove: (e: any) => void;
    move: (e: any) => () => void;
    handleTouchEnd: (e: any) => void;
    transition(time: number, direction: 'prev' | 'next' | 'noMove'): (timestamp: number) => void;
    getMedianIndex(): number;
    updatePosition: () => void;
    next: () => void;
    prev: () => void;
    handleCloseViewer: (e: MouseEvent) => void;
    render(): JSX.Element | null;
}
export {};
//# sourceMappingURL=index.d.ts.map