"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface SalesChartProps {
  data: {
    name: string
    total: number
    orders?: number
  }[]
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(142, 142, 160, 0.1)" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="left"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          hide={!data.some((item) => item.orders !== undefined)}
        />
        <Tooltip
          formatter={(value, name) => [name === "total" ? `$${value}` : value, name === "total" ? "Revenue" : "Orders"]}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="total"
          name="Revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
        {data.some((item) => item.orders !== undefined) && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
