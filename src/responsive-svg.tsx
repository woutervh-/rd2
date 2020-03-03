import * as React from 'react';
import { Size, SizeObserver } from './size-observer';

interface Props {
    children: (size: Size) => React.ReactNode;
    onSizeChange?: (size: Size, previousSize: Size | null) => void;
    className?: string;
    style?: React.CSSProperties;
}

interface State {
    size: Size | null;
}

export class ResponsiveSVG extends React.PureComponent<Props, State> {
    private sizeObserver: SizeObserver | null = null;

    public state: State = {
        size: null
    };

    private handleSizeChange = (size: Size) => {
        const previousSize = this.state.size;
        this.setState({ size }, () => {
            if (this.props.onSizeChange) {
                this.props.onSizeChange(size, previousSize);
            }
        });
    };

    private handleRef = (element: SVGSVGElement | null) => {
        if (this.sizeObserver) {
            this.sizeObserver.off('sizechange', this.handleSizeChange);
            this.sizeObserver = null;
        }
        if (element) {
            this.sizeObserver = new SizeObserver(element).on('sizechange', this.handleSizeChange);
        }
    };

    private renderChildren() {
        if (!this.state.size) {
            return;
        }

        return this.props.children(this.state.size);
    }

    public render() {
        return <svg ref={this.handleRef} className={this.props.className} style={this.props.style}>
            {this.renderChildren()}
        </svg>;
    }
}
