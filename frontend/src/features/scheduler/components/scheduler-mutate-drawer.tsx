import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
import { type BackupScheduler as Scheduler } from '@/client'
import type { ApiError } from "@/client/core/ApiError"
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { ScheduleService } from '@/client'
import { handleServerError } from '@/lib/handle-server-error'

import { schedulerFuchtionsOptions } from '../data/data'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

type SchedulerMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Scheduler
}

const cronRegex =
  /^(\*|([0-5]?\d))(\/\d+)?\s+(\*|(1?\d|2[0-3]))(\/\d+)?\s+(\*|(0?[1-9]|[12]\d|3[01]))\s+(\*|(0?[1-9]|1[0-2]))\s+(\*|[0-6])$/;


const formSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(20, '名称不能超过 20 个字符'),
  job_type: z.string().min(1, ''),
  cron: z
    .string()
    .regex(cronRegex, "Cron 格式错误，例如: 0 2 * * * 或 */5 * * * *"),
  enabled: z.boolean(),
})
type SchedulerForm = z.infer<typeof formSchema>

export function SchedulerMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: SchedulerMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<SchedulerForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      name: '',
      job_type: '',
      cron: '0 2 * * *',
      enabled: true,
    },
  })

  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: (data: SchedulerForm) => ScheduleService.createBackupJob({ requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['schedulers'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), '如下定时任务已创建：')
      form.reset()
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })
  const updateMutation = useMutation({
    mutationFn: (data: SchedulerForm) => ScheduleService.updateBackupJob({ id: currentRow!.id ?? "", requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['schedulers'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), '如下定时任务已更新：')
      form.reset()
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })
  const onSubmit = (data: SchedulerForm) => {
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
          <SheetTitle>{isUpdate ? '更新' : '创建'} 定时任务</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? '更新定时任务'
              : '创建一个新的定时任务'}
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
              name='job_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>任务类型</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-50 justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? schedulerFuchtionsOptions.find(
                              (f) => f.value === field.value
                            )?.label
                            : 'Select scheduler function'}
                          <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-50 p-0'>
                      <Command>
                        <CommandInput placeholder='Search scheduler function...' />
                        <CommandEmpty>没有找到任务</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {schedulerFuchtionsOptions.map((f) => (
                              <CommandItem
                                value={f.label}
                                key={f.value}
                                onSelect={() => {
                                  form.setValue('job_type', f.value)
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    'size-4',
                                    f.value === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {f.label}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                  <FormDescription>
                    当前仅支持两个任务：备份全部设备/备份上次失败的设备
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='cron'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>定时时间</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='输入描述信息' />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    参考cron表达式：分、时、日、月、周（0 2 * * *）表示每日两点执行
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='enabled'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>是否启用</FormLabel>
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
          <Button form='tasks-form' type='submit'>
            保存更改
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
