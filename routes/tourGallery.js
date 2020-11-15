import Services from '../controller/tourGallery'
const express = require('express')
const router = express.Router()

router.get('/', Services.get)
router.get('/all', Services.getAll)
router.get('/me/:id', Services.getById)

router.post('/', Services.create)
router.post('/search', Services.search)

router.put('/', Services.update)
router.delete('/', Services.delete)

module.exports = router
