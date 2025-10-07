"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#ff4d4d",
];

interface ChartData {
  category: string;
  total: number;
}

interface CategoryChartProps {
  data: ChartData[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  // Dynamically create chartConfig based on the data
  const chartConfig = data.reduce((acc, item) => {
    acc[item.category] = {
      label: item.category,
      color: COLORS[Object.keys(acc).length % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            innerRadius={60}
            strokeWidth={5}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartConfig[entry.category]?.color}
              />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
