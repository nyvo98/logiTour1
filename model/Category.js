import { defaultModel, categoryType } from '../common/constants'

export default {
  title: defaultModel.object,
  description: defaultModel.object,
  image: defaultModel.array,

  viewList: defaultModel.array,
  weight: defaultModel.number,
  categoryParent: defaultModel.string,
  type: { type: String, default: categoryType.normal },
  createdUser: defaultModel.string,
  isActive: defaultModel.boolean
}
