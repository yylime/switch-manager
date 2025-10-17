import { createFileRoute } from '@tanstack/react-router'
import { SwitchConfigPage } from "@/features/switch-configs"
import { ForbiddenError } from "@/features/errors/forbidden"
import {SwitchesService} from "@/client"

export const Route = createFileRoute('/_authenticated/switches/$switchId')({
  component: SwitchConfigPage,
  errorComponent: ForbiddenError, // 🚨 加载失败时自动显示
  loader: async ({ params }) => {
    const switchItem = await SwitchesService.readSwitch({ id: params.switchId })
    return switchItem
  },
})
