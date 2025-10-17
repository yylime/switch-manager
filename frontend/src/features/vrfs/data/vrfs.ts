
import { VrfsService } from "@/client"
import { useQuery } from "@tanstack/react-query"

export type itemsQueryParams = {
  page?: number
  pageSize?: number
  searchText?: string
}

export async function fetchIptables(params: itemsQueryParams = {}) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const skip = (page - 1) * pageSize
  const res = await VrfsService.readVrfs({
    skip,
    limit: pageSize,
    searchText: params.searchText ?? "",
  })
  return res
}

export function useArptables(params: itemsQueryParams = {}) {
  return useQuery({
    queryKey: ["vrfs", params.page ?? 1, params.pageSize ?? 10, params.searchText ?? ""],
    queryFn: () => fetchIptables(params),
  })
}





