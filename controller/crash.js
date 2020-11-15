import { Crash } from '../model'

export default class CrashServices {
  static async get (req, res) {
    const payload = await Crash.find({})
    res.json(payload[0])
  }

  static async create (req, res) {
    try {
      const { createdUser, page, device, message, version } = req.body

      const payload = await Crash.create({
        page,
        createdUser,
        device,
        message,
        version
      })
      res.json(payload)
    } catch (error) {
      res.status(500).send('error :' + error)
    }
  }
}
