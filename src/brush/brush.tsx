import * as React from 'react';
import * as D3Brush from 'd3-brush';
import * as D3Selection from 'd3-selection';
import { Size, SizeObserver } from '../size-observer';

interface Props<Datum> {
    brush: D3Brush.BrushBehavior<Datum>;
    onStart?: (event: D3Brush.D3BrushEvent<Datum>) => void;
    onBrush?: (event: D3Brush.D3BrushEvent<Datum>) => void;
    onEnd?: (event: D3Brush.D3BrushEvent<Datum>) => void;
}

export class Brush<Datum> extends React.PureComponent<Props<Datum>, never> {
    private selection: D3Selection.Selection<SVGGElement, Datum, null, undefined> | null = null;
    private eventedBrush: D3Brush.BrushBehavior<Datum> | null = null;
    private sizeObserver: SizeObserver | null = null;

    public componentDidUpdate(prevProps: Props<Datum>) {
        if (this.props.onStart !== prevProps.onStart || this.props.onBrush !== prevProps.onBrush || this.props.onEnd !== prevProps.onEnd) {
            this.cleanupBrush();
            this.createBrush();
        }
    }

    public componentWillUnmount() {
        this.cleanupBrush();
    }

    private handleRef = (element: SVGGElement | null) => {
        if (this.sizeObserver) {
            this.sizeObserver.off('sizechange', this.handleSizeChange);
            this.sizeObserver = null;
        }
        this.selection = null;
        this.cleanupBrush();
        if (element) {
            this.selection = D3Selection.select(element);
            this.createBrush();
            this.sizeObserver = new SizeObserver(element).on('sizechange', this.handleSizeChange);
        }
    };

    private handleSizeChange = (size: Size) => {
        if (!this.eventedBrush) {
            return;
        }

        this.eventedBrush.extent([[0, 0], [size.width, size.height]]);
    };

    private handleStart = () => {
        // Global event is untyped. Refactor once https://github.com/d3/d3-selection/issues/191 is released.
        const event = D3Selection.event as D3Brush.D3BrushEvent<Datum>; // eslint-disable-line @typescript-eslint/consistent-type-assertions
        if (this.props.onStart) {
            this.props.onStart(event);
        }
    };

    private handleBrush = () => {
        // Global event is untyped. Refactor once https://github.com/d3/d3-selection/issues/191 is released.
        const event = D3Selection.event as D3Brush.D3BrushEvent<Datum>; // eslint-disable-line @typescript-eslint/consistent-type-assertions
        if (this.props.onBrush) {
            this.props.onBrush(event);
        }
    };

    private handleEnd = () => {
        // Global event is untyped. Refactor once https://github.com/d3/d3-selection/issues/191 is released.
        const event = D3Selection.event as D3Brush.D3BrushEvent<Datum>; // eslint-disable-line @typescript-eslint/consistent-type-assertions
        if (this.props.onEnd) {
            this.props.onEnd(event);
        }
    };

    private cleanupBrush() {
        if (this.eventedBrush) {
            this.eventedBrush.on('start', null);
            this.eventedBrush.on('brush', null);
            this.eventedBrush.on('end', null);
        }
    }

    private createBrush() {
        this.eventedBrush = this.props.brush;
        if (this.props.onStart) {
            this.eventedBrush = this.eventedBrush.on('start', this.handleStart);
        }
        if (this.props.onBrush) {
            this.eventedBrush = this.eventedBrush.on('brush', this.handleBrush);
        }
        if (this.props.onEnd) {
            this.eventedBrush = this.eventedBrush.on('end', this.handleEnd);
        }
        if (this.selection) {
            this.selection.call(this.eventedBrush);
        }
    }

    public render() {
        return <g ref={this.handleRef} />;
    }
}
