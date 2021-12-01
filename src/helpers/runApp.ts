import 'reflect-metadata'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as bodyParser from 'koa-bodyparser'
import * as cors from '@koa/cors'
import { bootstrapControllers, metadata } from 'amala'
import { koaSwagger } from 'koa2-swagger-ui'
import { openApi } from '@/helpers/openApi'
import env from '@/helpers/env'

export default async function runApp({ title }: { title: string }) {
  const app = new Koa()
  const router = new Router()
  await bootstrapControllers({
    app,
    router,
    basePath: '/',
    controllers: [__dirname + '/controllers/*'],
    disableVersioning: true,
    openApiPath: '/amala/docs/spec',
  })
  const data = openApi(metadata.controllers, {
    title,
  })
  router.get('/docs/spec', (ctx: Koa.Context) => (ctx.body = data))
  app.use(cors({ origin: '*' }))
  app.use(bodyParser())
  app.use(router.routes())
  app.use(router.allowedMethods())
  app.use(
    koaSwagger({
      swaggerOptions: {
        url: '/docs/spec',
        tryItOutEnabled: false,
        supportedSubmitMethods: [],
      },
      routePrefix: '/docs',
      hideTopbar: true,
    })
  )
  return new Promise((resolve, reject) => {
    app
      .listen(env.PORT)
      .on('listening', () => {
        console.log(`HTTP is listening on ${env.PORT}`)
        resolve(app)
      })
      .on('error', reject)
  })
}
