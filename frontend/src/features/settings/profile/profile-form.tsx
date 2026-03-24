import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// import { Link } from '@tanstack/react-router'
import { showSubmittedData } from '@/lib/show-submitted-data'
// import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { Textarea } from '@/components/ui/textarea'
import useAuth from '@/hooks/use-auth'
import { UsersService } from '@/client'
import type { ApiError } from "@/client/core/ApiError"
import { useEffect } from 'react'
import { handleServerError } from '@/lib/handle-server-error'

const profileFormSchema = z.object({
  full_name: z
    .string('Please enter your username.')
    .min(2, 'Username must be at least 2 characters.')
    .max(30, 'Username must not be longer than 30 characters.'),
  email: z.email({
    error: (iss) =>
      iss.input === undefined
        ? 'Please select an email to display.'
        : undefined,
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultValues: Partial<ProfileFormValues> = {
    full_name: '',
    email: '',
  }

// This can come from your database or API.

export function ProfileForm() {
  const { user: currentUser } = useAuth()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (currentUser) {
      form.reset({
        full_name: currentUser.full_name ?? '',
        email: currentUser.email ?? '',
      })
    }
  }, [currentUser, form])

  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => {
      if (!currentUser?.id) {
        toast.error('请登录。')
        throw new Error('请登录。')
      }
      return UsersService.updateUser({
        requestBody: data,
        userId: currentUser.id
      })
    },
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      // 关闭 drawer 并清理当前行
      showSubmittedData(form.getValues(), '个人资料已更新:')
      form.reset()
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })
  const onSubmit = (data: ProfileFormValues) => {
    createMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSubmit(data))}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='full_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder={currentUser?.full_name ?? undefined} {...field} />
              </FormControl>
              <FormDescription>
                这是你的用户名。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder={currentUser?.email ?? undefined} {...field} />
              </FormControl>
              <FormDescription>
                这是你的公开邮箱。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>更新资料</Button>
      </form>
    </Form>
  )
}
