"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const analyticsData = [
  { date: "2024-04-01", conversations: 222, insights: 150, clarity: 85 },
  { date: "2024-04-02", conversations: 197, insights: 180, clarity: 78 },
  { date: "2024-04-03", conversations: 267, insights: 120, clarity: 92 },
  { date: "2024-04-04", conversations: 342, insights: 260, clarity: 88 },
  { date: "2024-04-05", conversations: 473, insights: 290, clarity: 95 },
  { date: "2024-04-06", conversations: 401, insights: 340, clarity: 89 },
  { date: "2024-04-07", conversations: 345, insights: 180, clarity: 91 },
  { date: "2024-04-08", conversations: 509, insights: 320, clarity: 87 },
  { date: "2024-04-09", conversations: 159, insights: 110, clarity: 93 },
  { date: "2024-04-10", conversations: 361, insights: 190, clarity: 86 },
  { date: "2024-04-11", conversations: 427, insights: 350, clarity: 90 },
  { date: "2024-04-12", conversations: 392, insights: 210, clarity: 94 },
  { date: "2024-04-13", conversations: 442, insights: 380, clarity: 88 },
  { date: "2024-04-14", conversations: 237, insights: 220, clarity: 92 },
  { date: "2024-04-15", conversations: 220, insights: 170, clarity: 89 },
  { date: "2024-04-16", conversations: 238, insights: 190, clarity: 91 },
  { date: "2024-04-17", conversations: 546, insights: 360, clarity: 85 },
  { date: "2024-04-18", conversations: 464, insights: 410, clarity: 87 },
  { date: "2024-04-19", conversations: 343, insights: 180, clarity: 93 },
  { date: "2024-04-20", conversations: 189, insights: 150, clarity: 90 },
  { date: "2024-04-21", conversations: 237, insights: 200, clarity: 88 },
  { date: "2024-04-22", conversations: 324, insights: 170, clarity: 92 },
  { date: "2024-04-23", conversations: 238, insights: 230, clarity: 86 },
  { date: "2024-04-24", conversations: 487, insights: 290, clarity: 94 },
  { date: "2024-04-25", conversations: 315, insights: 250, clarity: 89 },
  { date: "2024-04-26", conversations: 175, insights: 130, clarity: 91 },
  { date: "2024-04-27", conversations: 483, insights: 420, clarity: 87 },
  { date: "2024-04-28", conversations: 222, insights: 180, clarity: 93 },
  { date: "2024-04-29", conversations: 415, insights: 240, clarity: 90 },
  { date: "2024-04-30", conversations: 554, insights: 380, clarity: 85 },
]

const chartConfig = {
  conversations: {
    label: "Conversations",
    color: "hsl(var(--primary))",
  },
  insights: {
    label: "Insights Generated",
    color: "hsl(var(--secondary))",
  },
  clarity: {
    label: "Clarity Score",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

export function AnalyticsChart() {
  const [timeRange, setTimeRange] = React.useState("30d")

  const filteredData = analyticsData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-04-30")
    let daysToSubtract = 30
    if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "14d") {
      daysToSubtract = 14
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="col-span-4">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Conversation Analytics</CardTitle>
          <CardDescription>
            Track conversations, insights, and clarity metrics over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="14d" className="rounded-lg">
              Last 14 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillConversations" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-conversations)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-conversations)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillInsights" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-insights)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-insights)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="insights"
              type="natural"
              fill="url(#fillInsights)"
              stroke="var(--color-insights)"
              stackId="a"
            />
            <Area
              dataKey="conversations"
              type="natural"
              fill="url(#fillConversations)"
              stroke="var(--color-conversations)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
