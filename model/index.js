import mongoose from 'mongoose'

import UserSchema from './User'
import CategorySchema from './Category'
import CrashSchema from './Crash'
import NotificationSchema from './Notification'
import TourSchema from './Tour'
import ContactUsSchema from './ContactUs'
import TourGallerySchema from './TourGallery'
import ConfigSchema from './Config'
import BokingHistorySchema from './BookingHistory'

const Schema = mongoose.Schema

const createSchema = (schema) => {
  const model = new Schema(schema, { timestamps: true })
  return model
}

const Crash = mongoose.model('Crash', createSchema(CrashSchema))
const Tour = mongoose.model('Tour', createSchema(TourSchema))
const User = mongoose.model('User', createSchema(UserSchema))
const Category = mongoose.model('Category', createSchema(CategorySchema))
const Notification = mongoose.model('Notification', createSchema(NotificationSchema))
const ContactUs = mongoose.model('ContactUs', createSchema(ContactUsSchema))
const TourGallery = mongoose.model('TourGallery', createSchema(TourGallerySchema))
const BookingHistory = mongoose.model('BookingHistory', createSchema(BokingHistorySchema))
const Config = mongoose.model('Config', createSchema(ConfigSchema))

export {
  Tour,
  Crash,
  Notification,
  Category,
  User,
  ContactUs,
  TourGallery,
  BookingHistory,
  Config
}
