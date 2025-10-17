
import { DashboardService } from "@/client"
import { useQuery } from "@tanstack/react-query"


export async function fetchDashboardData() {
  const res = await DashboardService.getDashboard()
  return res
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboardData(),
  })
}





