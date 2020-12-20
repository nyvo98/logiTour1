import { generateID } from '../common/function'
const fs = require('fs')
const formidable = require('formidable')
var paypal = require('paypal-rest-sdk')
const path = require('path')

export default class OtherServices {
  static async makePaypal (amount, name, description) {
    return new Promise(async (resolve, reject) => {
      paypal.configure({
        mode: 'sandbox',
        client_id: 'AZSVT4JMRsiLUMxS1VeC4GUoiK2-vt2xAhOfGy8p49c1E8-cIeOdGCp4kuCqKTIV5ZOr1A-YXQmyom4-',
        client_secret: 'EIBYBTmAZlobLZU7zLAnaDcmrmwCW7ZbQG2crGvxg6WWC9-dEznM5jEOt04sZDVGGJNsEQKuHqQhbDKf'
      })

      var createPayment = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: 'http://localhost:3032/api/tour/paypalResponse',
          cancel_url: 'http://localhost:3032/api/tour/paypalResponse'
        },
        transactions: [{
          item_list: {
            items: [{
              name,
              sku: name,
              price: amount,
              currency: 'USD',
              quantity: 1
            }]
          },
          amount: {
            currency: 'USD',
            total: amount
          },
          description
        }]
      }

      paypal.payment.create(createPayment, function (error, payment) {
        if (error) {
          resolve(null)
        } else {
          resolve(payment)
        }
      })
    })
  }

  static async uploadImage (req, res) {
    try {
      const newID = generateID()
      // to declare some path to store your converted image
      const path = './images/' + newID + '.png'

      const imgdata = req.body.base64

      // to convert base64 format into random filename
      const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '')

      fs.writeFileSync(path, base64Data, { encoding: 'base64' })

      res.json(path)
    } catch (e) {
      console.log(e)
      res.json(null)
    }
  }

  static async uploadFile (req, res) {
    try {
      const form = new formidable.IncomingForm()
      form.uploadDir = './uploads/'
      form.parse(req, (err, fields, files) => {
        if (err) throw err
        const tmpPath = files.file.path
        const fileName = generateID()

        const newPath = form.uploadDir + fileName
        fs.rename(tmpPath, newPath, (err) => {
          if (err) throw err
          switch (files.file.type) {
          default:
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.json(fileName)
            break
          }
        })
      })
      return
    } catch (e) {
      console.log(e)
      res.json(null)
    }
  }

  static async getFile (req, res) {
    const linkFile = `./uploads/${req.params.linkImage}`
    fs.readFile(linkFile, function (err, data) {
      if (!err) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(data)
      } else {
        fs.readFile(`${__dirname}/default.png`, function (err, data) {
          if (!err) {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(data)
          } else {
            res.json('')
          }
        })
      }
    })
  }

  static async getImage (req, res) {
    const linkFile = `./images/${req.params.linkImage}`
    fs.readFile(linkFile, function (err, data) {
      if (!err) {
        res.writeHead(200, { 'Content-Type': 'image/png' })
        res.end(data) // Send the file data to the browser.
      } else {
        fs.readFile(`${__dirname}/default.png`, function (err, data) {
          if (!err) {
            res.writeHead(200, { 'Content-Type': 'image/png' })
            res.end(data) // Send the file data to the browser.
          } else {
            res.json('')
          }
        })
      }
    })
  }

  static async downloadImage (req, res) {
    const linkFile = path.join(__dirname, `../images/${req.params.linkImage}`)
    res.download(linkFile)
  }

  static async getFileLang (req, res) {
    try {
      const { lang } = req.params
      fs.readFile(`./static/Lang/${lang}.json`, function (err, data) {
        if (!err) {
          const payload = JSON.parse(data)
          res.json(payload)
        } else {
          res.json(false)
        }
      })
    } catch (error) {
      res.status(500).send('error :' + error)
    }
  }

  static async updateFileLang (req, res) {
    try {
      const { data, lang } = req.body

      const dataFile = JSON.stringify(data)
      fs.writeFile(`./static/Lang/${lang}.json`, dataFile, function (err, result) {
        if (!err) {
          res.json(true)
        } else {
          res.json(false)
        }
      })
    } catch (error) {
      res.status(500).send('error :' + error)
    }
  }
}
