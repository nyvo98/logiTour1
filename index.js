import http from 'http'
import cors from 'cors'
import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { connectDatabase } from './common/connectDB'
// Routes
import User from './routes/user'
import Tour from './routes/tour'
import ContactUs from './routes/contactUs'
import TourGallery from './routes/tourGallery'
import Other from './routes/other'
import Config from './routes/config'
import BookingHistory from './routes/bookingHistory'
import i18n from 'i18n'
import OtherServices from './controller/other'

require('dotenv').config()

// Setup server express
const app = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
app.use(cookieParser())

app.get('/images/:linkImage', OtherServices.getImage)
app.get('/imagesStorage/:linkImage', OtherServices.downloadImage)

app.use('/api/', Other)
app.use('/api/tour', Tour)
app.use('/api/user', User)
app.use('/api/contactUs', ContactUs)
app.use('/api/tourgallery', TourGallery)
app.use('/api/config', Config)
app.use('/api/bookingHistory', BookingHistory)

i18n.configure({
  locales: ['en', 'vi'],
  directory: './locales'
})

const server = http.createServer(app)

// Database connection
connectDatabase()

server.listen(process.env.PORT)

console.log('Starting Load: Adel tour server started at port ' + process.env.PORT)
