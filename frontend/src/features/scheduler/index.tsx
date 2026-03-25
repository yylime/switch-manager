import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SchedulerDialogs } from './components/scheduler-dialogs'
import { SchedulerPrimaryButtons } from './components/scheduler-primary-buttons'
import { SchedulerProvider } from './components/scheduler-provider'
import { SchedulerTable } from './components/scheduler-table'

export function Scheduler() {
  return (
    <SchedulerProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>定时任务</h2>
            <p className='text-muted-foreground'>
              定时任务管理列表
            </p>
          </div>
          <SchedulerPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <SchedulerTable />
        </div>
      </Main>

      <SchedulerDialogs />
    </SchedulerProvider>
  )
}
