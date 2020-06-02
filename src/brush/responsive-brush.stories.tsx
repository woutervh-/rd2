import * as React from 'react';
import * as D3Axis from 'd3-axis';
import * as D3Brush from 'd3-brush';
import * as D3Scale from 'd3-scale';
import { ResponsiveAxis } from '../axis/responsize-axis';
import { Size } from '../size-observer';
import { ResponsiveBrush } from './responsive-brush';

export default {
    title: 'Responsive brush'
};

let d3Brush = D3Brush.brush();
// Need to cast to any until PR is merged: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/42649
d3Brush = (d3Brush as any).keyModifiers(false); // eslint-disable-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any

export const responsiveBrush = () => {
    const [width, setWidth] = React.useState(200);
    const [height, setHeight] = React.useState(200);

    const handleWidthChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setWidth(+event.currentTarget.value);
        },
        []
    );

    const handleHeightChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setHeight(+event.currentTarget.value);
        },
        []
    );

    const getAxisBottom = (size: Size) => {
        const scaleBottom = D3Scale.scaleLinear().domain([0, 10]).range([0, size.width]);
        const axisBottom = D3Axis.axisBottom(scaleBottom);
        return axisBottom;
    };

    const getAxisLeft = (size: Size) => {
        const scaleLeft = D3Scale.scaleLinear().domain([0, 10]).range([size.height, 0]);
        const axisLeft = D3Axis.axisLeft(scaleLeft);
        return axisLeft;
    };

    return <React.Fragment>
        <div>
            Width: <input type="range" value={width} min={50} max={500} step={1} onChange={handleWidthChange} />
        </div>
        <div>
            Height: <input type="range" value={height} min={50} max={500} step={1} onChange={handleHeightChange} />
        </div>
        <div style={{ display: 'grid', gridTemplateRows: `${height}px 50px`, gridTemplateColumns: `50px ${width}px` }}>
            <ResponsiveAxis getAxis={getAxisLeft} placement="left" style={{ width: '100%', height: '100%', overflow: 'visible' }} />
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 20%)' }}>
                <svg style={{ width: '100%', height: '100%' }}>
                    <ResponsiveBrush brush={d3Brush} />
                </svg>
            </div>
            <div />
            <ResponsiveAxis getAxis={getAxisBottom} placement="bottom" style={{ width: '100%', height: '100%', overflow: 'visible' }} />
        </div>
    </React.Fragment>;
};
