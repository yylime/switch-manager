import {
  LayoutDashboard,
  ListTodo,
  Palette,
  Settings,
  Wrench,
  UserCog,
  ShieldCheck,
  Table2Icon,
  Users,
  GitCompareIcon,
} from 'lucide-react'

import { type SidebarData } from '../types'

export function makeSidebarData(is_superuser?: boolean): SidebarData {

return {
  
  navGroups: [
    {
      title: '通用',
      items: [
        {
          title: '主页',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '交换机',
          url: '/switches',
          icon: ListTodo,
        },
        {
          title: '配置分析',
          url: '/diffs',
          icon: GitCompareIcon,
        },
        {
          title: '常用表格',
          icon: Table2Icon,
          items: [
            {
              title: '业务地址',
              url: '/iptables',
            },
            {
              title: 'VRF',
              url: '/vrfs',
            },
            {
              title: 'ARP',
              url: '/arptables',
            },
          ],
        },
      ],
    },
    {
      title: '管理',
      items: [
        {
          title: '数据管理',
          icon: ShieldCheck,
          items: [
            {
              title: '分支管理',
              url: '/branches',
            },
            {
              title: '巡检账号',
              url: '/inspectors',
            },
            {
              title: '定时任务',
              url: '/scheduler',
            }
          ],
        },
      ],
    },
    {
      title: '系统设置',
      items: [
        {
          title: '设置',
          icon: Settings,
          items: [
            {
              title: '账户设置',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: '密码重置',
              url: '/settings/password',
              icon: Wrench,
            },
            ...(is_superuser
              ? [
                  {
                    title: '用户管理',
                    url: '/settings/users',
                    icon: Users,
                  },
                ]
              : []),
            {
              title: '外观设置',
              url: '/settings/appearance',
              icon: Palette,
            },
          ],
        },
      ],
    },
  ],
}
}