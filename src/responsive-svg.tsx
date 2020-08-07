import * as React from 'react';
import { Size, SizeObserver } from './size-observer';

interface Props {
    children: React.ComponentType<Size>;
    onSizeChange?: (size: Size, previousSize: Size | null) => void;
    className?: string;
    style?: React.CSSProperties;
    forwardedRef?: (instance: SVGSVGElement | null) => void;
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

    private handleRef = (instance: SVGSVGElement | null) => {
        if (this.sizeObserver) {
            this.sizeObserver.off('sizechange', this.handleSizeChange);
            this.sizeObserver = null;
        }
        if (instance) {
            this.sizeObserver = new SizeObserver(instance).on('sizechange', this.handleSizeChange);
        }
        if (this.props.forwardedRef) {
            this.props.forwardedRef(instance);
        }
    };

    private renderChildren() {
        if (!this.state.size) {
            return;
        }

        return <this.props.children {...this.state.size} />;
    }

    public render() {
        const viewBox = this.state.size
            ? `0 0 ${this.state.size.width} ${this.state.size.height}`
            : '0 0 0 0';

        return <svg ref={this.handleRef} className={this.props.className} style={this.props.style} viewBox={viewBox}>
            {this.renderChildren()}
        </svg>;
    }
}
