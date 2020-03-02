import * as React from 'react';
import * as classNames from 'classnames';
import * as D3Selection from 'd3-selection';
import * as D3Scale from 'd3-scale';
import * as D3Axis from 'd3-axis';
import * as D3Zoom from 'd3-zoom';
import { Axis } from '../../../src/axis/axis';
import * as style from './interactive-chart.scss';

const width = 200;
const height = 200;
const data: [number, number][] = [[0, 0], [1, 5], [2, 3], [3, 10], [4, 8]];

export default { title: 'Examples - SVG' };

const Circle = React.memo((props: { datum: [number, number], scaleX: D3Scale.ScaleLinear<number, number>, scaleY: D3Scale.ScaleLinear<number, number>, onClick: (datum: [number, number]) => void }) => {
    const [hover, setHover] = React.useState(false);
    const handleMouseOver = React.useCallback(
        () => {
            setHover(true);
        },
        []
    );
    const handleMouseOut = React.useCallback(
        () => {
            setHover(false);
        },
        []
    );
    const handleClick = React.useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            props.onClick(props.datum);
        },
        []
    );
    return <circle
        cx={props.scaleX(props.datum[0])}
        cy={props.scaleY(props.datum[1])}
        r={hover ? 8 : 5}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={handleClick}
    />;
});

export const interactiveChart = () => {
    const [transform, setTransform] = React.useState<D3Zoom.ZoomTransform>(D3Zoom.zoomIdentity);
    const [selected, setSelected] = React.useState<[number, number] | null>(null);

    const scales = React.useMemo(
        () => {
            let scaleX = D3Scale.scaleLinear().domain([-1, 5]).range([0, width]);
            scaleX = transform.rescaleX(scaleX);
            let scaleY = D3Scale.scaleLinear().domain([-2, 12]).range([height, 0]);
            scaleY = transform.rescaleY(scaleY);
            const axisLeft = D3Axis.axisLeft<number>(scaleY);
            const axisBottom = D3Axis.axisBottom<number>(scaleX);

            return {
                scaleX,
                scaleY,
                axisLeft,
                axisBottom
            };
        },
        [transform]
    );

    const zoomRef = React.useRef<D3Zoom.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const handleSvgRef = React.useCallback(
        (svg: SVGSVGElement | null) => {
            if (zoomRef.current) {
                zoomRef.current.on('zoom', null);
                zoomRef.current = null;
            }

            if (!svg) {
                return;
            }

            const zoomed = () => {
                // Global event is untyped. Refactor once https://github.com/d3/d3-selection/issues/191 is released.
                const event = D3Selection.event as D3Zoom.D3ZoomEvent<HTMLCanvasElement, unknown>; // eslint-disable-line @typescript-eslint/consistent-type-assertions
                setTransform(event.transform);
            };

            const selection: D3Selection.Selection<SVGSVGElement, unknown, null, undefined> = D3Selection.select(svg);
            zoomRef.current = D3Zoom.zoom<SVGSVGElement, unknown>().on('zoom', zoomed);
            zoomRef.current(selection);
        },
        []
    );

    const resetSelected = React.useCallback(
        () => {
            setSelected(null);
        },
        []
    );

    return <React.Fragment>
        <div className={style.chart}>
            <svg ref={handleSvgRef} className={style.plot} onClick={resetSelected}>
                {data.map((datum, index) => {
                    return <Circle key={index} datum={datum} scaleX={scales.scaleX} scaleY={scales.scaleY} onClick={setSelected} />;
                })}
            </svg>
            <Axis className={classNames(style.axis, style.left)} axis={scales.axisLeft} placement="left" />
            <Axis className={classNames(style.axis, style.bottom)} axis={scales.axisBottom} placement="bottom" />
        </div>
        <div>
            Hover over circles in the chart to highlight them.
        </div>
        <div>
            Click on circles in the chart to display their data.
        </div>
        <div>
            Use mouse/touch interaction to pan/zoom the chart.
        </div>
        <div>
            {
                selected === null
                    ? 'No data selected.'
                    : `Selected [${selected[0]}, ${selected[1]}].`
            }
        </div>
    </React.Fragment>;
};
