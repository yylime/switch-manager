
import { DashboardService } from "@/client"
import { useQuery } from "@tanstack/react-query"

export async function fetchDashboardData() {
  const res = await DashboardService.getCardData()
  return res
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboardData(),
  })
}


export async function fetchDashboardBranchData() {
  const res = await DashboardService.getBranchStatistics()
  return res
}

export function useDashboardBranchData() {
  return useQuery({
    queryKey: ["dashboard_branch"],
    queryFn: () => fetchDashboardBranchData(),
  })
}


export type configQueryParams = {
  past_date?: number
}

export async function fetchDashboardSuccessCountByDay(params: configQueryParams = {}) {
  const past_date = params.past_date ?? 7
  const res = await DashboardService.getSuccessCountByDay({
    pastDay: past_date
  })
  return res
}

export function useDashboardSuccessCountByDay(params: configQueryParams = {}) {
  return useQuery({
    queryKey: ["dashboard_success_cout_by_day", params.past_date],
    queryFn: () => fetchDashboardSuccessCountByDay(),
  })
}





