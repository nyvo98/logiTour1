import BaseAPI from '.'
import { TourGallery } from '../model'
import { genUpdate, onlyUnique } from '../common/function'
import UserServices from './user'

export default class TourGalleryService {
  static async get (req, res) {
    try {
      const { page, size } = req.query
      const countTotal = await TourGallery.countDocuments({ isActive: true })
      const payload = await TourGallery.find({ isActive: true }).skip(parseInt(size) * (parseInt(page) - 1)).limit(parseInt(size)).sort({ createdAt: -1 })
      const listID = payload.map(item => item.createdUser).filter(onlyUnique)
      const userList = await UserServices.getByIDList(listID)

      const filterName = payload.map(item => {
        const findUser = userList.find(data => data.id === item.createdUser)
        item.createdUser = findUser ? findUser.name : item.createdUser
        return item
      })

      res.json({ total: countTotal, data: filterName })
    } catch (error) {
      console.log(error)
      res.status(500).send('error :' + error)
    }
  }

  static async getAll (req, res) {
    try {
      const { page, size } = req.query
      const countTotal = await TourGallery.countDocuments({})
      const payload = await TourGallery.find({}).skip(parseInt(size) * (parseInt(page) - 1)).limit(parseInt(size)).sort({ createdAt: -1 })
      const listID = payload.map(item => item.createdUser).filter(onlyUnique)
      const userList = await UserServices.getByIDList(listID)

      const filterName = payload.map(item => {
        const findUser = userList.find(data => data.id === item.createdUser)
        item.createdUser = findUser ? findUser.name : item.createdUser
        return item
      })

      res.json({ total: countTotal, data: filterName })
    } catch (error) {
      console.log(error)
      res.status(500).send('error :' + error)
    }
  }

  static async getById (req, res) {
    try {
      const payload = await TourGallery.findOne({ _id: req.params.id })
      const nameUser = await UserServices.getByIdLocal(payload.createdUser)
      payload.createdUser = nameUser
      res.json(payload)
    } catch (error) {
      res.status(500).send('error :' + error)
    }
  }

  static async search (req, res) {
    const { lang, keyword, size, page } = req.body

    const titleLang = `title.${lang}`
    const desLang = `description.${lang}`
    const payload = await TourGallery.find(
      {
        isActive: true,
        $or: [
          { [titleLang]: { $regex: keyword, $options: 'i' } },
          { [desLang]: { $regex: keyword, $options: 'i' } }
        ]
      }
    ).skip(parseInt(size) * (parseInt(page) - 1)).limit(parseInt(size)).sort({ createdAt: -1 })
    res.json({ total: payload.length, data: payload })
  }

  static async create (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const { title, image, description } = req.body
        const result = await TourGallery.create({ title, image, description, createdUser })
        res.json(result)
      } catch (error) {
        res.status(500).send('error :' + error)
      }
    })
  }

  static async update (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const { id } = req.body
        const updateField = genUpdate(req.body, ['title', 'image', 'description'])
        await TourGallery.findOneAndUpdate({ _id: id }, updateField, { new: true }, (err, result) => {
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
        await TourGallery.findOneAndUpdate({ _id: id }, { isActive }, { new: true }, async (err, result) => {
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
