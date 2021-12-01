import report from '@/helpers/report'

export default async function tryCatch(
  payload: () => Promise<void> | void,
  handleError: (error: unknown) => void
) {
  try {
    await payload()
  } catch (error) {
    report(error)
    handleError(error)
  }
}
