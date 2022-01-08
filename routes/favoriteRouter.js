const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsite')
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    req.body.forEach(campsite => {
                        if (!favorite.campsites.includes(campsite._id)) {
                            favorite.campsites.push(campsite._id)
                        }
                    })
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                } else {
                    Favorite.create(req.body)
                        .then(favorite => {
                            req.body.forEach(campsite => {
                                if (!favorite.campsites.includes(campsite._id)) {
                                    favorite.campsites.push(campsite._id)
                                }
                                favorite.save()
                                    .then(favorite => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    })
                            })
                        })
                }
            })
            .catch(err => next(err))
    })

    .put(cors.corsWithOptions, (req, res) => {
        res.statusCode = 403;
        res.end('PUT is not supported on /favorites/:campsiteId')
    })
    .delete(cors.corsWithOptions, (req, res) => {
        Favorite.findOneAndDelete({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            } else {
                res.end('You do not have any favorites to delete.')
            }
        })
    })

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res) => {
        res.statusCode = 403;
        res.end('GET is not supported on /favorites/:campsiteId')
    })
    .post(cors.corsWithOptions, (req, res) => {
        Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            if(favorite) {
                if(favorite.campsites.includes(req.params.campsiteId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end('This campsite is already in the list of favorites!')
                } else {
                    favorite.campsites.push(req.params.campsiteId)
                    .then(favorite => {
                        favorite.save()
                    })
                }

            } else {
                Favorite.create({user: req.user, campsites: req.params.campsiteId})
                .then(favorite => {
                    favorite.save()
                })
            }
        })
        
    })
    .put(cors.corsWithOptions, (req, res) => {
        res.statusCode = 403;
        res.end('PUT is not supported on /favorites/:campsiteId')
    })
    .delete(cors.corsWithOptions, (req, res) => {
        Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            const index=favorite.campsites.indexOf(req.params.campsiteId)
            if(index>0) {
                favorite.campsites.splice(index,1)
                favorite.save().then(favorite => {
                    res.statusCode= 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('That favorite does not exist');
            }
        })
    })

module.exports = favoriteRouter;