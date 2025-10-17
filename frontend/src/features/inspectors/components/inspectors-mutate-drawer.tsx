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
import { type Inspector } from '../data/schema'
import type { ApiError } from "@/client/core/ApiError"
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { InspectorsService } from '@/client'
import { toast } from 'sonner'


type InspectorMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Inspector
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  password: z.string().min(1, 'Please enter the inspector password'),
  description: z.string().optional(),
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
      showSubmittedData(form.getValues(), 'The following inspector has been created:')
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
    mutationFn: (data: InspectorForm) => InspectorsService.updateInspector({ id: currentRow!.id, requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['inspectors'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), 'The following inspector has been updated:')
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
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a password' />
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
