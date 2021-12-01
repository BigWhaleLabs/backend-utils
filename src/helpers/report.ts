export function report(error: unknown, ...rest: unknown[]) {
  console.log(error, ...rest)
}

export default report
