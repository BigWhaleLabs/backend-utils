import { ClassConstructor } from 'class-transformer'
import { Context, Next } from 'koa'
import validate from '@/helpers/validate'

export function validateParamsMiddleware<T extends object>(
  classConstructor: ClassConstructor<T>
) {
  return (middleware: (ctx: Context, next: Next) => void) => {
    return async (ctx: Context, next: Next) => {
      await validate(ctx, classConstructor, ctx.params, 'state')
      return middleware(ctx, next)
    }
  }
}

export default validateParamsMiddleware
