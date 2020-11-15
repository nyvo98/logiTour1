import BaseAPI from '.'
import { Category } from '../model'

export default class CategoryServices {
  static async get (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      const payload = await Category.find({}).sort({ weight: -1 })
      res.json(payload)
    })
  }
}
