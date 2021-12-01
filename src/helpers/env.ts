import * as dotenv from 'dotenv'
import { cleanEnv, num, str } from 'envalid'

dotenv.config({ path: `${__dirname}/../../.env` })

export default cleanEnv(process.env, {
  PORT: num({ default: 1337 }),
  JWT: str(),
  MONGO: str(),
})
