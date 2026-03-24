
import { ScheduleService } from "@/client"
import { useQuery } from "@tanstack/react-query"

// export type InspectorsQueryParams = {
//   page?: number
//   pageSize?: number
//   searchText?: string
// }

export async function fetchScheduler() {
  const res = await ScheduleService.listBackupJobs()
  return res
}

export function useScheduler() {
  return useQuery({
    queryKey: ["schedulers"],
    queryFn: () => fetchScheduler(),
  })
}

