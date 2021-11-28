import { Context, Next } from 'koa'
import { validationMetadatasToSchemas } from 'class-validator-jsonschema'

type Middleware = {
  (ctx: Context, next: Next): void
  validationSchema?: { name: string }
}

enum SourceType {
  ctx = 'ctx',
  state = 'state',
  currentUser = 'currentUser',
  body = 'body',
  query = 'query',
  params = 'params',
}

export interface Controller {
  flow?: Middleware[]
  actions: {
    [ak: string]: {
      flow?: Middleware[]
      verb: string
      path: string
      argumentTypes: {
        [argId: string]: { name: string }
      }
      arguments: {
        [key: string]: {
          injectOptions?: { required?: boolean } | string
          injectSource: SourceType
        }
      }
    }
  }
  path: string | string[]
}

function middlewareParams(
  middlewares: Middleware[],
  schemas: Record<string, { required?: string[]; properties?: object }>
) {
  const withSchema = middlewares.filter(
    (middleware) => middleware.validationSchema
  )
  const middlewareParams = new Map()

  for (const middleware of withSchema) {
    const middlewareSchema = schemas[middleware?.validationSchema?.name ?? '']
    const middlewareSchemaProperties = middlewareSchema.properties
    if (!middlewareSchemaProperties) continue
    for (const [propery, value] of Object.entries(middlewareSchemaProperties)) {
      middlewareParams.set(propery, {
        in: 'path',
        name: propery,
        schema: value,
        ...(middlewareSchema.required && {
          required: middlewareSchema.required.includes(propery),
        }),
      })
    }
  }

  return Array.from(middlewareParams.values())
}

function propertiesToParams(
  place: string,
  schema: {
    properties?: { [property: string]: object }
    required?: string[]
  }
) {
  const { properties } = schema
  if (!properties) return []
  return Object.entries(properties).map(([propery, value]) => ({
    in: place,
    name: propery,
    schema: value,
    ...(schema.required && {
      required: schema.required.includes(propery),
    }),
  }))
}

export function openApi(
  controllers: { [name: string]: Controller },
  info: {
    title: string
  }
) {
  const paths = {} as { [key: string]: { [key: string]: object } }
  const schemas = validationMetadatasToSchemas()
  schemas['String'] = {
    description: 'A string value',
    type: 'string',
  }

  for (const controllerClassName in controllers) {
    const controller = controllers[controllerClassName]
    const basePath = controller.path

    for (const actionName in controller.actions) {
      const actionValue = controller.actions[actionName]
      const fullPath = basePath + actionValue.path
      const verb = actionValue.verb

      if (!(fullPath in paths)) {
        paths[fullPath] = {}
      }
      const parameters = []

      if (actionValue.arguments) {
        for (const [argId, argInjectionDetails] of Object.entries(
          actionValue.arguments
        )) {
          const argType = actionValue.argumentTypes[argId]
          const injectOptions = argInjectionDetails.injectOptions

          const routerSources = [
            SourceType.body,
            SourceType.query,
            SourceType.params,
          ]
          if (routerSources.includes(argInjectionDetails.injectSource)) {
            const argExistsIn = argInjectionDetails.injectSource
            const schema = schemas[argType.name]
            const name =
              typeof injectOptions == 'string' ? injectOptions : argExistsIn

            if (argExistsIn === SourceType.body || schema.type !== 'object') {
              const required =
                typeof injectOptions == 'object' ? injectOptions.required : true
              parameters.push({
                in: argExistsIn,
                name: name,
                required,
                schema: schema,
              })
            } else {
              parameters.push(...propertiesToParams(argExistsIn, schema))
            }
          }
        }
      }

      const flows = ([] as Middleware[])
        .concat(actionValue.flow || [])
        .concat(controller.flow || [])

      parameters.push(...middlewareParams(flows, schemas))

      paths[fullPath][verb] = {
        operationId: `${controllerClassName}.${actionName}`,
        parameters,
        summary: actionName,
        tags: [controllerClassName],
      }
    }
  }

  return {
    info,
    openapi: '3.0.0',
    components: {
      schemas: schemas,
    },
    paths,
  }
}

export default openApi
