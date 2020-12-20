import BaseAPI from '.'
import { Tour } from '../model'
import OtherServices from './other'
import BookingHistorySevices from './bookHistory'
import { genUpdate } from '../common/function'

export default class TourServices {
  static async get (req, res) {
    const { page, size } = req.query
    const countTotal = await Tour.countDocuments({ isActive: true })
    const payload = await Tour.find({ isActive: true }).skip(parseInt(size) * (parseInt(page) - 1)).limit(parseInt(size)).sort({ createdAt: -1 })
    const promise = await Promise.all(payload.map(async (item) => {
      const newItem = item
      const countBook = await BookingHistorySevices.countTour(item._id)
      newItem.isBest = countBook >= 3
      return newItem
    }))

    res.json({ total: countTotal, data: promise })
  }

  static async getAll (req, res) {
    const { page, size } = req.query
    const countTotal = await Tour.countDocuments({ })
    const payload = await Tour.find({ }).skip(parseInt(size) * (parseInt(page) - 1)).limit(parseInt(size)).sort({ updatedAt: -1 })
    res.json({ total: countTotal, data: payload })
  }

  static async search (req, res) {
    const { lang, keyword, size, page } = req.body

    const titleLang = `title.${lang}`
    const desLang = `description.${lang}`

    const payload = await Tour.find(
      {
        isActive: true,
        $or: [
          { [titleLang]: { $regex: new RegExp('^' + keyword.toLowerCase(), 'i') } },
          { [desLang]: { $regex: new RegExp('^' + keyword.toLowerCase(), 'i') } }
        ]
      }
    ).skip(parseInt(size) * (parseInt(page) - 1)).limit(parseInt(size)).sort({ createdAt: -1 })

    const promise = await Promise.all(payload.map(async (item) => {
      const newItem = item
      const countBook = await BookingHistorySevices.countTour(item._id)
      newItem.isBest = countBook >= 3
      return newItem
    }))

    res.json({ total: payload.length, data: promise })
  }

  static async getResponse (req, res) {
    try {
      const { paymentId } = req.query
      const payload = await BookingHistorySevices.getLocal(paymentId)
      res.redirect(payload
        ? `${process.env.ADEL_WEB_APP_URL}package-detail/${payload.tourId}?success=true`
        : `${process.env.ADEL_WEB_APP_URL}package-detail/${payload.tourId}?failed=false`
      )
      BookingHistorySevices.putPaymentStatus(paymentId)
    } catch (error) {
      res.send('error :' + error)
    }
  }

  static async getById (req, res) {
    const payload = await Tour.findOne({ _id: req.params.id, isActive: true })
    res.json(BaseAPI.verifyResult(payload))
  }

  static async getByIdLocal (id) {
    const payload = await Tour.findOne({ _id: id, isActive: true })
    return payload
  }

  static async tourPayment (req, res) {
    try {
      const { tourId, bookingInfo } = req.body
      const payload = await Tour.findOne({ _id: tourId, isActive: true })
      if (payload) {
        const paypalPayment = await OtherServices.makePaypal(payload.price, payload.title.en, payload.description.en)
        res.json(paypalPayment || null)
        if (paypalPayment) {
          BookingHistorySevices.createLocal({ tourId, payment: paypalPayment, bookingInfo, createdUser: bookingInfo.email, isPayment: false })
        }
      } else {
        res.json(false)
      }
    } catch (error) {
      res.status(500).send('error :' + error)
    }
  }

