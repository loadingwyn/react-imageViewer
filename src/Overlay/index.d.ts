import React, { PureComponent } from 'react';
import './style.css';
interface OverlayProps {
    className?: string;
    parentSelector: () => HTMLElement;
}
export default class Overlay extends PureComponent<OverlayProps> {
    static defaultProps: {
        parentSelector(): HTMLElement;
    };
    static preventScrolling(): void;
    static allowScrolling(): void;
    node: HTMLDivElement;
    layer: HTMLDivElement | null;
    componentDidMount(): void;
    componentDidUpdate(prevProps: OverlayProps): void;
    componentWillUnmount(): void;
    getLayer: (el: HTMLDivElement) => void;
    render(): React.ReactPortal;
}
export {};
//# sourceMappingURL=index.d.ts.map