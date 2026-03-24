import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useMutation } from "@tanstack/react-query"

import { UsersService } from '@/client'
import type { ApiError } from "@/client/core/ApiError"
import useAuth from '@/hooks/use-auth'
import { handleServerError } from '@/lib/handle-server-error'


const PasswordFormSchema = z.object({
  current_password: z.string().min(1, '请输入当前密码'),
  new_password: z.string().min(8, '新密码必须至少包含8个字符'),
  confirm_password: z.string().min(8, '请输入确认密码'),
})

type PasswordFormValues = z.infer<typeof PasswordFormSchema>

// This can come from your database or API.
const defaultValues: Partial<PasswordFormValues> = {
  current_password: '',
  new_password: '',
  confirm_password: '',
}



export function PasswordForm() {
  const { logout } = useAuth()

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues,
  })


  const mutateMutation = useMutation({
    mutationFn: (data: PasswordFormValues) => {
      return UsersService.updatePasswordMe({
        requestBody: data,
      })
    },
    onSuccess: () => {
      logout()
      toast.success('密码更新成功，请重新登录')
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })

  function onSubmit(data: PasswordFormValues) {
    // 确认两次密码输入是否一致
    if (data.new_password !== data.confirm_password) {
      form.setError('confirm_password', {
        message: '两次输入的密码不一致',
      })
      toast.error('两次输入的密码不一致')
      return
    }
    // 退出登录，然后切换到登录界面
    mutateMutation.mutate(data)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='current_password'
            
            render={({ field }) => (
              <FormItem>
                <FormLabel>当前密码</FormLabel>
                <FormControl>
                  <Input autoComplete='current-password' placeholder='请输入当前密码' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='new_password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>新密码</FormLabel>
                <FormControl>
                  <Input autoComplete='new-password' type='password' placeholder='请输入新密码' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirm_password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <Input autoComplete='new-password' type='password' placeholder='请确认新密码' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit'>更新密码</Button>
        </form>
      </Form>
    </>
  )
}
