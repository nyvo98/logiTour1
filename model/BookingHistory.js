import { defaultModel } from '../common/constants'

export default {
  payment: defaultModel.object,
  tourId: defaultModel.string,
  isPayment: defaultModel.booleanFalse,
  createdUser: defaultModel.string,
  bookingInfo: defaultModel.object,

  isActive: defaultModel.boolean
}
