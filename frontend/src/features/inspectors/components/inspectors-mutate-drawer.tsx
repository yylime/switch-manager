import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
// import { SelectDropdown } from '@/components/select-dropdown'
import { type InspectorPublic as  Inspector} from '@/client'
import type { ApiError } from "@/client/core/ApiError"
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { InspectorsService } from '@/client'
import { handleServerError } from '@/lib/handle-server-error'

type InspectorMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Inspector
}

const formSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(20, '名称不能超过 20 个字符'),
  password: z.string().min(1, '密码不能为空').max(40, '密码不能超过 40 个字符'),
  description: z.string().max(50, '描述不能超过 50 个字符').optional().or(z.literal('')),
})
type InspectorForm = z.infer<typeof formSchema>

export function InspectorMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: InspectorMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<InspectorForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      name: '',
      password: '',
      description: '',
    },
  })

  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: (data: InspectorForm) => InspectorsService.createInspector({ requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['inspectors'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), '如下巡检账号已创建：')
      form.reset()
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })
  const updateMutation = useMutation({
    mutationFn: (data: InspectorForm) => InspectorsService.updateInspector({ id: currentRow!.id, requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['inspectors'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), '如下巡检账号已更新：')
      form.reset()
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })
  const onSubmit = (data: InspectorForm) => {
    // do something with the form data
    if (isUpdate && currentRow) {
      // update logic here
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
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? '更新' : '创建'} 巡检账号</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? '更新巡检账号信息'
              : '创建一个新的巡检账号'}
            点击保存按钮完成操作。
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='输入名称' />
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
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='输入密码' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='输入描述信息' />
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
          <Button form='tasks-form' type='submit'>
            保存更改
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
