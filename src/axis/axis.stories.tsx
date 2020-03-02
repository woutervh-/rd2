import * as React from 'react';
import * as D3Axis from 'd3-axis';
import * as D3Scale from 'd3-scale';
import { Axis } from './axis';

export default { title: 'Axis' };

export const topAxis = () => {
    const scaleTop = D3Scale.scaleLinear().domain([0, 10]).range([0, 200]);
    const axisTop = D3Axis.axisTop(scaleTop);

    return <div style={{ display: 'grid', gridTemplateRows: '50px 200px', gridTemplateColumns: '200px' }}>
        <Axis axis={axisTop} placement="top" style={{ width: '200px', height: '50px', overflow: 'visible' }} />
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 20%)' }} />
    </div>;
};

export const leftAxis = () => {
    const scaleLeft = D3Scale.scaleLinear().domain([0, 10]).range([200, 0]);
    const axisLeft = D3Axis.axisLeft(scaleLeft);

    return <div style={{ display: 'grid', gridTemplateRows: '200px', gridTemplateColumns: '50px 200px' }}>
        <Axis axis={axisLeft} placement="left" style={{ width: '50px', height: '200px', overflow: 'visible' }} />
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 20%)' }} />
    </div>;
};

export const bottomAxis = () => {
    const scaleBottom = D3Scale.scaleLinear().domain([0, 10]).range([0, 200]);
    const axisBottom = D3Axis.axisBottom(scaleBottom);

    return <div style={{ display: 'grid', gridTemplateRows: '200px 50px', gridTemplateColumns: '200px' }}>
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 20%)' }} />
        <Axis axis={axisBottom} placement="bottom" style={{ width: '200px', height: '50px', overflow: 'visible' }} />
    </div>;
};

export const rightAxis = () => {
    const scaleRight = D3Scale.scaleLinear().domain([0, 10]).range([200, 0]);
    const axisRight = D3Axis.axisRight(scaleRight);

    return <div style={{ display: 'grid', gridTemplateRows: '200px', gridTemplateColumns: '200px 50px' }}>
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 20%)' }} />
        <Axis axis={axisRight} placement="right" style={{ width: '50px', height: '200px', overflow: 'visible' }} />
    </div>;
};
