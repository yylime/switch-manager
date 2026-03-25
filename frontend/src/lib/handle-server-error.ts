import { ApiError } from "@/client"
import { toast } from 'sonner'

export const handleServerError = (err: ApiError) => {
//   const { showErrorToast } = useCustomToast()
  const errDetail = (err.body as any)?.detail
  let errorMessage = errDetail || "Something went wrong."
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    errorMessage = errDetail[0].msg
  }
  toast.error(errorMessage)
}