import BaseAPI from '.'
import { Notification } from '../model'

export default class NotificationServices {
  static async get (req, res) {
    BaseAPI.authorizationAPI(req, res, async (userId) => {
      const { page, size } = req.query

      const payload = await Notification.find({ listUserID: { $in: [userId] }, isActive: true }, { createdAt: 1, type: 1, bonusValue: 1, image: 1, listUserID: 1 }).skip(parseInt(size) * (parseInt(page) - 1)).limit(parseInt(size)).sort({ createdAt: -1 })
      res.json(BaseAPI.verifyResult(payload))
    })
  }

  static async createLocal (body) {
    try {
      const { type, bonusValue, image, listUserID } = body
      console.log(body)
      const payload = await Notification.create({
        type, bonusValue, image, listUserID
      })
      return payload
    } catch (error) {
      console.log(error)
      return null
    }
  }
}
