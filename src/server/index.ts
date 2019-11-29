import * as express from 'express'

const app = express()

const port = process.env.port || 3999

app.use( express.static( './public' ) )

app.listen( port, () => {
  console.log( `Listening on port ${ port }` )
} )
