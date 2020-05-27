import * as React from 'react';
import * as D3Axis from 'd3-axis';
import * as D3Brush from 'd3-brush';
import * as D3Scale from 'd3-scale';
import { Brush } from './brush';
import { Axis } from '../axis/axis';

export default { title: 'Brush' };

let d3Brush = D3Brush.brush();
// Need to cast to any until PR is merged: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/42649
d3Brush = (d3Brush as any).keyModifiers(false); // eslint-disable-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any

export const brushZoom = () => {
    const [showBrush, setShowBrush] = React.useState(false);
    const [domain, setDomain] = React.useState([[0, 10], [0, 10]]);

    const scales = React.useMemo(
        () => {
            const scaleX = D3Scale.scaleLinear().domain(domain[0]).range([0, 200]);
            const scaleY = D3Scale.scaleLinear().domain(domain[1]).range([200, 0]);
            const axisLeft = D3Axis.axisLeft(scaleY);
            const axisBottom = D3Axis.axisBottom(scaleX);
            return { scaleX, scaleY, axisLeft, axisBottom };
        },
        [domain]
    );

    React.useEffect(
        () => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.shiftKey) {
                    setShowBrush(true);
                }
            };
            const handleKeyUp = (event: KeyboardEvent) => {
                if (!event.shiftKey) {
                    setShowBrush(false);
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
            };
        },
        []
    );

    const handleBrushEnd = React.useCallback(
        (event: D3Brush.D3BrushEvent<unknown>) => {
            // Since we are using an XY brush the selection is given as a pair of XY points.
            // Selection can be null if the user clicked without dragging.
            const selection = event.selection as [[number, number], [number, number]] | null; // eslint-disable-line @typescript-eslint/consistent-type-assertions

            if (selection === null) {
                return;
            }

            const x1 = scales.scaleX.invert(selection[0][0]);
            const y1 = scales.scaleY.invert(selection[1][1]);
            const x2 = scales.scaleX.invert(selection[1][0]);
            const y2 = scales.scaleY.invert(selection[0][1]);
            setShowBrush(false);
            setDomain([[x1, x2], [y1, y2]]);
        },
        [scales]
    );

    return <React.Fragment>
        <div style={{ display: 'grid', gridTemplateRows: '200px 50px', gridTemplateColumns: '50px 200px' }}>
            <Axis axis={scales.axisLeft} placement="left" style={{ width: '50px', height: '200px', overflow: 'visible' }} />
            <svg style={{ backgroundColor: 'rgba(0, 0, 0, 20%)' }} width={200} height={200}>
                {
                    showBrush
                        ? <Brush brush={d3Brush} onEnd={handleBrushEnd} />
                        : null
                }
            </svg>
            <div />
            <Axis axis={scales.axisBottom} placement="bottom" style={{ width: '200px', height: '50px', overflow: 'visible' }} />
        </div>
        <div>
            Hold SHIFT and drag a box in the chart above to zoom in on that box.
        </div>
        <div>
            <button onClick={() => setDomain([[0, 10], [0, 10]])}>
                Reset zoom
            </button>
        </div>
    </React.Fragment>;
};

export const brushDraw = () => {
    const [selectedRange, setSelectedRange] = React.useState<[[number, number], [number, number]] | null>(null);

    const scales = React.useMemo(
        () => {
            const scaleX = D3Scale.scaleLinear().domain([0, 10]).range([0, 200]);
            const scaleY = D3Scale.scaleLinear().domain([0, 10]).range([200, 0]);
            const axisLeft = D3Axis.axisLeft(scaleY);
            const axisBottom = D3Axis.axisBottom(scaleX);
            return { scaleX, scaleY, axisLeft, axisBottom };
        },
        []
    );

    const handleBrushEnd = React.useCallback(
        (event: D3Brush.D3BrushEvent<unknown>) => {
            // Since we are using an XY brush the selection is given as a pair of XY points.
            // Selection can be null if the user clicked without dragging.
            const selection = event.selection as [[number, number], [number, number]] | null; // eslint-disable-line @typescript-eslint/consistent-type-assertions

            if (selection === null) {
                return;
            }

            const x1 = scales.scaleX.invert(selection[0][0]);
            const y1 = scales.scaleY.invert(selection[1][1]);
            const x2 = scales.scaleX.invert(selection[1][0]);
            const y2 = scales.scaleY.invert(selection[0][1]);
            setSelectedRange([[x1, y1], [x2, y2]]);
        },
        [scales]
    );

    const brushRef = React.useRef<Brush<unknown> | null>(null);

    const handleClearClick = React.useCallback(
        () => {
            if (brushRef.current) {
                brushRef.current.clearSelection();
            }
            setSelectedRange(null);
        },
        []
    );

    return <React.Fragment>
        <div style={{ display: 'grid', gridTemplateRows: '200px 50px', gridTemplateColumns: '50px 200px' }}>
            <Axis axis={scales.axisLeft} placement="left" style={{ width: '50px', height: '200px', overflow: 'visible' }} />
            <svg style={{ backgroundColor: 'rgba(0, 0, 0, 20%)' }} width={200} height={200}>
                <Brush ref={brushRef} brush={d3Brush} onEnd={handleBrushEnd} />
            </svg>
            <div />
            <Axis axis={scales.axisBottom} placement="bottom" style={{ width: '200px', height: '50px', overflow: 'visible' }} />
        </div>
        <div>
            Drag rectangles in the chart above to create a selection.
        </div>
        <div>
            Selected: {
                selectedRange
                    ? `(${selectedRange[0][0]}, ${selectedRange[0][1]}) - (${selectedRange[1][0]}, ${selectedRange[1][1]})`
                    : 'nothing'
            }
        </div>
        <div>
            <button onClick={handleClearClick}>
                Clear selection
            </button>
        </div>
    </React.Fragment>;
};
