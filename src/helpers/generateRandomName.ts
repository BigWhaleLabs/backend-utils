import { adjectives, nouns } from '../data/nameDictionaries'
import { createHash } from 'crypto'
import capitalizeFirstLetter from './capitalizeFirstLetter'

export function generateRandomName(address: string) {
  const hashed = createHash('sha256').update(address).digest('hex')
  const hashedBigint = BigInt('0x' + hashed)
  const firstWordIndex = Number(hashedBigint % BigInt(adjectives.length))
  const secondWordIndex = Number(hashedBigint % BigInt(nouns.length))
  const firstWord = capitalizeFirstLetter(adjectives[firstWordIndex])
  const secondWord = capitalizeFirstLetter(nouns[secondWordIndex])
  return `${firstWord}${secondWord}`
}

export default generateRandomName
