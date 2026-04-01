import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TaskTable } from './components/tasks-table'
import { BackupTasksPrimaryButtons } from './components/tasks-primary-buttons'

export function TasksPage() {
  return (
    <>
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
            <h2 className='text-2xl font-bold tracking-tight'>任务列表</h2>
            <p className='text-muted-foreground'>
              后端任务列表，显示系统中正在运行和已完成的任务。您可以查看每个任务的状态、类型和相关信息。
            </p>
          </div>
          <BackupTasksPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <TaskTable />
        </div>
      </Main>
    </>
  )
}
