import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useDashboardSuccessCountByDay } from '../data/dashboard'


export function Overview() {
  const { data: dashboardSuccessCountByDay } = useDashboardSuccessCountByDay()
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={dashboardSuccessCountByDay}>
        <XAxis
          dataKey='time'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey='count'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
