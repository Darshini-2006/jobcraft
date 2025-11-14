'use client';

import { PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReadinessScoreProps = {
    readinessScore: number;
}

export function ReadinessScore({ readinessScore }: ReadinessScoreProps) {

  const chartData = [{ value: readinessScore }];

  const getStatus = () => {
    if (readinessScore >= 80) {
      return { text: 'Ready', className: 'text-green-500' };
    }
    if (readinessScore >= 50) {
      return { text: 'Improving', className: 'text-yellow-500' };
    }
    return { text: 'Needs Work', className: 'text-red-500' };
  };

  const status = getStatus();
  const fillColor = `hsl(var(--${readinessScore >= 80 ? 'primary' : readinessScore >= 50 ? 'chart-4' : 'destructive'}))`;


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
          config={{}}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={270}
            innerRadius={80}
            outerRadius={110}
            barSize={12}
            dataKey="value"
          >
            <PolarRadiusAxis
              tick={false}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <RadialBar
              dataKey="value"
              background
              cornerRadius={10}
              style={{ fill: fillColor }}
            />
             <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground"
              >
                <tspan
                  dy="-0.5em"
                  className="text-4xl font-bold"
                >
                  {readinessScore}%
                </tspan>
                <tspan
                  x="50%"
                  dy="1.5em"
                  className={cn("text-lg font-medium", status.className)}
                >
                  {status.text}
                </tspan>
              </text>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-2">
        <div className="flex items-center gap-2 font-medium leading-none text-center">
            You’re improving—keep practicing your SQL joins.
        </div>
        <div className="leading-none text-muted-foreground text-center">
          Score ≥ 80% is considered ready for interviews.
        </div>
      </CardFooter>
    </Card>
  );
}
