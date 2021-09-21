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

export class ResponsiveBrush<Datum> extends React.PureComponent<Props<Datum>, never> {
    private selection: D3Selection.Selection<SVGGElement, Datum, null, undefined> | null = null;
    private eventedBrush: D3Brush.BrushBehavior<Datum> | null = null;
    private sizeObserver: SizeObserver | null = null;

    public componentDidUpdate() {
        this.cleanupBrush();
        this.createBrush();
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

            if (element.ownerSVGElement) {
                this.sizeObserver = new SizeObserver(element.ownerSVGElement).on('sizechange', this.handleSizeChange);
            }
        }
    };

    private handleSizeChange = (size: Size) => {
        if (!this.eventedBrush) {
            return;
        }
        this.eventedBrush.extent([[0, 0], [size.width, size.height]]);

        if (!this.selection) {
            return;
        }
        this.selection.call(this.eventedBrush);

        // We could scale the current selection based on the previous and current size.
        // However, this makes little sense when the scales of a plot are not scaled exactly in the same way.
        // It's left to the user to move the selection when the plot changes its scales.
    };

    private handleStart = (event: D3Brush.D3BrushEvent<Datum>) => {
        if (this.props.onStart) {
            this.props.onStart(event);
        }
    };

    private handleBrush = (event: D3Brush.D3BrushEvent<Datum>) => {
        if (this.props.onBrush) {
            this.props.onBrush(event);
        }
    };

    private handleEnd = (event: D3Brush.D3BrushEvent<Datum>) => {
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

    public move(selection: D3Brush.BrushSelection) {
        if (this.eventedBrush && this.selection) {
            this.eventedBrush.move(this.selection, selection);
        }
    }

    public clear() {
        if (this.eventedBrush && this.selection) {
            this.eventedBrush.move(this.selection, null);
        }
    }

    public getSelection() {
        if (!this.selection) {
            return null;
        }
        const node = this.selection.node();
        if (!node) {
            return null;
        }
        return D3Brush.brushSelection(node);
    }

    public render() {
        return <g ref={this.handleRef} />;
    }
}
