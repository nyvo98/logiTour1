import queryString from 'query-string'
import axios from 'axios'
export default class WechatServices {
  static async getAuthToken () {
    const AccessToken = {
      grant_type: 'client_credential',
      appid: 'wxa7518dbeaa02b0b2',
      secret: 'b7df4c88c1e52a23a571ffbef30ec508'
    }
    const payload = await WechatServices.postGateWayWeChat('GET', `token?${queryString.stringify(AccessToken)}`, {})
    console.log(payload)
    return payload
  }

  static async getQrCode () {
    const postData = { action_name: 'QR_LIMIT_SCENE', action_info: { scene: { scene_id: 123 } } }
    const token = await WechatServices.getAuthToken()
    const access_token = token
    const payload = await WechatServices.postGateWayWeChat('POST', `qrcode/create?${queryString.stringify(access_token)}`, JSON.stringify(postData))
    console.log(payload)
  }

  static async postGateWayWeChat (method, action, body) {
    try {
      const serverUrl = 'https://api.weixin.qq.com/cgi-bin/'
      const config = {
        headers: {
          'Access-Control-Allow-Origin': '*',
          osVersion: 'website'
        }
      }

      const axiosInstance = axios.create(config)
      console.log(queryString.stringify(body))
      const response = await axiosInstance[method.toLowerCase()](serverUrl + action, body, config)
      // console.log('response', response)
      if (response.status === 200) {
        return response.data
      } else {
        return null
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }
}
