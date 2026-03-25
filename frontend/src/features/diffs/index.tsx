import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DiffViewer } from './components/diff-table'
import { ConfigCompare } from './components/compare'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function DiffsPage() {
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
        <div className='mb-2 flex items-center justify-between space-y-2 pb-2'>
          <h1 className='text-2xl font-bold tracking-tight'>配置分析</h1>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-1'
        >
          <div className='w-full overflow-x-auto'>
            <TabsList>
              <TabsTrigger value='overview'>配置变更</TabsTrigger>
              <TabsTrigger value='analytics'>配置对比</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <DiffViewer />
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <ConfigCompare />
          </TabsContent>
        </Tabs>
      </Main>

    </>
  )
}
