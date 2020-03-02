import * as React from 'react';
import * as D3Axis from 'd3-axis';
import * as D3Scale from 'd3-scale';
import { ResponsiveAxis } from './responsize-axis';
import { Size } from '../size-observer';

export default {
    title: 'Responsive axis'
};

export const topAxis = () => {
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

    const getAxis = (size: Size) => {
        const scaleTop = D3Scale.scaleLinear().domain([0, 10]).range([0, size.width]);
        const axisTop = D3Axis.axisTop(scaleTop);
        return axisTop;
    };

    return <React.Fragment>
        <div>
            Width: <input type="range" value={width} min={50} max={500} step={1} onChange={handleWidthChange} />
        </div>
        <div>
            Height: <input type="range" value={height} min={50} max={500} step={1} onChange={handleHeightChange} />
        </div>
        <div style={{ display: 'grid', gridTemplateRows: `50px ${height}px`, gridTemplateColumns: `${width}px` }}>
            <ResponsiveAxis getAxis={getAxis} placement="top" style={{ width: '100%', height: '100%', overflow: 'visible' }} />
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 20%)' }} />
        </div>
    </React.Fragment>;
};
