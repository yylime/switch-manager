import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Link } from '@tanstack/react-router'

import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

import { DatabaseBackupIcon, Table2Icon, LucideFileDiff, TableIcon } from "lucide-react"

import { useDashboard } from './data/dashboard'
import { Overview } from './components/overview'
import { TodayStatus } from './components/today-status'
export function Dashboard() {

  const { data: data } = useDashboard()

  // 提供默认值以防数据未加载
  // const data = dashboardData  as CardData

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>主页</h1>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Link to='/switches'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      配置备份
                    </CardTitle>
                    <DatabaseBackupIcon className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{data?.switch_backup_count}</div>
                    <p className='text-muted-foreground text-xs'>
                      {data?.switch_backup_error_count} 失败
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Link to='/vrfs'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      VRFs
                    </CardTitle>
                    <TableIcon className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{data?.vrf_count}</div>
                    <p className='text-muted-foreground text-xs'>
                      +{data?.vrf_diff_count} from last day
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Link to='/iptables'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>网段数量</CardTitle>
                    <Table2Icon className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{data?.iptable_count}</div>
                    <p className='text-muted-foreground text-xs'>
                       {(data?.iptable_diff_count ?? 0) > 0 ? "+" : "-"}{data?.iptable_diff_count ?? 0} from last day
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Link to='/diffs'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      配置变更
                    </CardTitle>
                    <LucideFileDiff className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{data?.config_diff_count}</div>
                    <p className='text-muted-foreground text-xs'>
                      详细信息
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>备份历史</CardTitle>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>当日备份情况</CardTitle>
                  <CardDescription>
                    低于90%会变成红色.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TodayStatus />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

// topNav removed because unused; keep for future UI work