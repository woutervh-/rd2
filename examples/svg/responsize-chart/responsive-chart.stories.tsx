import * as React from 'react';
import classNames from 'classnames';
import * as D3Scale from 'd3-scale';
import * as D3Axis from 'd3-axis';
import * as D3Shape from 'd3-shape';
import { ResponsiveAxis } from '../../../src/axis/responsize-axis';
import * as style from './responsive-chart.scss';
import { Size } from '../../../src/size-observer';
import { ResponsiveSVG } from '../../../src/responsive-svg';

const data: [number, number][] = [[0, 0], [1, 5], [2, 3], [3, 10], [4, 8]];

const getLeftAxis = (size: Size) => {
    const scaleLeft = D3Scale.scaleLinear().domain([10, 20]).range([size.height, 0]);
    const axisLeft = D3Axis.axisLeft<number>(scaleLeft);
    return axisLeft;
};

const getBottomAxis = (size: Size) => {
    const scaleBottom = D3Scale.scaleLinear().domain([20, 30]).range([0, size.width]);
    const axisBottom = D3Axis.axisBottom<number>(scaleBottom);
    return axisBottom;
};

const renderPlot = (size: Size) => {
    const scaleX = D3Scale.scaleLinear().domain([0, 4]).range([0, size.width]);
    const scaleY = D3Scale.scaleLinear().domain([0, 10]).range([size.height, 0]);
    const line = D3Shape.line().x((data) => scaleX(data[0])).y((data) => scaleY(data[1]));

    return <path d={line.context(null)(data)!} />;
};

export default { title: 'Examples - SVG' };

export const responsiveChart = () => {
    return <div className={style.chart}>
        <ResponsiveSVG className={style.plot}>
            {renderPlot}
        </ResponsiveSVG>
        <ResponsiveAxis className={classNames(style.axis, style.left)} getAxis={getLeftAxis} placement="left" />
        <ResponsiveAxis className={classNames(style.axis, style.bottom)} getAxis={getBottomAxis} placement="bottom" />
    </div>;
};
