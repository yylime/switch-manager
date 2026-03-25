import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
// import { SelectDropdown } from '@/components/select-dropdown'

import { cn } from '@/lib/utils'
// import { type Switch } from '../data/schema'
import { SwitchPublic as Switch } from '@/client'
import type { ApiError } from "@/client/core/ApiError"
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { SwitchesService } from '@/client'
import { useSwitchLoginTypes, useBranches, useInspectors } from '../data/switches'
import { useEffect } from 'react'
import { handleServerError } from '@/lib/handle-server-error'


type SwitchMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Switch
}

const formSchema = z.object({
  name: z.string().min(1, 'Please enter the switch name'),
  ip: z.string().min(1, 'Please enter the switch IP'),
  port: z.number(),
  stype: z.string().optional(),
  sn: z.string().optional(),
  branch_id: z.string().min(1, 'Please select the branch'),
  login_type_id: z.string().min(1, 'Please select the login type'),
  inspector_id: z.string().min(1, 'Please select the inspector'),
  description: z.string().optional(),
})


type SwitchForm = z.infer<typeof formSchema>

export function SwitchMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: SwitchMutateDrawerProps) {
  const isUpdate = !!currentRow

  const { data: switchLoginTypeOptions = [], isSuccess: isSwitchLoginTypesSuccess } = useSwitchLoginTypes()
  const { data: branchOptions = [], isSuccess: isBranchesSuccess } = useBranches()
  const { data: inspectorOptions = [], isSuccess: isInspectorsSuccess } = useInspectors()


  const form = useForm<SwitchForm>({
   resolver: zodResolver(formSchema),
    defaultValues: currentRow ? {
      name: currentRow.name,
      ip: currentRow.ip,
      port: currentRow.port ?? 22,
      stype: currentRow.stype ?? "",
      sn: currentRow.sn ?? "",
      branch_id: currentRow.branch_id ?? "",
      login_type_id: currentRow.login_type_id ?? "",
      inspector_id: currentRow.inspector_id ?? "",
      description: currentRow.description ?? "",
    } : {
      name: '',
      ip: '',
      port: 22,
      stype: '',
      sn: '',
      branch_id: '',
      login_type_id: '',
      inspector_id: '',
      description: '',
    },
  })


  useEffect(() => {
    if (!isUpdate &&isSwitchLoginTypesSuccess && switchLoginTypeOptions.length > 0 && !form.getValues('login_type_id')) {
      form.setValue('login_type_id', switchLoginTypeOptions[0].value) // 默认第一个
    }
  }, [isSwitchLoginTypesSuccess, switchLoginTypeOptions, form])

  useEffect(() => {
    if (!isUpdate && isBranchesSuccess && branchOptions.length > 0 && !form.getValues('branch_id')) {
      form.setValue('branch_id', branchOptions[0].value) // 默认第一个
    }
  }, [isBranchesSuccess, branchOptions, form])

  useEffect(() => {
    if (!isUpdate && isInspectorsSuccess && inspectorOptions.length > 0 && !form.getValues('inspector_id')) {
      form.setValue('inspector_id', inspectorOptions[0].value) // 默认第一个
    }
  }, [isInspectorsSuccess, inspectorOptions, form])


  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: (data: SwitchForm) => SwitchesService.createSwitch({ requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['switches'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), '如下的交换机已创建:')
      form.reset()
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: SwitchForm) => SwitchesService.updateSwitch({ id: currentRow!.id, requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['switches'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), '如下的交换机已更新:')
      form.reset()
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })
  const onSubmit = (data: SwitchForm) => {
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
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? '更新' : '创建'} 交换机</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? '更新交换机信息。'
              : '添加新的交换机信息。'}
            点击保存完成操作。
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='switches-form'
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
              name='ip'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP 地址</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='输入 IP 地址' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex flex-1 items-center justify-between gap-4'>
              <FormField
                control={form.control}
                name='login_type_id'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>登录类型</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            className={cn(
                              'w-[200px] justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value
                              ? switchLoginTypeOptions.find(
                                (loginType) => loginType.value === field.value
                              )?.label
                              : 'Select login type'}
                            <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-[200px] p-0'>
                        <Command>
                          <CommandInput placeholder='Search login type...' />
                          <CommandEmpty>没有找到登录类型</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {switchLoginTypeOptions.map((loginType) => (
                                <CommandItem
                                  value={loginType.label}
                                  key={loginType.value}
                                  onSelect={() => {
                                    form.setValue('login_type_id', loginType.value)
                                    if (loginType.label === 'ssh') form.setValue('port', 22)
                                    else if (loginType.label === 'telnet') form.setValue('port', 23)
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      'size-4',
                                      loginType.value === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {loginType.label}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='port'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>连接端口</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value} placeholder='Port' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}

              />
            </div>
            {/* stype */}
            <FormField
                control={form.control}
                name='stype'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>操作系统</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value} placeholder='操作系统' />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      netmiko设备类型（cisco_ios、cisco_nxos、huawei（系统后端支持自动识别，仅支持思科，华为，华三）
                    </FormDescription>
                  </FormItem>
                )}

              />
            {/* branch */}
            <FormField
              control={form.control}
              name='branch_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>分址</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-[200px] justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? branchOptions.find(
                              (branch) => branch.value === field.value
                            )?.label
                            : 'Select branch'}
                          <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[200px] p-0'>
                      <Command>
                        <CommandInput placeholder='搜索分址...' />
                        <CommandEmpty>没有找到分址。</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {branchOptions.map((branch) => (
                              <CommandItem
                                value={branch.label}
                                key={branch.value}
                                onSelect={() => {
                                  form.setValue('branch_id', branch.value)
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    'size-4',
                                    branch.value === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {branch.label}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    这个分址将用于此交换机。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* inspector */}
            <FormField
              control={form.control}
              name='inspector_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>巡检账号选择</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-[300px] justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? inspectorOptions.find(
                              (inspector) => inspector.value === field.value
                            )?.label
                            : 'Select inspector'}
                          <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[300px] p-0'>
                      <Command>
                        <CommandInput placeholder='搜索巡检账号...' />
                        <CommandEmpty>没有找到巡检账号。</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {inspectorOptions.map((inspector) => (
                              <CommandItem
                                value={inspector.label}
                                key={inspector.value}
                                onSelect={() => {
                                  form.setValue('inspector_id', inspector.value)
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    'size-4',
                                    inspector.value === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {inspector.label}||{inspector.password}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    请选择正确的巡检账号，该账号用于交换机的巡检登录。
                  </FormDescription>
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
          <Button form='switches-form' type='submit'>
            保存更改
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
