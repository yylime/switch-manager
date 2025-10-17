import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
// import { TeamSwitcher } from './team-switcher'
import Auth from "@/hooks/use-auth"
export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { user } = Auth()
  
  // 处理user可能为null或undefined的情况，并映射属性
  const navUser = user ? { 
    name: user.full_name || user.email || '', 
    email: user.email || '' 
  } : { name: '', email: '' }
  
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={sidebarData.teams} /> */}

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}