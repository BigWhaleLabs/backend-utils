export default function report(error: unknown, ...rest: unknown[]) {
  console.log(error, ...rest)
}
