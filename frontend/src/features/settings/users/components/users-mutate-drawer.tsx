import { useForm } from 'react-hook-form'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'

import { Checkbox } from '@/components/ui/checkbox'

import { type UserCreate, type UserUpdate, type UserPublic, ApiError } from '@/client'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { UsersService } from '@/client'
import { handleServerError } from '@/lib/handle-server-error'


type UserMutateDrawerProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: UserPublic
}

export function UserMutateDrawer({
    open,
    onOpenChange,
    currentRow,
}: UserMutateDrawerProps) {
    const isUpdate = !!currentRow

    // use separate types for create/update so forms match backend
    const form = useForm<Partial<UserCreate> & { password?: string }>({
        defaultValues: currentRow ? {
            full_name: currentRow.full_name ?? '',
            email: currentRow.email,
            password: '',
            is_active: currentRow.is_active ?? true,
            is_superuser: currentRow.is_superuser ?? false,
        } : {
            full_name: '',
            email: '',
            password: '',
            is_active: true,
            is_superuser: false,
        },
    })


    const queryClient = useQueryClient()
    const createMutation = useMutation({
        mutationFn: (data: UserCreate ) => UsersService.createUser({ requestBody: data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            onOpenChange(false)
            showSubmittedData(form.getValues(), '如下的用户已创建:')
            form.reset()
        },
        onError: (err: ApiError) => {
            handleServerError(err)
        },
    })

    const updateMutation = useMutation({
        mutationFn: (data: Partial<UserUpdate> & { password?: string }) => {
            const updateData: any = {
                email: data.email,
                full_name: data.full_name,
                is_active: data.is_active,
                is_superuser: data.is_superuser,
            } 
            if (data.password) {
                updateData.password = data.password
            }
            return UsersService.updateUser({ userId: currentRow!.id, requestBody: updateData })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            onOpenChange(false)
            showSubmittedData(form.getValues(), '如下的用户已更新:')
            form.reset()
        },
        onError: (err: ApiError) => {
            handleServerError(err)
        },
    })
    const onSubmit = (data: any) => {
        console.log('form data', data)
        if (isUpdate && currentRow) {
            updateMutation.mutate(data)
        } else {
            createMutation.mutate(data)
        }
    }

    return (
        <Sheet
            open={open}
            onOpenChange={(v) => {
                onOpenChange(v)
            }}
        >
            <SheetContent className='flex flex-col'>
                <SheetHeader className='text-start'>
                    <SheetTitle>{isUpdate ? '更新' : '创建'} 用户</SheetTitle>
                    <SheetDescription>
                        {isUpdate
                            ? '更新用户信息。'
                            : '添加新的用户信息。'}
                        点击保存完成操作。
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form
                        id='users-form'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='flex-1 space-y-6 overflow-y-auto px-4'
                    >
                        <FormField
                            control={form.control}
                            name='full_name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>全名</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value ?? ''} placeholder='输入全名' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>登录邮箱</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="email" type='email' {...field} value={field.value ?? ''} placeholder='输入登录邮箱' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>登录密码</FormLabel>
                                    <FormControl>
                                        <Input type='password' autoComplete='new-password' {...field} value={field.value ?? ''} placeholder='输入登录密码' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name='is_active'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>是否激活</FormLabel>
                                    <FormControl>
                                        <Checkbox
                                            checked={!!field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='is_superuser'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>是否为超级管理员</FormLabel>
                                    <FormControl>
                                        <Checkbox
                                            checked={!!field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>
                <SheetFooter className='gap-2'>
                    <SheetClose asChild>
                        <Button variant='outline'>关闭</Button>
                    </SheetClose>
                    <Button form='users-form' type='submit'>
                        保存更改
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