  static async update (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const { id } = req.body
        const updateField = genUpdate(req.body, ['title', 'description',
          'subDescription', 'image', 'price', 'bookingInfoList', 'tourInfoList', 'tourScheduleList', 'contactList'])
        await Tour.findOneAndUpdate({ _id: id }, updateField, { new: true }, (err, result) => {
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

  static async delete (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const { id, isActive } = req.query
        await Tour.findOneAndUpdate({ _id: id }, { isActive }, { new: true }, async (err, result) => {
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

  static async create (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const body = {
          title: { en: 'Nami island', vi: 'Nami island' },
          description: {
            en: 'On our Secret Food Tour: Seoul we\'ll show you some of the most loved foods and beautiful landscapes our city has to offer.',
            vi: 'On our Secret Food Tour: Seoul we\'ll show you some of the most loved foods and beautiful landscapes our city has to offer.'
          },
          subDescription: {
            en: 'The old and new Korea are juxtaposed in an itinerary that combines the sophisticated',
            vi: 'The old and new Korea are juxtaposed in an itinerary that combines the sophisticated'
          },
          image: ['https://www.amaztravel.com/pic/upfile/131158973070572220.jpg'],
          price: 1407,
          bookingInfoList: {
            procedure: [{
              isInclude: true,
              description: `4-5 Star hotel accommodation with daily breakfast
        Round-trip airport/hotel transfer service on private basis
        Hotel pickup and drop-off service available during the tour
        Transports by van, mini-bus, and/or coach
        KTX bullet train ticket
        English speaking tour guide
        Meals in the itinerary
        Admission fee in the itinerary
        Luggage (Per Person) : 1 Luggage, 1 Carry-on
        Gratuities`
            }, {
              isInclude: false,
              description: `Round-trip international and all domestic air ticket
        Travel insurance
        Meals not specified in the itinerary
        Service beyond the itinerary
        Personal expenses throughout the tour
        Single supplement charge: 2019 :$520 / 2020:$545`
            }],
            process: ['Booking', 'Booking confirmation', 'Payment request', 'Receiving voucher', 'Print voucher']
          },
          tourInfoList: {
            bestDuration: { from: new Date(2020, 3, 5), to: new Date(2020, 3, 13) },
            duration: { from: new Date(2020, 3, 5), to: new Date(2020, 3, 12) },
            location: 'Seoul'
          },
          tourScheduleList: {
            schedule: [{
              name: 'Day 1',
              title: 'Seoul',
              place: ['Incheon international airport', 'hotel', 'Gyeongbokgung Palace'],
              otherInformation: [{ type: 'destination', name: 'Tmark Grand Hotel Myeongdong' },
                { type: 'address', name: '52 Toegye-ro, Hoehyeon-dong, Jung-gu, Seoul, South Korea' },
                { type: 'phone', name: '+852 2126 1988' },
                { type: 'lunch', name: 'Not included Dinner : Not included' }],
              description: 'Upon arrival at Incheon International airport, professional driver will greet you with name board and take you to hotel safely by private basis. After check in on own, rest of the day is at leisure. (*Hotel check in will be available after 2pm.)',
              tourList: [
                { name: 'Gyeongbokgung', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' },
                { name: 'Changdeokgung', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' },
                { name: 'Gwanghwamun', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' }
              ]
            }, {
              name: 'Day 2',
              title: 'Gwanghwamun',
              place: ['Gwanghwamun', 'National Folk Museum', 'Cheong Wa Dae'],
              otherInformation: [{ type: 'destination', name: 'Tmark Grand Hotel Myeongdong' },
                { type: 'address', name: '52 Toegye-ro, Hoehyeon-dong, Jung-gu, Seoul, South Korea' },
                { type: 'phone', name: '+852 2126 1988' },
                { type: 'lunch', name: 'Not included Dinner : Not included' }],
              description: 'Upon arrival at Incheon International airport, professional driver will greet you with name board and take you to hotel safely by private basis. After check in on own, rest of the day is at leisure. (*Hotel check in will be available after 2pm.)',
              tourList: [
                { name: 'Gyeongbokgung', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' },
                { name: 'Changdeokgung', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' },
                { name: 'Gwanghwamun', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' }
              ]
            },
            {
              name: 'Day 3',
              title: 'Myeongdong',
              place: ['Myeongdong', 'Insadong / SM duty Free', 'Hongik Univ. Station', 'Suwon Hwaseong Fortress'],
              otherInformation: [{ type: 'destination', name: 'Tmark Grand Hotel Myeongdong' },
                { type: 'address', name: '52 Toegye-ro, Hoehyeon-dong, Jung-gu, Seoul, South Korea' },
                { type: 'phone', name: '+852 2126 1988' },
                { type: 'lunch', name: 'Not included Dinner : Not included' }],
              description: 'Upon arrival at Incheon International airport, professional driver will greet you with name board and take you to hotel safely by private basis. After check in on own, rest of the day is at leisure. (*Hotel check in will be available after 2pm.)',
              tourList: [
                { name: 'Gyeongbokgung', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' },
                { name: 'Changdeokgung', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' },
                { name: 'Gwanghwamun', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' }
              ]
            },
            {
              name: 'Day 4',
              title: 'Korean Folk Village',
              place: ['Korean Folk Village', 'Incheon international airport'],
              otherInformation: [{ type: 'destination', name: 'Tmark Grand Hotel Myeongdong' },
                { type: 'address', name: '52 Toegye-ro, Hoehyeon-dong, Jung-gu, Seoul, South Korea' },
                { type: 'phone', name: '+852 2126 1988' },
                { type: 'lunch', name: 'Not included Dinner : Not included' }],
              description: 'Upon arrival at Incheon International airport, professional driver will greet you with name board and take you to hotel safely by private basis. After check in on own, rest of the day is at leisure. (*Hotel check in will be available after 2pm.)',
              tourList: [
                { name: 'Gyeongbokgung', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' },
                { name: 'Changdeokgung', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' },
                { name: 'Gwanghwamun', image: 'https://dhdnzx78tqry5.cloudfront.net/uploads/deal/thumb/90831.jpg' }
              ]
            }]
          },
          contactList: [{ type: 'email', value: 'adeltour@gmail.com' }, { type: 'telegram', value: 'adeltour' }]
        }

        const { title, description, subDescription, image, price, bookingInfoList, tourInfoList, tourScheduleList, contactList } = req.body
        const payload = await Tour.create({
          title,
          description,
          createdUser,
          subDescription,
          image,
          price,
          bookingInfoList,
          tourInfoList,
          tourScheduleList,
          contactList
        })
        res.json(payload)
      } catch (error) {
        res.status(500).send('error :' + error)
      }
    })
  }
}
