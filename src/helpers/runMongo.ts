import * as mongoose from 'mongoose'
import env from '@/helpers/env'

export function runMongo(mongoUrl = env.MONGO) {
  return mongoose.connect(mongoUrl)
}

export default runMongo
