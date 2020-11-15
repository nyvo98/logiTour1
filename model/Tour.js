import { defaultModel } from '../common/constants'

export default {
  title: defaultModel.object,
  description: defaultModel.object,
  isBest: defaultModel.booleanFalse,

  subDescription: defaultModel.object,
  image: defaultModel.array,
  price: defaultModel.number,

  bookingInfoList: defaultModel.object,
  tourInfoList: defaultModel.object,
  tourScheduleList: defaultModel.array,
  contactList: defaultModel.object,

  bookingList: defaultModel.array,
  viewList: defaultModel.array,
  reactionList: defaultModel.array,
  commentList: defaultModel.array,
  shareLink: defaultModel.string,
  createdUser: defaultModel.string,
  isActive: defaultModel.boolean
}
