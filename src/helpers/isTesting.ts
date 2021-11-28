export function isTesting() {
  return process.env.NODE_ENV === 'test'
}

export default isTesting
