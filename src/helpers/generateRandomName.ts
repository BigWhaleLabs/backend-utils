import { colorDictionary, nounDictionary } from '../data/nameDictionaries'
import { createHash } from 'crypto'
import capitalizeFirstLetter from './capitalizeFirstLetter'

export function generateRandomName(address: string) {
  const hashed = createHash('sha256').update(address).digest('hex')
  const hashedBigint = BigInt('0x' + hashed)
  const firstWordIndex = Number(hashedBigint % BigInt(colorDictionary.length))
  const secondWordIndex = Number(hashedBigint % BigInt(nounDictionary.length))
  const firstWord = capitalizeFirstLetter(colorDictionary[firstWordIndex])
  const secondWord = capitalizeFirstLetter(nounDictionary[secondWordIndex])
  return `${firstWord}${secondWord}`
}

export default generateRandomName
