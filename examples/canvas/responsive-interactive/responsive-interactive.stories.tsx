import * as React from 'react';
import * as classNames from 'classnames';
import * as D3Scale from 'd3-scale';
import * as D3Axis from 'd3-axis';
import * as D3Selection from 'd3-selection';
import * as D3Shape from 'd3-shape';
import * as D3Zoom from 'd3-zoom';
import { ResponsiveAxis } from '../../../src/axis/responsize-axis';
import * as style from './responsive-interactive.scss';
import { ResponsiveCanvas } from '../../../src/responsive-canvas';
import { Size } from '../../../src/size-observer';

const data: [number, number][] = [[0, 0], [1, 5], [2, 3], [3, 10], [4, 8]];

export default { title: 'Examples - canvas' };

export const responsiveInteractive = () => {
    const [transform, setTransform] = React.useState<D3Zoom.ZoomTransform>(D3Zoom.zoomIdentity);
    const zoomRef = React.useRef<D3Zoom.ZoomBehavior<HTMLElement, unknown> | null>(null);

    const handleOverlayRef = React.useCallback(
        (element: HTMLElement | null) => {
            if (zoomRef.current) {
                zoomRef.current.on('zoom', null);
                zoomRef.current = null;
            }

            if (!element) {
                return;
            }

            const zoomed = () => {
                // Global event is untyped. Refactor once https://github.com/d3/d3-selection/issues/191 is released.
                const event = D3Selection.event as D3Zoom.D3ZoomEvent<HTMLCanvasElement, unknown>; // eslint-disable-line @typescript-eslint/consistent-type-assertions
                // event.transform.
                setTransform(event.transform);
            };
            const selection: D3Selection.Selection<HTMLElement, unknown, null, undefined> = D3Selection.select(element);
            zoomRef.current = D3Zoom.zoom<HTMLElement, unknown>().on('zoom', zoomed);
            zoomRef.current(selection);
        },
        []
    );

    const handleDraw = React.useCallback(
        (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
            if (zoomRef.current) {
                // const currentTranslate = zoomRef.current.translateExtent();
                // zoomRef.current = zoomRef.current.extent([[0, 0], [canvas.width, canvas.height]]);
            }

            let scaleX = D3Scale.scaleLinear().domain([0, 4]).range([0, canvas.width]);
            scaleX = transform.rescaleX(scaleX);
            let scaleY = D3Scale.scaleLinear().domain([0, 10]).range([canvas.height, 0]);
            scaleY = transform.rescaleY(scaleY);
            const line = D3Shape.line().x((data) => scaleX(data[0])).y((data) => scaleY(data[1]));

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            line.context(context)(data);
            context.lineWidth = 1.5;
            context.strokeStyle = 'steelblue';
            context.stroke();
        },
        [transform]
    );

    const getLeftAxis = React.useCallback(
        (size: Size) => {
            let scaleLeft = D3Scale.scaleLinear().domain([10, 20]).range([size.height, 0]);
            scaleLeft = transform.rescaleY(scaleLeft);
            const axisLeft = D3Axis.axisLeft<number>(scaleLeft);
            return axisLeft;
        },
        [transform]
    );

    const getBottomAxis = React.useCallback(
        (size: Size) => {
            let scaleBottom = D3Scale.scaleLinear().domain([20, 30]).range([0, size.width]);
            scaleBottom = transform.rescaleX(scaleBottom);
            const axisBottom = D3Axis.axisBottom<number>(scaleBottom);
            return axisBottom;
        },
        [transform]
    );

    return <div className={style.chart}>
        <ResponsiveCanvas className={style.plot} onDraw={handleDraw} />
        <div ref={handleOverlayRef} className={style['plot-overlay']} />
        <ResponsiveAxis className={classNames(style.axis, style.left)} getAxis={getLeftAxis} placement="left" />
        <ResponsiveAxis className={classNames(style.axis, style.bottom)} getAxis={getBottomAxis} placement="bottom" />
    </div>;
};
