import { ClassConstructor, plainToClass } from 'class-transformer'
import { Context } from 'koa'
import { ValidatorOptions, validate as classValidate } from 'class-validator'
import { badData } from '@hapi/boom'

export async function validate<T extends object, V>(
  ctx: Context,
  classConstructor: ClassConstructor<T>,
  plain: V,
  injectSource: string,
  validatorOptions?: ValidatorOptions
) {
  const values = await plainToClass<T, V>(classConstructor, plain)
  const errors = await classValidate(values, validatorOptions)
  if (errors.length > 0) {
    ctx.throw(
      badData(
        'validation error for argument type: ' + injectSource,
        errors.map((error) => {
          return { field: error.property, violations: error.constraints }
        })
      )
    )
  }
}

export default validate
