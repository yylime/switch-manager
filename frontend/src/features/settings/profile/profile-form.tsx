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

  // const { fields, append } = useFieldArray({
  //   name: 'urls',
  //   control: form.control,
  // })
  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => {
      if (!currentUser?.id) {
        toast.error('Please login first.')
        throw new Error('Please login first.')
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
      showSubmittedData(form.getValues(), 'The following profile has been updated:')
      form.reset()
    },
    onError: (err: ApiError) => {
      const errorMessage =
        (typeof err === 'object' &&
          err !== null &&
          'body' in err &&
          (err as any).body?.detail?.message) ||
        (typeof err === 'object' &&
          err !== null &&
          'body' in err &&
          (err as any).body?.detail) ||
        err.message ||
        'An error occurred'
      toast.error(errorMessage)
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
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder={currentUser?.full_name ?? undefined} {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym. You can only change this once every 30 days.
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder={currentUser?.email ?? undefined} {...field} />
              </FormControl>
              <FormDescription>
                This is your public email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Tell us a little bit about yourself'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can <span>@mention</span> other users and organizations to
                link to them.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        {/* <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    URLs
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    Add links to your website, blog, or social media profiles.
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => append({ value: '' })}
          >
            Add URL
          </Button>
        </div> */}
        <Button type='submit'>Update profile</Button>
      </form>
    </Form>
  )
}
