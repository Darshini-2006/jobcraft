'use client';

import {
  Bar,
  BarChart,
  LabelList,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
} from '@/components/ui/chart';
import { GraduationCap } from 'lucide-react';

const chartData = [
  { month: 'january', desktop: 186, mobile: 80 },
  { month: 'february', desktop: 305, mobile: 200 },
  { month: 'march', desktop: 237, mobile: 120 },
  { month: 'april', desktop: 73, mobile: 190 },
  { month: 'may', desktop: 209, mobile: 130 },
  { month: 'june', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
} as const;

export function ReadinessScore() {
    const readinessScore = 78;
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Job Readiness
        </CardTitle>
        <GraduationCap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={270}
            innerRadius={80}
            outerRadius={110}
            barSize={12}
            dataKey="desktop"
          >
            <PolarRadiusAxis
              tick={false}
              tickLine={false}
              axisLine={false}
            >
              <LabelList
                content={({
                  viewBox,
                }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {readinessScore}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Ready
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="desktop"
              background
              cornerRadius={10}
              className="fill-primary"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-2">
        <div className="flex items-center gap-2 font-medium leading-none">
          Almost there! Keep up the great work.
        </div>
        <div className="leading-none text-muted-foreground">
          Score ≥ 80% is considered ready for interviews.
        </div>
      </CardFooter>
    </Card>
  );
}
