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
import { type BranchPublic as Branch } from '@/client'
import type { ApiError } from "@/client/core/ApiError"
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { BranchesService } from '@/client'
import { handleServerError } from '@/lib/handle-server-error'


type BranchMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Branch
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
})
type BranchForm = z.infer<typeof formSchema>

export function BranchMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: BranchMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<BranchForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      name: '',
    },
  })

  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: (data: BranchForm) => BranchesService.createBranch({ requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), '如下的分址已创建:')
      form.reset()
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })
  const updateMutation = useMutation({
    mutationFn: (data: BranchForm) => BranchesService.updateBranch({ id: currentRow!.id, requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), '如下的分址已更新:')
      form.reset()
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })
  const onSubmit = (data: BranchForm) => {
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
          <SheetTitle>{isUpdate ? '更新' : '创建'} 分址</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? '修改分址的信息，点击确定提交。'
              : '增加一个新的分址，点击确定提交。'}
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
                    <Input {...field} placeholder='输入分址名称' />
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
            确定
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
