import * as Koa from 'koa'
import * as Router from 'koa-router'
import { Controllers, openApi } from '@/helpers/openApi'
import { koaSwagger } from 'koa2-swagger-ui'

export function useOpenApi({
  router,
  controllers,
  title,
}: {
  router: Router
  controllers: Controllers
  title: string
}) {
  const data = openApi(controllers, {
    title,
  })
  router.get('/docs/spec', (ctx: Koa.Context) => (ctx.body = data))
  return koaSwagger({
    swaggerOptions: {
      url: '/docs/spec',
      tryItOutEnabled: false,
      supportedSubmitMethods: [],
    },
    routePrefix: '/docs',
    hideTopbar: true,
  })
}

export default useOpenApi
