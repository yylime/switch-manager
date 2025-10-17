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
import { type Switch } from '../data/schema'
import type { ApiError } from "@/client/core/ApiError"
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { SwitchesService } from '@/client'
import { toast } from 'sonner'
import { useSwitchLoginTypes, useBranches, useInspectors } from '../data/switches'
import { useEffect } from 'react'


type SwitchMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Switch
}

const formSchema = z.object({
  name: z.string().min(1, 'Please enter the switch name'),
  ip: z.string().min(1, 'Please enter the switch IP'),
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
      stype: currentRow.stype ?? "",
      sn: currentRow.sn ?? "",
      branch_id: currentRow.branch.id,
      login_type_id: '',
      inspector_id: '',
      description: currentRow.description ?? "",
    } : {
      name: '',
      ip: '',
      stype: '',
      sn: '',
      branch_id: '',
      login_type_id: '',
      inspector_id: '',
      description: '',
    },
  })
  

  useEffect(() => {
    if (isSwitchLoginTypesSuccess && switchLoginTypeOptions.length > 0 && !form.getValues('login_type_id')) {
      form.setValue('login_type_id', switchLoginTypeOptions[0].value) // 默认第一个
    }
  }, [isSwitchLoginTypesSuccess, switchLoginTypeOptions, form])

  useEffect(() => {
    if (isBranchesSuccess && branchOptions.length > 0 && !form.getValues('branch_id')) {
      form.setValue('branch_id', branchOptions[0].value) // 默认第一个
    }
  }, [isBranchesSuccess, branchOptions, form])

  useEffect(() => {
    if (isInspectorsSuccess && inspectorOptions.length > 0 && !form.getValues('inspector_id')) {
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
      showSubmittedData(form.getValues(), 'The following switch has been created:')
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
  
  const updateMutation = useMutation({
    mutationFn: (data: SwitchForm) => SwitchesService.updateSwitch({ id: currentRow!.id, requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['switches'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), 'The following switch has been updated:')
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
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Task</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the task by providing necessary info.'
              : 'Add a new task by providing necessary info.'}
            Click save when you&apos;re done.
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a name' />
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
                  <FormLabel>IP Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter an IP address' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='login_type_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Login Type</FormLabel>
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
                        <CommandEmpty>No login type found.</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {switchLoginTypeOptions.map((loginType) => (
                              <CommandItem
                                value={loginType.label}
                                key={loginType.value}
                                onSelect={() => {
                                  form.setValue('login_type_id', loginType.value)
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
                  <FormDescription>
                    This is the login_type that will be used in the switch.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* branch */}
            <FormField
              control={form.control}
              name='branch_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Branch</FormLabel>
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
                        <CommandInput placeholder='Search branch...' />
                        <CommandEmpty>No branch found.</CommandEmpty>
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
                    This is the branch that will be used in the switch.
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
                  <FormLabel>Inspector Select</FormLabel>
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
                        <CommandInput placeholder='Search inspector...' />
                        <CommandEmpty>No inspector found.</CommandEmpty>
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
                    This is the inspector that will be used in the switch.
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a description' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form='tasks-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
