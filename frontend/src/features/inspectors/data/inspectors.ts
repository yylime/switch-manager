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

import { InspectorsService } from "@/client"
import { useQuery } from "@tanstack/react-query"

export type InspectorsQueryParams = {
  page?: number
  pageSize?: number
  searchText?: string
}

export async function fetchInspectors(params: InspectorsQueryParams = {}) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const skip = (page - 1) * pageSize
  const res = await InspectorsService.readInspectors({
    skip,
    limit: pageSize,
    searchText: params.searchText ?? "",
  })
  return res
}

export function useInspectors(params: InspectorsQueryParams = {}) {
  return useQuery({
    queryKey: ["inspectors", params.page ?? 1, params.pageSize ?? 10, params.searchText ?? ""],
    queryFn: () => fetchInspectors(params),
  })
}

