'use client';

import { ResponsiveContainer, Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface RadarDataPoint {
  dimension: string;
  value: number;
  fullMark: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  secondaryData?: RadarDataPoint[];
  primaryColor?: string;
  secondaryColor?: string;
  height?: number;
}

export default function RadarChart({
  data,
  secondaryData,
  primaryColor = '#2d9a89',
  secondaryColor = '#eb5a34',
  height = 400,
}: RadarChartProps) {
  // Merge data for overlaid view
  const mergedData = data.map((item, i) => ({
    dimension: item.dimension,
    A: item.value,
    B: secondaryData?.[i]?.value ?? 0,
    fullMark: item.fullMark,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={mergedData} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid
          stroke="#d6cfc2"
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: '#5a5046', fontSize: 11 }}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: '#b0a08a', fontSize: 10 }}
          tickCount={5}
        />
        <Radar
          name="Profile A"
          dataKey="A"
          stroke={primaryColor}
          fill={primaryColor}
          fillOpacity={0.2}
          strokeWidth={2}
        />
        {secondaryData && (
          <Radar
            name="Profile B"
            dataKey="B"
            stroke={secondaryColor}
            fill={secondaryColor}
            fillOpacity={0.15}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        )}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
