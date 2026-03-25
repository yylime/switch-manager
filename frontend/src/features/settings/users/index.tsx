import { useEffect, useState } from 'react'
import useAuth from '@/hooks/use-auth'
import { UsersProvider } from './components/users-provider'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import { UsersDialogs } from './components/users-dialogs'

export function SettingsUsers() {
  const { user: currentUser } = useAuth()
  const [ready, setReady] = useState(false)

  // 等待 currentUser 初始化完成
  useEffect(() => {
    if (currentUser !== undefined) {
      setReady(true)
    }
  }, [currentUser])

  // 数据还没准备好，显示加载占位
  if (!ready) {
    return (
      <div className="flex w-auto flex-col">
        <div className="text-center py-12">
          <p className="text-muted-foreground">正在加载用户信息...</p>
        </div>
      </div>
    )
  }

  // 权限检查
  if (!currentUser?.is_superuser) {
    return (
      <div className="flex w-auto flex-col">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-red-600">无权限访问</h2>
          <p className="text-muted-foreground">只有超级管理员可以访问此页面</p>
        </div>
      </div>
    )
  }

  // 超级管理员内容
  return (
    <UsersProvider>
      <div className="flex-1 w-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">用户管理</h2>
            <p className="text-sm text-muted-foreground">管理系统用户</p>
          </div>
          <UsersPrimaryButtons />
        </div>

        <div className="flex-1 py-2">
          <UsersTable />
        </div>
      </div>
      <UsersDialogs />
    </UsersProvider>
  )
}