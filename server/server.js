"use strict";

const CONCURRENCY = process.env.WEB_CONCURRENCY || 1

const dicebot     = require('./dicebot')
const express     = require('express')
const path        = require('path')
const cluster     = require('express-cluster')

cluster(function(worker) {

    var app = express()

    app.set('views', path.join(__dirname, '..', 'client'))
    app.set('view engine', 'pug')

    app.use('/css', express.static(path.join(__dirname, '..', 'client', 'css')))
    app.use('/js', express.static(path.join(__dirname, '..', 'client', 'js')))
    app.use('/img', express.static(path.join(__dirname, '..', 'client', 'img')))

    app.get('/listen', function (req, res) {
        var input = req.query.q.toLowerCase()
        res.json(dicebot.analyze(input))
    })

    app.get('*', function (req, res) {
        res.render('index')
    })

    app.listen(8888, function (error) {
        if (error) {
            console.error(error)
        } else {
            console.info("==> Listening on port 8888.")
        }
    })

}, {count: CONCURRENCY})
