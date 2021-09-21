import * as React from 'react';
import classNames from 'classnames';
import * as D3Scale from 'd3-scale';
import * as D3Selection from 'd3-selection';
import * as D3Axis from 'd3-axis';
import * as D3Shape from 'd3-shape';
import * as D3Zoom from 'd3-zoom';
import * as rbush from 'rbush';
import { BatchTasks, Sequential } from 'batch-tasks';
import { Axis } from '../../../src/axis/axis';
import * as style from './interactive-chart.scss';
import dataUrl from '../../data/large-dataset.json';

const width = 300;
const height = 300;

interface Data {
    all_speeds: number[]; // eslint-disable-line camelcase
    all_x1: number[][]; // eslint-disable-line camelcase
    all_x2: number[][]; // eslint-disable-line camelcase
    all_y1: number[][]; // eslint-disable-line camelcase
    all_y2: number[][]; // eslint-disable-line camelcase
    min_speed: number; // eslint-disable-line camelcase
    max_speed: number; // eslint-disable-line camelcase
    min_time: number; // eslint-disable-line camelcase
    max_time: number; // eslint-disable-line camelcase
    start: number;
    end: number;
}

interface Segment {
    points: [[number, number], [number, number]];
    speed: number;
}

const getData = async (abortSignal: AbortSignal) => {
    const response = await fetch(dataUrl, { signal: abortSignal });
    const body = await response.json();
    return body as Data; // eslint-disable-line @typescript-eslint/consistent-type-assertions
};

const draw = (segments: Segment[], scaleX: D3Scale.ScaleLinear<number, number>, scaleY: D3Scale.ScaleTime<number, number>, colorScale: D3Scale.ScaleLinear<string, string>, context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, abortSignal: AbortSignal) => {
    const line = D3Shape.line().x((data) => scaleX(data[0])).y((data) => scaleY(data[1])).context(context);

    const batches = BatchTasks.fromArrayAndSize(segments, 1000);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 1;
    Sequential.runAllTasks(
        batches,
        (segment) => {
            context.strokeStyle = colorScale(segment.speed);
            context.beginPath();
            line(segment.points);
            context.stroke();
        },
        abortSignal
    );
};

export default { title: 'Examples - canvas' };

