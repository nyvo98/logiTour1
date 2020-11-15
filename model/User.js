import { defaultModel, userRole } from '../common/constants'

export default {
  id: defaultModel.stringUnique,

  firstName: defaultModel.string,
  lastName: defaultModel.string,
  locale: defaultModel.string,
  email: defaultModel.string,
  image: defaultModel.string,
  sex: defaultModel.booleanFalse,
  residentNum: defaultModel.string,
  phone: defaultModel.string,
  address: defaultModel.string,
  nation: defaultModel.string,
  nationCode: defaultModel.string,

  password: defaultModel.string,
  role: { type: String, default: userRole.member },

  isVerify: defaultModel.booleanFalse,
  isActive: defaultModel.boolean,
  deviceId: defaultModel.string
}
