export const optionsSocket = {
  /* socket.io options */
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
}

export const sendGridId = {
  change: 'd-5be7b8985f424b4085b8c6819ae41121',
  reset: 'd-7759c826d71b44b69ef886ad08ed33df',
  contactUs: 'd-7aee9b86dad34e3ebce74ecb1f25f0b4',
  newAccount: 'd-b07ab983cedb4221b2ad1d6485f8db2e',
  confirmBook: 'd-55b7f175e7cb47f681564de7a56bdb94',
  welcomeAccount: 'd-e64e6a241c1c4223a1e6e5979b02ac89'
}

export const reactionType = {
  follow: 'follow',
  like: 'like',
  bad: 'bad',
  good: 'good'
}

export const categoryType = {
  normal: 'normal'
}

export const userRole = {
  admin: 'admin',
  member: 'member',
  moderator: 'moderator'
}

export const defaultModel = {
  date: { type: Date },
  string: { type: String, default: '' },
  stringUnique: { type: String, required: true, unique: true },
  array: { type: Array, default: [] },
  number: { type: Number, default: 0 },
  boolean: { type: Boolean, default: true },
  booleanFalse: { type: Boolean, default: false },
  object: { type: Object, default: {} }
}
