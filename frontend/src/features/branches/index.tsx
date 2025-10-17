import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { BranchesDialogs } from './components/branches-dialogs'
import { BranchesPrimaryButtons } from './components/branches-primary-buttons'
import { BranchesProvider } from './components/branches-provider'
import { BranchesTable } from './components/branches-table'

export function Branches() {
  return (
    <BranchesProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Branches</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your branches!
            </p>
          </div>
          <BranchesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <BranchesTable />
        </div>
      </Main>

      <BranchesDialogs />
    </BranchesProvider>
  )
}
