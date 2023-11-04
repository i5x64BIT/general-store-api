import express from 'express'
import 'dotenv/config'
import UserRouter from './routes/User/UserRouter.js'
import bodyParser from 'body-parser';
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/api/v1', UserRouter);

const port = parseInt(process.env.PORT) || 8000;
const host = process.env.HOST || 'localhost'

app.listen(port, host, () => {
  console.log('Listening on port ', host + ':', port)
})