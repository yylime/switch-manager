import {
  LayoutDashboard,
  Monitor,
  ListTodo,
  HelpCircle,
  Bell,
  Palette,
  Settings,
  Wrench,
  UserCog,
  ShieldCheck,
  Table2Icon,
  DiffIcon,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {

  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '交换机',
          url: '/switches',
          icon: ListTodo,
        },
        {
          title: '配置变更',
          url: '/diffs',
          icon: DiffIcon,
        },
        // {
        //   title: 'Chats',
        //   url: '/chats',
        //   badge: '3',
        //   icon: MessagesSquare,
        // },
        // {
        //   title: '设备记录',
        //   url: '/users',
        //   icon: Users,
        // },
        {
          title: '常用表格',
          icon: Table2Icon,
          items: [
            {
              title: 'IP Tables',
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
      title: 'Management',
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
            // {
            //   title: 'Sign Up',
            //   url: '/sign-up',
            // },
            // {
            //   title: 'Forgot Password',
            //   url: '/forgot-password',
            // },
            // {
            //   title: 'OTP',
            //   url: '/otp',
            // },
          ],
        },
        // {
        //   title: 'Errors',
        //   icon: Bug,
        //   items: [
        //     {
        //       title: 'Unauthorized',
        //       url: '/errors/unauthorized',
        //       icon: Lock,
        //     },
        //     {
        //       title: 'Forbidden',
        //       url: '/errors/forbidden',
        //       icon: UserX,
        //     },
        //     {
        //       title: 'Not Found',
        //       url: '/errors/not-found',
        //       icon: FileX,
        //     },
        //     {
        //       title: 'Internal Server Error',
        //       url: '/errors/internal-server-error',
        //       icon: ServerOff,
        //     },
        //     {
        //       title: 'Maintenance Error',
        //       url: '/errors/maintenance-error',
        //       icon: Construction,
        //     },
        //   ],
        // },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
