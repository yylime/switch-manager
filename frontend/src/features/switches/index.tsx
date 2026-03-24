import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SwitchesDialogs } from './components/switches-dialogs'
import { SwitchesPrimaryButtons } from './components/switches-primary-buttons'
import { SwitchesProvider } from './components/switches-provider'
import { SwitchesTable } from './components/switches-table'

export function Switches() {
  return (
    <SwitchesProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>交换机管理</h2>
            <p className='text-muted-foreground'>
              点击交换机名称跳转到配置页面！
            </p>
          </div>
          
          <SwitchesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <SwitchesTable />
        </div>
      </Main>

      <SwitchesDialogs />
    </SwitchesProvider>
  )
}
