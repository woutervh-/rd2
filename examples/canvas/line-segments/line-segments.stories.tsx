import * as React from 'react';
import classNames from 'classnames';
import * as D3Scale from 'd3-scale';
import * as D3Axis from 'd3-axis';
import * as D3Shape from 'd3-shape';
import { ResponsiveAxis } from '../../../src/axis/responsize-axis';
import * as style from './line-segments.scss';
import { ResponsiveCanvas } from '../../../src/responsive-canvas';
import { Size } from '../../../src/size-observer';
import dataUrl from '../../data/large-dataset.json';

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

const getData = async (abortSignal: AbortSignal) => {
    const response = await fetch(dataUrl, { signal: abortSignal });
    const body = await response.json();
    return body as Data; // eslint-disable-line @typescript-eslint/consistent-type-assertions
};

const getLeftAxis = (data: Data) => (size: Size) => {
    const scaleLeft = D3Scale.scaleTime().domain([data.min_time, data.max_time]).range([size.height, 0]);
    const axisLeft = D3Axis.axisLeft<Date>(scaleLeft);
    return axisLeft;
};

const getBottomAxis = (data: Data) => (size: Size) => {
    const scaleBottom = D3Scale.scaleLinear().domain([data.start, data.end]).range([0, size.width]);
    const axisBottom = D3Axis.axisBottom<number>(scaleBottom);
    return axisBottom;
};

const handleDraw = (data: Data) => (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
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

    const colors = ['red', 'yellow', 'green', 'blue'];
    const colorScale = D3Scale.scaleLinear<string>()
        .domain(colors.map((_, index) => data.min_speed + index * (data.max_speed - data.min_speed) / (colors.length - 1)))
        .range(colors);
    const scaleX = D3Scale.scaleLinear().domain([data.start, data.end]).range([0, canvas.width]);
    const scaleY = D3Scale.scaleTime().domain([data.min_time, data.max_time]).range([canvas.height, 0]);
    const line = D3Shape.line().x((data) => scaleX(data[0])).y((data) => scaleY(data[1])).context(context);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 1;
    for (const segment of segments) {
        context.strokeStyle = colorScale(segment.speed);
        context.beginPath();
        line(segment.points);
        context.stroke();
    }
};

export default { title: 'Examples - canvas' };

export const lineSegments = () => {
    const [data, setData] = React.useState<Data | null>(null);

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

    return <div className={style.chart}>
        {
            data
                ? <React.Fragment>
                    <ResponsiveCanvas className={style.plot} onDraw={handleDraw(data)} />
                    <ResponsiveAxis className={classNames(style.axis, style.left)} getAxis={getLeftAxis(data)} placement="left" />
                    <ResponsiveAxis className={classNames(style.axis, style.bottom)} getAxis={getBottomAxis(data)} placement="bottom" />
                </React.Fragment>
                : <div className={style.plot}>Loading...</div>
        }
    </div>;
};
