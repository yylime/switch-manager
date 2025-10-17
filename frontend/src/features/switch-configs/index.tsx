import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

import { Route } from '@/routes/_authenticated/switches/$switchId'
import { Badge } from "@/components/ui/badge"

import { SwitchConfigText } from './componets/config-text'
export function SwitchConfigPage() {
    const switchItem = Route.useLoaderData()
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
                        <h2 className='text-2xl font-bold tracking-tight'>{switchItem?.name}</h2>
                        <div className="flex flex-row gap-2 mt-2">
                            <Badge variant={"outline"}>IP: {switchItem.ip}</Badge> 
                            <Badge variant={"secondary"} >{switchItem.branch?.name}</Badge>
                            <Badge variant={"outline"}>堆叠: {switchItem.stack_num}</Badge>
                        </div>

                    </div>
                </div>
                <div className='-mx-4 flex-1 px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <SwitchConfigText switchId={switchItem.id as string} />
                </div>
            </Main>
        </>
    )
}
