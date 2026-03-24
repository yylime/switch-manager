import { useState } from 'react'
import { z } from 'zod'
import { type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
// import brand icons if you enable social login

import { cn } from '@/lib/utils'
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
import { PasswordInput } from '@/components/password-input'

import type { Body_login_login_access_token as AccessToken } from "@/client"
import useAuth from "@/hooks/use-auth"
import { useQueryClient } from '@tanstack/react-query'

const formSchema = z.object({
  username: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  // don't directly set auth here; we invalidate currentUser so it will be refetched
  const { loginMutation, resetError } = useAuth()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data: z.infer<typeof formSchema>) => {
    if (isLoading) return

    setIsLoading(true)
    resetError()

    try {
      await loginMutation.mutateAsync(data as AccessToken)

      // Let react-query refetch current user now that token exists
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] })

      // Redirect to the stored location or default to dashboard
      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })

      toast.success('登录成功')
    } catch (err) {
      toast.error('登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>账号</FormLabel>
              <FormControl>
                <Input id='username' placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput id='password' placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          登录
        </Button>

      </form>
    </Form>
  )
}
