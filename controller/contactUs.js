import BaseAPI from '.'
import { ContactUs } from '../model'
import { genUpdate, sendEmail } from '../common/function'

export default class ContactUsService {
  static async get (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const payload = await ContactUs.find({})
        res.json(payload)
      } catch (error) {
        res.status(500).send('error :' + error)
      }
    })
  }

  static async getById (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const payload = await ContactUs.find({ _id: req.params.id })
        res.json(payload)
      } catch (error) {
        res.status(500).send('error :' + error)
      }
    })
  }

  static async create (req, res) {
    try {
      const { firstName, lastName, email, title, content } = req.body
      const result = await ContactUs.create({ firstName, lastName, email, title, content })
      res.json(result)
      const data = {
        user: `${firstName} ${lastName}`,
        title,
        email,
        message: content,
        subject: 'User Feedback'
      }
      sendEmail(process.env.ADEL_EMAIL_ADMIN, data, 'contactUs')
    } catch (error) {
      console.log(error)
      res.status(500).send('error :' + error)
    }
  }

  static async update (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const { id } = req.body
        const updateField = genUpdate(req.body, ['firstName', 'lastName', 'email', 'title', 'content'])
        await ContactUs.findOneAndUpdate({ _id: id }, updateField, { new: true }, (err, result) => {
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
        const { id, isActive } = req.body
        await ContactUs.findOneAndUpdate({ _id: id }, { isActive }, { new: true }, async (err, result) => {
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
}
