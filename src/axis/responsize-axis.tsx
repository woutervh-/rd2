import * as React from 'react';
import * as D3Axis from 'd3-axis';
import * as D3Selection from 'd3-selection';
import { Size, SizeObserver } from '../size-observer';

interface Props<Domain> {
    getAxis: (size: Size) => D3Axis.Axis<Domain>;
    onSizeChange?: (size: Size, previousSize: Size | null) => void;
    placement: 'top' | 'left' | 'bottom' | 'right';
    className?: string;
    style?: React.CSSProperties;
}

interface State {
    size: Size | null;
}

export class ResponsiveAxis<Domain> extends React.PureComponent<Props<Domain>, State> {
    private selection: D3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
    private sizeObserver: SizeObserver | null = null;

    public state: State = {
        size: null
    };

    public componentDidUpdate(prevProps: Props<Domain>, prevState: State) {
        if (this.props.getAxis !== prevProps.getAxis || this.state.size !== prevState.size) {
            if (this.selection && this.state.size) {
                const axis = this.props.getAxis(this.state.size);
                this.selection.call(axis);
            }
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

    private handleContainerRef = (element: SVGElement | null) => {
        if (this.sizeObserver) {
            this.sizeObserver.off('sizechange', this.handleSizeChange);
            this.sizeObserver = null;
        }
        if (element) {
            this.sizeObserver = new SizeObserver(element).on('sizechange', this.handleSizeChange);
        }
    };

    private handleGroupRef = (element: SVGGElement | null) => {
        this.selection = null;
        if (element && this.state.size) {
            const axis = this.props.getAxis(this.state.size);
            this.selection = D3Selection.select(element);
            this.selection.call(axis);
        }
    };

    private getTransform(size: Size) {
        switch (this.props.placement) {
            case 'top':
                return `translate(0, ${size.height})`;
            case 'left':
                return `translate(${size.width}, 0)`;
            case 'bottom':
                return 'translate(0, 0)';
            case 'right':
                return 'translate(0, 0)';
        }
    }

    private renderGroup() {
        if (this.state.size) {
            return <g ref={this.handleGroupRef} transform={this.getTransform(this.state.size)} />;
        }
    }

    public render() {
        return <svg ref={this.handleContainerRef} className={this.props.className} style={this.props.style}>
            {this.renderGroup()}
            {this.props.children}
        </svg>;
    }
}
