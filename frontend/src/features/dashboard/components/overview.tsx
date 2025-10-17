import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { DatabaseBackupIcon, Table2Icon, LucideFileDiff, TableIcon} from "lucide-react"

const data = [
  {
    name: 'Jan',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Feb',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Mar',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Apr',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'May',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Jun',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Jul',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Aug',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Sep',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Oct',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Nov',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Dec',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
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
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export const dashBoardData = {
  switches: {
    label: "配置备份",
    value: "2001",
    change: -1.9,
    changeType: "down",
    icon: DatabaseBackupIcon,
    url: "/switches",
  },
  vrfs: {
    label: "VRF数量",
    value: "213",
    change: 3.2,
    changeType: "up",
    icon: TableIcon,
    url: "/vrfs",
  },
  iptables:{
    label: "网段数量",
    value: "12400",
    change: 5.6,
    changeType: "up",
    icon: Table2Icon,
    url: "/iptables",
  },
  diff: {
    label: "配置比对",
    value: "12",
    change: -0.8,
    changeType: "down",
    icon: LucideFileDiff,
    url: "/diffs",
  },
};