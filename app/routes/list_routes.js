
const express     = require('express'),
passport          = require('passport'),
List              = require('../models/list'),
customErrors      = require('../../lib/custom_errors'),
handle404         = customErrors.handle404,
requireOwnership  = customErrors.requireOwnership,
removeBlanks      = require('../../lib/remove_blank_fields'),
requireToken      = passport.authenticate('bearer', { session: false }),
router            = express.Router()





// INDEX
router.get('/lists', (req, res, next) => {
  List.find()
    .then(lists => {
      return lists.map(list => list.toObject())
    })
    .then(lists => res.status(200).json({ lists: lists }))
    .catch(next)
})

// SHOW
router.get('/lists/:id', requireToken, (req, res, next) => {
  List.findById(req.params.id)
    .then(handle404)
    .then(list => res.status(200).json({ list: list.toObject() }))
    .catch(next)
})

// CREATE
router.post('/lists', requireToken, (req, res, next) => {
  // set owner of new blog to be current user
  req.body.list.owner = req.user.id

  List.create(req.body.list)

    .then(list => {
      res.status(201).json({ list: list.toObject() })
    })
    .catch(next)
})

// UPDATE
router.patch('/lists/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.list.owner

  List.findById(req.params.id)
    .then(handle404)
    .then(list => {
      requireOwnership(req, list)
      return list.updateOne(req.body.list)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DESTROY
router.delete('/lists/:id', requireToken, (req, res, next) => {
  List.findById(req.params.id)
    .then(handle404)
    .then(list => {
      requireOwnership(req, list)
      list.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
