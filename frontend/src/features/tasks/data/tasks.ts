
import { TasksService } from "@/client"
import { useQuery } from "@tanstack/react-query"

export type itemsQueryParams = {
  page?: number
  pageSize?: number
  searchText?: string
  status?: Array<string>
}

export async function fetchTasks(params: itemsQueryParams = {}) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const skip = (page - 1) * pageSize
  const res = await TasksService.readBackupTasks({
    skip,
    limit: pageSize,
    searchText: params.searchText ?? "",
    status: params.status ?? [],
  })
  return res
}

export function useTasktables(params: itemsQueryParams = {}) {
  return useQuery({
    queryKey: ["tasks", params.page ?? 1, params.pageSize ?? 10, params.searchText ?? "", params.status ?? []],
    queryFn: () => fetchTasks(params),
  })
}





