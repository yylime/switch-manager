
import { DiffsService } from "@/client"
import { useQuery } from "@tanstack/react-query"

export type configQueryParams = {
  date?: string
}

export async function fetchConfigDiffs(params: configQueryParams = {}) {
  const config_date = params.date ?? ""
  const res = await DiffsService.getConfigDiffs({
    configDate: config_date,
  })
  return res
}

export function useConfigDiffs(params: configQueryParams = {}) {
  return useQuery({
    queryKey: ["switch_config", params.date],
    queryFn: () => fetchConfigDiffs(params),
  })
}

export async function fetchSwitchList() {
  const res = await DiffsService.getSwitchList()
  return res
}

export function useSwitchList() {
  return useQuery({
    queryKey: ["switch_list"],
    queryFn: () => fetchSwitchList(),
  })
}


export type switchConfigDatesQueryParams = {
  id?: string
}

export async function fetchSwitchConfigDates(params: switchConfigDatesQueryParams = {}) {
  const id = params.id ?? ""
  const res = await DiffsService.getSwitchConfigDate({
    id: id,
  })
  return res
}

export function useSwitchConfigDates(params: switchConfigDatesQueryParams = {}) {
  return useQuery({
    queryKey: ["switch_config_date_list", params.id ?? ""],
    queryFn: () => fetchSwitchConfigDates(params),
  })
}

export type switchConfigCompareQueryParams = {
  source_id?: string,
  source_date?: string,
  target_id?: string,
  target_date?: string
}

export async function fetchSwitchConfigDiffs(params: switchConfigCompareQueryParams = {}) {

  const res = await DiffsService.getSwitchConfigDiffs({
    sourceId: params.source_id ?? "",
    sourceDate: params.source_date ?? "",
    targetId: params.target_id ?? "",
    targetDate: params.target_date ?? ""
  })
  return res
}

export function usewitchConfigDiffs(params: switchConfigCompareQueryParams = {}) {
  return useQuery({
    queryKey: ["switch_config_compare", params.source_id, params.source_date, params.target_id, params.target_date],
    queryFn: () => fetchSwitchConfigDiffs(params),
  })
}









