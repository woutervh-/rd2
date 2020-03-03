import * as React from 'react';
import { Size, SizeObserver } from './size-observer';

interface Props {
    onDraw: (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, abortSignal: AbortSignal) => void;
    onSizeChange?: (size: Size, previousSize: Size | null) => void;
    className?: string;
    style?: React.CSSProperties;
}

interface State {
    size: Size | null;
}

export class ResponsiveCanvas extends React.PureComponent<Props, State> {
    private canvas: HTMLCanvasElement | null = null;
    private sizeObserver: SizeObserver | null = null;
    private abortController: AbortController | null = null;

    public state: State = {
        size: null
    };

    public componentDidUpdate() {
        if (!this.canvas) {
            return;
        }
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        const context = this.canvas.getContext('2d')!;
        this.abortController = new AbortController();
        this.props.onDraw(context, this.canvas, this.abortController.signal);
    }

    public componentWillUnmount() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    private handleSizeChange = (size: Size) => {
        const previousSize = this.state.size;
        this.setState({ size }, () => {
            if (this.props.onSizeChange) {
                this.props.onSizeChange(size, previousSize);
            }
        });
    };

    private handleRef = (element: HTMLCanvasElement | null) => {
        if (this.sizeObserver) {
            this.sizeObserver.off('sizechange', this.handleSizeChange);
            this.sizeObserver = null;
        }
        if (element) {
            this.sizeObserver = new SizeObserver(element).on('sizechange', this.handleSizeChange);
        }
        this.canvas = element;
    };

    public render() {
        if (this.state.size) {
            return <canvas ref={this.handleRef} className={this.props.className} style={this.props.style} width={this.state.size.width} height={this.state.size.height} />;
        } else {
            return <canvas ref={this.handleRef} className={this.props.className} style={this.props.style} />;
        }
    }
}
