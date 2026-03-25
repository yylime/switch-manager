
import { SwitchesService } from "@/client"
import { useQuery } from "@tanstack/react-query"


export type switchQueryParams = {
  switch_id?: string
}

export async function fetchSwitch(params: switchQueryParams = {}) {
  const switch_id = params.switch_id
  const res = await SwitchesService.readSwitch({
    id: switch_id ?? "",
  })
  return res
}

export function useSwitch(params: switchQueryParams = {}) {
  return useQuery({
    queryKey: ["switch", params.switch_id],
    queryFn: () => fetchSwitch(params),
  })
}


export type configQueryParams = {
  id?: string
  config_date?: string
}

export async function fetchSwitchConfig(params: configQueryParams = {}) {
  const id = params.id
  const config_date = params.config_date
  const res = await SwitchesService.getSwitchConfig({
    id: id ?? "",
    configDate: config_date || ""
  })
  return res
}

export function useSwitchConfig(params: configQueryParams = {}) {
  return useQuery({
    queryKey: ["switch", params.id, params.config_date],
    queryFn: () => fetchSwitchConfig(params),
  })
}






