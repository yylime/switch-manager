import useAuth from '@/hooks/use-auth'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {

  const { logout } = useAuth()

  const handleSignOut = () => {
    logout()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='退出登录？'
      desc='您确定要退出登录吗？您需要重新登录才能访问您的账户。'
      confirmText='确定'
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
