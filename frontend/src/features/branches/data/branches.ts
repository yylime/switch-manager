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

import { BranchesService } from "@/client"
import { useQuery } from "@tanstack/react-query"

export type BranchesQueryParams = {
  page?: number
  pageSize?: number
  searchText?: string
}

export async function fetchBranches(params: BranchesQueryParams = {}) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const skip = (page - 1) * pageSize
  const res = await BranchesService.readBranches({
    skip,
    limit: pageSize,
    searchText: params.searchText ?? "",
  })
  return res
}

export function useBranches(params: BranchesQueryParams = {}) {
  return useQuery({
    queryKey: ["branches", params.page ?? 1, params.pageSize ?? 10, params.searchText ?? ""],
    queryFn: () => fetchBranches(params),
  })
}

