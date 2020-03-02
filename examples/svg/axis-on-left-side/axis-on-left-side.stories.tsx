import * as React from 'react';
import * as classNames from 'classnames';
import * as D3Scale from 'd3-scale';
import * as D3Axis from 'd3-axis';
import * as D3Shape from 'd3-shape';
import { Axis } from '../../../src/axis/axis';
import * as style from './axis-on-left-side.scss';

const width = 200;
const height = 200;
const data: [number, number][] = [[0, 0], [1, 5], [2, 3], [3, 10], [4, 8]];

export default { title: 'Examples - SVG' };

export const axisOnLeftSide = () => {
    const scaleLeft = D3Scale.scaleLinear().domain([10, 20]).range([height, 0]);
    const axisLeft = D3Axis.axisLeft<number>(scaleLeft);

    const scaleX = D3Scale.scaleLinear().domain([0, 4]).range([0, width]);
    const scaleY = D3Scale.scaleLinear().domain([0, 10]).range([height, 0]);
    const line = D3Shape.line().x((data) => scaleX(data[0])).y((data) => scaleY(data[1]));

    return <div className={style.chart}>
        <svg className={style.plot}>
            <path d={line.context(null)(data)!} />
        </svg>
        <Axis className={classNames(style.axis, style.left)} axis={axisLeft} placement="left" />
    </div>;
};
