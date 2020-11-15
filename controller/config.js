import BaseAPI from '.'
import { Config } from '../model'
import { genUpdate } from '../common/function'

export default class ConfigServices {
  static async get (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      const payload = await Config.find({})
      const newTimeline = payload[0].timelineConfig.sort((a, b) => parseInt(a.year) - parseInt(b.year))
      console.log(newTimeline)
      payload[0].timelineConfig = newTimeline
      res.json(payload[0])
    })
  }

  static async getLocal (type) {
    const payload = await Config.find({})
    return type ? payload[0][type] : payload[0]
  }

  static async getByType (req, res) {
    const params = req.params.type
    const listDisplay = {}
    listDisplay[params] = 1

    const payload = await Config.find({}, listDisplay)
    res.json(payload[0][params])
  }

  static async getByTypeMultiple (req, res) {
    const listDisplay = {}
    req.body.setting.map(item => { listDisplay[item] = 1 })
    const payload = await Config.find({}, listDisplay)

    res.json(payload[0])
  }

  static async create (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const { headerConfig, termOfService, aboutUs } = req.body

        const payload = await Config.create({
          termOfService,
          headerConfig,
          aboutUs
        })
        res.json(payload)
      } catch (error) {
        res.status(500).send('error :' + error)
      }
    })
  }

  static async update (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        console.log(req.body.footerConfig)
        const findOldConfig = await Config.find({})
        const updateField = genUpdate(req.body,
          ['headerConfig', 'termOfService', 'aboutUs', 'companyConfig', 'languageConfig', 'timelineConfig', 'footerConfig', 'precautionConfig'])
        await Config.findOneAndUpdate({ _id: findOldConfig[0]._id }, updateField, { new: true }, (err, result) => {
          if (result || !err) {
            res.json(result)
          } else {
            res.json(false)
          }
        })
      } catch (error) {
        console.log(error)
        res.status(500).send('error :' + error)
      }
    })
  }
}
