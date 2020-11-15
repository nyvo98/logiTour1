import BaseAPI from '.'
import { User } from '../model'
import { fetchAPI, generateToken, convertPasswordHMAC256, genUpdate, lowerCase, getLength, sendEmail, generateTokenResetPassword } from '../common/function'
import FB from 'fb'
import { userRole } from '../common/constants'

export default class UserServices {
  static async count (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      const payload = await User.countDocuments({})
      res.json(payload)
    })
  }

  static async getByIDList (idList) {
    let payload = await User.find({ isActive: true, id: { $in: idList } }, { id: 1, firstName: 1, lastName: 1 })
    if (getLength(payload) > 0) {
      payload = payload.map(item => {
        return { id: item.id, name: item.firstName + item.lastName }
      })
    }

    return payload
  }

  static async getByIdLocal (id) {
    const payload = await User.findOne({ id })
    return payload.firstName + payload.lastName
  }

  static async get (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      const { page, size } = req.query
      const countTotal = await User.countDocuments({ })
      const payload = await User.find({ }).skip(parseInt(size) * (parseInt(page) - 1)).limit(parseInt(size)).sort({ createdAt: -1 })
      res.json({ total: countTotal, data: payload })
    })
  }

  static async getById (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      const payload = await User.find({ id: req.params.id })
      res.json(payload)
    })
  }

  static async postLoginPassword (req, res) {
    try {
      const { email, password, isLogin } = req.body

      res.json(await UserServices.onCreateUser({ isLogin, email, password: convertPasswordHMAC256(password) }))
    } catch (error) {
      res.status(500).send('error :' + error)
    }
  }

  static async postLoginAdmin (req, res) {
    try {
      const { email, password } = req.body

      res.json(await UserServices.onCreateUser({ isLoginAdmin: true, email, password: convertPasswordHMAC256(password) }))
    } catch (error) {
      res.status(500).send('error :' + error)
    }
  }

  static async postLoginFacebook (req, res) {
    try {
      const { token } = req.body
      FB.api('/me', { fields: ['id', 'name', 'email', 'link', 'picture.type(large)'], access_token: token }, async (response) => {
        const { id, name, email, picture } = response
        res.json(await UserServices.onCreateUser({ id, name, email, picture: (picture && picture.data && picture.data.url) ? picture.data.url : '' }))
      })
    } catch (error) {
      res.status(500).send('error :' + error)
    }
  }

  static async postLoginGoogle (req, res) {
    try {
      const { token } = req.body
      const response = await fetchAPI(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`)
      res.json(await UserServices.onCreateUser(response))
    } catch (error) {
      res.status(500).send('error :' + error)
    }
  }

  static async onCreateUser (response) {
    return new Promise(async (resolve, reject) => {
      const { id, picture, password, email, isLogin, isLoginAdmin } = response
      console.log(response)
      const emailFormat = lowerCase(email)

      const oldUser = password ? await User.findOne({ id: emailFormat }) : await User.findOne({ id })

      const jwtToken = generateToken(id || emailFormat)
      if (oldUser) {
        if (isLogin || isLoginAdmin) {
          if (oldUser.password !== password) {
            resolve({ errMess: 'invalideEmailPW' })
          } else {
            if (isLoginAdmin) {
              if (oldUser.role === userRole.admin) {
                await User.findOneAndUpdate({ id }, { image: picture })
                resolve(BaseAPI.verifyResult({ jwtToken, data: oldUser }))
              } else {
                resolve({ errMess: 'notAdmin' })
              }
            } else {
              if (oldUser.isVerify) {
                await User.findOneAndUpdate({ id }, { image: picture })
                resolve(BaseAPI.verifyResult({ jwtToken, data: oldUser }))
              } else {
                resolve({ errMess: 'verifyEmail' })
              }
            }
          }
        } else {
          if (password) {
            resolve({ errMess: 'userExisted' })
          } else {
            await User.findOneAndUpdate({ id }, { image: picture })
            resolve(BaseAPI.verifyResult({ jwtToken, data: oldUser }))
          }
        }
      } else {
        if (isLogin) {
          resolve({ errMess: 'invalideEmailPW' })
        } else {
          const stateCreate = {
            id: password ? emailFormat : id,
            firstName: response.family_name,
            lastName: response.given_name,
            locale: response.locale,
            email: emailFormat,
            image: picture,
            isVerify: !password
          }

          if (password) {
            stateCreate.password = password
          }
          const result = await User.create(stateCreate)

          if (password) {
            UserServices.sendEmailConfirmRegister(emailFormat, {
              subject: 'Adel Tour Registration Confirmation',
              link: `${process.env.ADEL_WEB_APP_URL}?tokenConfirm=${jwtToken}`
            })
          } else {
            sendEmail(emailFormat, { subject: 'Welcome to Adel tour' }, 'welcomeAccount')
          }

          resolve({ jwtToken, data: result })
        }
      }
    })
  }

  static async confirmUserRegister (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      const findUser = await User.findOne({ id: createdUser })
      if (!findUser.isVerify) {
        await User.findOneAndUpdate({ id: createdUser }, { isVerify: true }, { new: true }, (err, result) => {
          if (result || !err) {
            sendEmail(createdUser, { subject: 'Welcome to Adel tour' }, 'welcomeAccount')
            res.json(result)
          } else {
            res.json(false)
          }
        })
      } else {
        res.json(false)
      }
    })
  }

  static async sendEmailConfirmRegister (email, data) {
    sendEmail(email, data, 'newAccount')
  }

  static async update (req, res) {
    try {
      const { id } = req.body
      console.log(req.body)
      const updateField = genUpdate(req.body,
        ['firstName', 'lastName', 'locale', 'image', 'email', 'sex', 'residentNum', 'phone', 'address', 'nation', 'nationCode', 'role'])

      await User.findOneAndUpdate({ id }, updateField, { new: true }, (err, result) => {
        if (result || !err) {
          res.json(result)
        } else {
          res.json(false)
        }
      })
    } catch (error) {
      res.status(500).send('error :' + error)
    }
  }

  static async changePassword (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const { oldPassword, newPassword, isReset } = req.body
        var queryField = { id: createdUser }
        if (!isReset) {
          queryField.password = convertPasswordHMAC256(oldPassword)
        }
        await User.findOneAndUpdate(
          queryField, { password: convertPasswordHMAC256(newPassword) }, { new: true }, (err, result) => {
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

  static async resetPassword (req, res) {
    try {
      const { email } = req.body
      const emailFormat = lowerCase(email)
      const jwtToken = generateTokenResetPassword(email)
      const data = {
        link: `${process.env.ADEL_WEB_APP_URL}?token=${jwtToken}`,
        subject: 'Reset Password'
      }
      sendEmail(emailFormat, data, 'reset')
      res.json(true)
    } catch (error) {
      res.send('error :' + error)
    }
  }

  static async delete (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const { id, isActive } = req.query
        await User.findOneAndUpdate({ _id: id }, { isActive }, { new: true }, async (err, result) => {
          if (result || !err) {
            res.json(result)
          } else {
            res.json(false)
          }
        })
      } catch (error) {
        res.send('error :' + error)
      }
    })
  }
}