export const interactiveChart = () => {
    const [data, setData] = React.useState<Data | null>(null);
    const [transform, setTransform] = React.useState<D3Zoom.ZoomTransform>(D3Zoom.zoomIdentity);
    const [mouseXY, setMouseXY] = React.useState<[number, number] | null>(null);
    const drawingAbortController = React.useRef<AbortController | null>(null);

    React.useEffect(
        () => {
            const abortController = new AbortController();
            getData(abortController.signal).then(setData);
            return () => {
                abortController.abort();
            };
        },
        []
    );

    const segments = React.useMemo(
        () => {
            if (!data) {
                return null;
            }

            const segments: Segment[] = [];
            let segmentIndex = 0;
            for (let i = 0; i < data.all_x1.length; i++) {
                let x1: number = data.start;
                let x2: number = data.start;
                let y1: number = data.min_time;
                let y2: number = data.min_time;

                for (let j = 0; j < data.all_x1[i].length; j++) {
                    const speed = data.min_speed + data.all_speeds[segmentIndex];
                    x1 += data.all_x1[i][j];
                    y1 += data.all_y1[i][j];
                    x2 += data.all_x2[i][j];
                    y2 += data.all_y2[i][j];

                    segments.push({ points: [[x1, y1], [x2, y2]], speed });
                    segmentIndex += 1;
                }
            }

            return segments;
        },
        [data]
    );

    const scales = React.useMemo(
        () => {
            if (!data) {
                return null;
            }

            let scaleX = D3Scale.scaleLinear().domain([data.start, data.end]).range([0, width]);
            scaleX = transform.rescaleX(scaleX);
            const xAxis = D3Axis.axisBottom<number>(scaleX);

            let scaleY = D3Scale.scaleTime().domain([data.min_time, data.max_time]).range([height, 0]);
            scaleY = transform.rescaleY(scaleY);
            const yAxis = D3Axis.axisLeft<Date>(scaleY);

            const colors = ['red', 'yellow', 'green', 'blue'];
            const colorScale = D3Scale.scaleLinear<string>()
                .domain(colors.map((_, index) => data.min_speed + index * (data.max_speed - data.min_speed) / (colors.length - 1)))
                .range(colors);

            return { scaleX, scaleY, xAxis, yAxis, colorScale };
        },
        [data, transform]
    );

    const zoomRef = React.useRef<D3Zoom.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement | null>();
    const handleCanvasRef = React.useCallback(
        (canvas: HTMLCanvasElement | null) => {
            if (zoomRef.current) {
                zoomRef.current.on('zoom', null);
                zoomRef.current = null;
            }

            canvasRef.current = canvas;
            if (!canvas || !segments || !scales) {
                return;
            }

            const zoomed = (event: D3Zoom.D3ZoomEvent<HTMLCanvasElement, unknown>) => {
                setTransform(event.transform);
            };

            const mouseMoved = (event: MouseEvent) => {
                setMouseXY(D3Selection.pointer(event));
            };

            const mouseOut = () => {
                setMouseXY(null);
            };

            const selection: D3Selection.Selection<HTMLCanvasElement, unknown, null, undefined> = D3Selection.select(canvas);
            zoomRef.current = D3Zoom.zoom<HTMLCanvasElement, unknown>().on('zoom', zoomed);
            zoomRef.current(selection);
            selection.on('mousemove', mouseMoved);
            selection.on('mouseout', mouseOut);

            const context = canvas.getContext('2d')!;
            drawingAbortController.current = new AbortController();
            draw(segments, scales.scaleX, scales.scaleY, scales.colorScale, context, canvas, drawingAbortController.current.signal);
        },
        [segments]
    );

    const segmentsIndex = React.useMemo(
        () => {
            if (!segments) {
                return null;
            }

            const bush = new rbush.default<rbush.BBox & { segment: Segment }>();
            for (const segment of segments) {
                bush.insert({
                    minX: segment.points[0][0],
                    minY: segment.points[0][1],
                    maxX: segment.points[1][0],
                    maxY: segment.points[1][1],
                    segment
                });
            }

            return bush;
        },
        [segments]
    );

    const intersectedSegments = React.useMemo(
        () => {
            if (!mouseXY || !segmentsIndex || !scales) {
                return null;
            }

            const mx1 = scales.scaleX.invert(mouseXY[0] - 5);
            const my1 = +scales.scaleY.invert(mouseXY[1] + 5);
            const mx2 = scales.scaleX.invert(mouseXY[0] + 5);
            const my2 = +scales.scaleY.invert(mouseXY[1] - 5);

            const matches = segmentsIndex.search({ minX: mx1, minY: my1, maxX: mx2, maxY: my2 });
            const segments: Segment[] = [];
            for (const match of matches) {
                const sx1 = scales.scaleX(match.segment.points[0][0]);
                const sy1 = scales.scaleY(match.segment.points[0][1]);
                const sx2 = scales.scaleX(match.segment.points[1][0]);
                const sy2 = scales.scaleY(match.segment.points[1][1]);
                const distance = Math.abs((sy2 - sy1) * mouseXY[0] - (sx2 - sx1) * mouseXY[1] + sx2 * sy1 - sy2 * sx1) / Math.sqrt(Math.pow(sy2 - sy1, 2) + Math.pow(sx2 - sx1, 2));
                if (distance <= 5) {
                    segments.push(match.segment);
                }
            }

            return segments;
        },
        [mouseXY, scales, segmentsIndex]
    );

    React.useEffect(
        () => {
            if (!segments || !canvasRef.current || !scales) {
                return;
            }

            if (drawingAbortController.current) {
                drawingAbortController.current.abort();
            }
            drawingAbortController.current = new AbortController();

            const context = canvasRef.current.getContext('2d')!;
            draw(segments, scales.scaleX, scales.scaleY, scales.colorScale, context, canvasRef.current, drawingAbortController.current.signal);

            return () => {
                if (drawingAbortController.current) {
                    drawingAbortController.current.abort();
                }
            };
        },
        [segments, scales]
    );

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    if (intersectedSegments && scales) {
        for (const segment of intersectedSegments) {
            minX = Math.min(minX, segment.points[0][0]);
            minY = Math.min(minY, segment.points[0][1]);
            maxX = Math.max(maxX, segment.points[1][0]);
            maxY = Math.max(maxY, segment.points[1][1]);
        }
        [minX, minY, maxX, maxY] = [scales.scaleX(minX), scales.scaleY(maxY), scales.scaleX(maxX), scales.scaleY(minY)];
    }

    return <React.Fragment>
        <div className={style.chart}>
            {
                scales
                    ? <React.Fragment>
                        <canvas ref={handleCanvasRef} className={style.plot} width={width} height={height} />
                        <svg className={style['plot-overlay']} width={width} height={height}>
                            {mouseXY
                                ? <circle cx={mouseXY[0]} cy={mouseXY[1]} r={5} />
                                : null
                            }
                            {intersectedSegments && scales
                                ? <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} />
                                : null
                            }
                        </svg>
                        <Axis className={classNames(style.axis, style.left)} axis={scales.yAxis} placement="left" />
                        <Axis className={classNames(style.axis, style.bottom)} axis={scales.xAxis} placement="bottom" />
                    </React.Fragment>
                    : <div className={style.plot}>Loading...</div>
            }
        </div>
        <div>
            Use mouse/touch to pan/zoom the chart.
        </div>
        <div>
            A circle with radius 5 around the mouse pointer will "select" segments.
        </div>
        <div>
            The circle around the mouse and the bounding box around selected segments are drawn.
        </div>
        {
            intersectedSegments
                ? <div>
                    {intersectedSegments.length} segment(s) near the mouse.
                </div>
                : null
        }
    </React.Fragment>;
};
