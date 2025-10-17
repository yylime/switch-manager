// import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
// faker.seed(12345)

// export const tasks = Array.from({ length: 100 }, () => {
  
//   return {
//     id: `TASK-${faker.number.int({ min: 1000, max: 9999 })}`,
//     name: faker.lorem.sentence({ min: 5, max: 15 }),
//     createdAt: faker.date.past(),
//     updatedAt: faker.date.recent(),
//     assignee: faker.person.fullName(),
//     description: faker.lorem.paragraph({ min: 1, max: 3 }),
//     dueDate: faker.date.future(),
//   }
// })

import { SwitchesService, SwitchLoginTypeService, BranchesService, InspectorsService } from "@/client"
import { useQuery } from "@tanstack/react-query"

export type SwitchesQueryParams = {
  page?: number
  pageSize?: number
  searchText?: string
}

export async function fetchSwitches(params: SwitchesQueryParams = {}) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const skip = (page - 1) * pageSize
  const res = await SwitchesService.readSwitches({
    skip,
    limit: pageSize,
    searchText: params.searchText ?? "",
  })
  return res
}

export function useSwitches(params: SwitchesQueryParams = {}) {
  return useQuery({
    queryKey: ["switches", params.page ?? 1, params.pageSize ?? 10, params.searchText ?? ""],
    queryFn: () => fetchSwitches(params),
  })
}

// login types

export async function fetchSwitchLoginTypes() {
  const res = await SwitchLoginTypeService.readSwitchLoginTypes()
  return res.data.map((item) => ({
    label: item.name,
    value: item.id,
  }))
}

export function useSwitchLoginTypes() {
  return useQuery({
    queryKey: ["switchLoginTypes"],
    queryFn: fetchSwitchLoginTypes,
  })
}

export async function fetchBranchesTypes() {
  const res = await BranchesService.readBranches()
  return res.data.map((item) => ({
    label: item.name,
    value: item.id,
  }))
}

export function useBranches() {
  return useQuery({
    queryKey: ["branchTypes"],
    queryFn: fetchBranchesTypes,
  })
}

export async function fetchInspectorsTypes() {
  const res = await InspectorsService.readInspectors()
  return res.data.map((item) => ({
    label: item.name,
    password: item.password,
    value: item.id,

  }))
}

export function useInspectors() {
  return useQuery({
    queryKey: ["inspectorTypes"],
    queryFn: fetchInspectorsTypes,
  })
}




