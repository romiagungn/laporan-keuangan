"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Pie,
  PieChart as RechartsPieChart, // Renamed to avoid conflict
  Cell,
  Legend,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

interface ChartData {
  category: string;
  total: number;
}

interface CategoryChartProps {
  data: ChartData[];
  chartType?: "bar" | "pie";
}

const PIE_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#ff4d4d",
];

export function CategoryChart({ data, chartType = "bar" }: CategoryChartProps) {
  if (chartType === "pie") {
    const pieChartConfig = data.reduce((acc, item) => {
      acc[item.category] = {
        label: item.category,
        color: PIE_COLORS[Object.keys(acc).length % PIE_COLORS.length],
      };
      return acc;
    }, {} as ChartConfig);

    return (
      <ChartContainer
        config={pieChartConfig}
        className="mx-auto aspect-square h-[350px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => formatCurrency(value as number)} />}
            />
            <Pie data={data} dataKey="total" nameKey="category" innerRadius={60} strokeWidth={5}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={pieChartConfig[entry.category]?.color}
                />
              ))}
            </Pie>
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  // Default to Bar Chart
  const barChartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={barChartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("id-ID", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value)
            }
          />
          <Tooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(value as number)}
                hideLabel
              />
            }
          />
          <Bar dataKey="total" fill="var(--color-total)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
