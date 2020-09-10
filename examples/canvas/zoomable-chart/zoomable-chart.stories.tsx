import * as React from 'react';
import classNames from 'classnames';
import * as D3Scale from 'd3-scale';
import * as D3Axis from 'd3-axis';
import * as D3Shape from 'd3-shape';
import * as D3TimeFormat from 'd3-time-format';
import * as D3Zoom from 'd3-zoom';
import * as D3Selection from 'd3-selection';
import { Axis } from '../../../src/axis/axis';
import * as style from './zoomable-chart.scss';
import dataUrl from '../../data/small-dataset.json';

const width = 500;
const height = 500;

interface Data {
    // Underscores comes from data set.
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

const getData = async (abortSignal: AbortSignal) => {
    const response = await fetch(dataUrl, { signal: abortSignal });
    const body = await response.json();
    return body as Data; // eslint-disable-line @typescript-eslint/consistent-type-assertions
};

export default { title: 'Examples - canvas' };

export const zoomableChart = () => {
    const [data, setData] = React.useState<Data | null>(null);
    const [transform, setTransform] = React.useState<D3Zoom.ZoomTransform>(D3Zoom.zoomIdentity);

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

            const segments: { points: [[number, number], [number, number]], speed: number }[] = [];
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
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(
        () => {
            if (!segments || !canvasRef.current || !scales) {
                return;
            }
            const context = canvasRef.current.getContext('2d')!;
            const line = D3Shape.line().x((data) => scales.scaleX(data[0])).y((data) => scales.scaleY(data[1])).context(context);
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            context.lineWidth = 1;
            for (const segment of segments) {
                context.strokeStyle = scales.colorScale(segment.speed);
                context.beginPath();
                line(segment.points);
                context.stroke();
            }
        },
        [segments, canvasRef.current, scales]
    );

    const handleCanvasRef = React.useCallback(
        (canvas: HTMLCanvasElement | null) => {
            if (zoomRef.current) {
                zoomRef.current.on('zoom', null);
                zoomRef.current = null;
            }

            canvasRef.current = canvas;
            if (!canvas) {
                return;
            }

            const zoomed = (event: D3Zoom.D3ZoomEvent<HTMLCanvasElement, unknown>) => {
                setTransform(event.transform);
            };

            const selection: D3Selection.Selection<HTMLCanvasElement, unknown, null, undefined> = D3Selection.select(canvas);
            zoomRef.current = D3Zoom.zoom<HTMLCanvasElement, unknown>().on('zoom', zoomed);
            zoomRef.current(selection);
        },
        []
    );

    return <React.Fragment>
        <div>
            Use mouse or touch to zoom and pan the chart below.
        </div>
        <div className={style.chart}>
            {
                scales
                    ? <React.Fragment>
                        <canvas ref={handleCanvasRef} className={style.plot} width={width} height={height} />
                        <Axis className={classNames(style.axis, style.left)} axis={scales.yAxis} placement="left">
                            {scales
                                ? <g>
                                    <text className={style.label}>{D3TimeFormat.timeFormat('%b %d %Y %I:%M:%S')(scales.scaleY.invert(height / 2))}</text>
                                </g>
                                : null
                            }
                        </Axis>
                        <Axis className={classNames(style.axis, style.bottom)} axis={scales.xAxis} placement="bottom" />
                    </React.Fragment>
                    : <div className={style.plot}>Loading...</div>
            }
        </div>
    </React.Fragment>;
};
