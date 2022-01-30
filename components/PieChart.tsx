import React, { useCallback, useMemo, useRef, useState } from "react";
import Pie, { ProvidedProps, PieArcDatum } from "@visx/shape/lib/shapes/Pie";
import { scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import { GradientPinkBlue } from "@visx/gradient";
import letterFrequency, {
  LetterFrequency,
} from "@visx/mock-data/lib/mocks/letterFrequency";
import browserUsage, {
  BrowserUsage as Browsers,
} from "@visx/mock-data/lib/mocks/browserUsage";
import {
  animated,
  useTransition,
  interpolate,
  SpringValue,
} from "react-spring";
import { Tooltip, useTooltip } from "@visx/tooltip";

// data and types
type BrowserNames = keyof Browsers;

interface BrowserUsage {
  label: BrowserNames;
  usage: number;
}

const letters: LetterFrequency[] = letterFrequency.slice(0, 4);
const browserNames = Object.keys(browserUsage[0]).filter(
  (k) => k !== "date"
) as BrowserNames[];
const browsers: BrowserUsage[] = browserNames.map((name) => ({
  label: name,
  usage: Number(browserUsage[0][name]),
}));

// accessor functions
const usage = (d: BrowserUsage) => d.usage;
const frequency = (d: LetterFrequency) => d.frequency;

const getLetterFrequencyColor = (holdings: HoldingData[]) =>
  scaleOrdinal({
    domain: holdings.map((l) => l.address),
    range: [
      "rgba(93,30,91,1)",
      "rgba(93,30,91,0.8)",
      "rgba(93,30,91,0.6)",
      "rgba(93,30,91,0.4)",
    ],
  });

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

export interface HoldingData {
  address: string;
  balance: number;
}

export type PieProps = {
  width: number;
  height: number;
  data: HoldingData[];
  margin?: typeof defaultMargin;
  animate?: boolean;
};

export default function PieChart({
  width,
  height,
  data,
  margin = defaultMargin,
  animate = true,
}: PieProps) {
  if (width < 10) return null;

  const {
    hideTooltip,
    showTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<HoldingData>();

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 50;

  const handleTooltipShow = useCallback(
    (e: React.MouseEvent<SVGPathElement, MouseEvent>, d) => {
      showTooltip({
        tooltipData: d,
        tooltipLeft: e.clientX,
        tooltipTop: e.clientY,
      });
    },
    [showTooltip]
  );
  const handleTooltipHide = useMemo(() => hideTooltip, [hideTooltip]);

  return (
    <div>
      <svg width={width} height={height} className="mx-auto">
        <rect
          rx={14}
          width={width}
          height={height}
          fill="url('#visx-pie-gradient')"
        />
        <Group top={centerY + margin.top} left={centerX + margin.left}>
          <Pie
            data={data}
            pieValue={(d) => d.balance}
            pieSortValues={() => -1}
            outerRadius={radius - donutThickness * 1.3}
          >
            {(pie) => (
              <AnimatedPie
                {...pie}
                animate={animate}
                getKey={({ data: { address } }) => address}
                onClickDatum={
                  ({ data: { address } }) => {}
                  // animate &&
                  // setSelectedAlphabetLetter(
                  //   selectedAlphabetLetter && selectedAlphabetLetter === letter ? null : letter,
                  // )
                }
                getColor={({ data: { address } }) =>
                  getLetterFrequencyColor(data)(address)
                }
                onMouseMove={handleTooltipShow}
                onMouseOut={handleTooltipHide}
              />
            )}
          </Pie>
        </Group>
      </svg>
      <div className={!tooltipOpen ? "hidden" : ""}>
        <Tooltip left={tooltipLeft} top={tooltipTop}>
          <div className="flex items-center justify-center">
            {/* <Box boxSize={2} bg={tooltipData?.color} rounded="full" mr={2} /> */}
            <div className="flex flex-col space-y-2">
              <span className="whitespace-nowrap">
                <strong>Address:</strong> {tooltipData?.address}
              </span>
              <span className=" whitespace-nowrap">
                <strong>Holding:</strong> {tooltipData?.balance}
              </span>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}

// react-spring transition definitions
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  delay?: number;
  onMouseMove?: (
    e: React.MouseEvent<SVGPathElement, MouseEvent>,
    data: HoldingData
  ) => void;
  onMouseOut?: () => void;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
  onMouseMove,
  onMouseOut,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });

  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
    const address = (arc.data as any).address;
    const balance = (arc.data as any).balance;

    return (
      <AnimatedPieTemplate
        address={address}
        balance={balance}
        startAngle={props.startAngle}
        endAngle={props.endAngle}
        arc={arc}
        key={key}
        opacity={props.opacity}
        getColor={getColor}
        onClickDatum={onClickDatum}
        onMouseMove={onMouseMove}
        onMouseOut={onMouseOut}
        path={path}
        arcs={arcs}
        getKey={getKey}
      />
    );
  });
}

export interface AnimatedPieTemplateProps<Datum>
  extends Omit<AnimatedPieProps<Datum>, "pie"> {
  address: string;
  balance: string;
  startAngle: SpringValue<number>;
  arc: PieArcDatum<Datum>;
  endAngle: SpringValue<number>;
  key: any;
  opacity: SpringValue<number>;
}

function AnimatedPieTemplate<Datum>({
  path,
  arc,
  address,
  balance,
  key,
  ...props
}: AnimatedPieTemplateProps<Datum>) {
  const [centroidX, centroidY] = path.centroid(arc);
  const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

  const handleOnHover = useCallback(
    (e: React.MouseEvent<SVGPathElement, MouseEvent>) => {
      if (props.onMouseMove) {
        props.onMouseMove(e, {
          address: (arc.data as any).address,
          balance: (arc.data as any).balance,
        });
      }
    },
    [props.onMouseMove, (arc.data as any).address, (arc.data as any).balance]
  );

  return (
    <g key={key}>
      <animated.path
        // compute interpolated path d attribute from intermediate angle values
        d={interpolate(
          [props.startAngle, props.endAngle],
          (startAngle, endAngle) =>
            path({
              ...arc,
              startAngle,
              endAngle,
            })
        )}
        fill={props.getColor(arc)}
        onClick={() => props.onClickDatum(arc)}
        onTouchStart={() => props.onClickDatum(arc)}
        className="transition-all ease-in duration-200 hover:scale-125"
        onMouseMove={handleOnHover}
        onMouseOut={props.onMouseOut}
      />
      {hasSpaceForLabel && (
        <animated.g style={{ opacity: props.opacity }}>
          <text
            fill="white"
            x={centroidX}
            y={centroidY}
            dy=".33em"
            fontSize={9}
            textAnchor="middle"
            pointerEvents="none"
          >
            {props.getKey(arc)}
          </text>
        </animated.g>
      )}
    </g>
  );
}
