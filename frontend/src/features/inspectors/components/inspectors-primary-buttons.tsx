import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInspectorsContext } from './inspectors-provider'

export function InspectorsPrimaryButtons() {
  const { setOpen } = useInspectorsContext()
  return (
    <div className='flex gap-2'>
      {/* <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Import</span> <Download size={18} />
      </Button> */}
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create</span> <Plus size={18} />
      </Button>
    </div>
  )
}
