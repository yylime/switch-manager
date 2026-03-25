
import { VrfsService } from "@/client"
import { useQuery } from "@tanstack/react-query"

export type vrfsQueryParams = {
  page?: number
  pageSize?: number
  searchText?: string
}

export async function fetchVrfs(params: vrfsQueryParams = {}) {
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

export function useVrfs(params: vrfsQueryParams = {}) {
  return useQuery({
    queryKey: ["vrfs", params.page ?? 1, params.pageSize ?? 10, params.searchText ?? ""],
    queryFn: () => fetchVrfs(params),
  })
}





