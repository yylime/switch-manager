import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { Link } from "@tanstack/react-router"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useDashboardBranchData } from '../data/dashboard'

export function TodayStatus() {
  const { data: branchData } = useDashboardBranchData()

  return (
    <div className='space-y-8'>
      {branchData?.map((branch) => (
        <Link 
          to="/switches" 
          search={{ branch: [String(branch.id)] }}
          key={branch.id}
          className="flex flex-col w-full"
        >
          <div className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarImage src='/avatars/01.png' alt='Avatar' />
              <AvatarFallback>{branch.branch.toString().slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-wrap items-center justify-between'>
              <Field className="w-full max-w-sm">
                <FieldLabel htmlFor="progress-upload">
                  <span>{branch.branch}</span>
                  <span className="text-gray-400">({branch.success}/{branch.total})</span>
                  <span className="ml-auto">{branch.rate}%</span>
                </FieldLabel>
                <Progress className={branch.rate as number <= 90 ? "[&>div]:bg-red-600" : ""} value={branch.rate as number} id={branch.branch as string} />
              </Field>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
