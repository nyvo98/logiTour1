import BaseAPI from '.'
import { BookingHistory } from '../model'
import { genUpdate, sendEmail, getLength, calculateDiffDate } from '../common/function'
import TourServices from './tour'

export default class BookingHistoryServices {
  static async get (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      const payload = await BookingHistory.find({ createdUser })
      const promiseAll = payload.map(async (itm) => {
        const toutDetail = await TourServices.getByIdLocal(itm.tourId)
        const newItem = itm
        newItem.tourId = JSON.stringify(toutDetail)
        return newItem
      })
      const finalData = await Promise.all(promiseAll)
      res.json(BaseAPI.verifyResult(finalData))
    })
  }

  static async getAllByAdmin (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const { page, size } = req.query
        const countTotal = await BookingHistory.countDocuments({ isActive: true })
        const payload = await BookingHistory.find({ isActive: true }).skip(parseInt(size) * (parseInt(page) - 1)).limit(parseInt(size)).sort({ createdAt: -1 })
        const promiseAll = payload.map(async (itm) => {
          const toutDetail = await TourServices.getByIdLocal(itm.tourId)
          const newItem = itm
          newItem.tourId = JSON.stringify(toutDetail)
          return newItem
        })
        const finalData = await Promise.all(promiseAll)
        res.json({ total: countTotal, data: BaseAPI.verifyResult(finalData) })
      } catch (error) {
        res.status(500).send('error :' + error)
      }
    })
  }

  static async getFromAdmin (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const { id } = req.params
        const payload = await BookingHistory.find({ createdUser: id })
        const promiseAll = payload.map(async (itm) => {
          const toutDetail = await TourServices.getByIdLocal(itm.tourId)
          const newItem = itm
          newItem.tourId = JSON.stringify(toutDetail)
          return newItem
        })
        const finalData = await Promise.all(promiseAll)
        res.json(BaseAPI.verifyResult(finalData))
      } catch (error) {
        res.status(500).send('error :' + error)
      }
    })
  }

  static async countTour (tourId) {
    const payload = await BookingHistory.countDocuments({ tourId, isPayment: true })
    return payload
  }

  static async getTourById (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      const tourId = req.params.id
      const payload = await BookingHistory.findOne({ createdUser, tourId, isPayment: false })
      res.json(payload)
    })
  }

  static async getLocal (paymentID) {
    const payload = await BookingHistory.findOne({ 'payment.id': paymentID, isActive: true })
    if (payload) {
      return payload
    } else {
      return null
    }
  }

  static async createLocal (objContainer) {
    try {
      const { tourId, createdUser, bookingInfo, payment, isPayment } = objContainer
      const payload = BookingHistory.create({ bookingInfo, payment, tourId, createdUser, isPayment })
      if (payload) {
        console.log(true)
      } else {
        console.log(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  static async makePay (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const { id } = req.body
        const updateField = genUpdate(req.body, ['isPayment'])
        await BookingHistory.findOneAndUpdate({ _id: id }, updateField, { new: true }, (err, result) => {
          if (result || !err) {
            res.json(result)
          } else {
            res.json(false)
          }
        })
      } catch (error) {
        res.status(500).send('error :' + error)
      }
    })
  }

  static async putPaymentStatus (paymentID) {
    try {
      await BookingHistory.findOneAndUpdate({ 'payment.id': paymentID }, { isPayment: true }, { new: true }, async (err, result) => {
        if (result || !err) {
          const findTour = await TourServices.getByIdLocal(result.tourId)
          console.log(result, findTour)
          sendEmail(result.bookingInfo.email, {
            subject: 'Booking welcome',
            tourName: findTour.title.en,
            firstName: result.bookingInfo.firstName,
            lastName: result.bookingInfo.lastName,
            email: result.bookingInfo.email,
            phone: result.bookingInfo.phone,
            nation: result.bookingInfo.nation,
            room: result.bookingInfo.room,
            disease: result.bookingInfo.disease,
            price: findTour.price,
            passport: getLength(result.bookingInfo.passportFile) > 0 ? 'Y' : 'N',
            day: calculateDiffDate(new Date(findTour.tourInfoList.bestDuration.to), new Date(findTour.tourInfoList.bestDuration.from), 'day')
          }, 'confirmBook')

          return (result)
        } else {
          return (false)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  static async delete (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const { id, isActive } = req.query
        await BookingHistory.findOneAndUpdate({ _id: id }, { isActive }, { new: true }, async (err, result) => {
          if (result || !err) {
            const toutDetail = await TourServices.getByIdLocal(result.tourId)
            const newItem = result
            newItem.tourId = JSON.stringify(toutDetail)
            res.json(newItem)
          } else {
            res.json(false)
          }
        })
      } catch (error) {
        res.status(500).send('error :' + error)
      }
    })
  }
}
