"use strict";

const CONCURRENCY = process.env.WEB_CONCURRENCY || 1
const PORT        = process.env.PORT || 5000

const dicebot     = require('./dicebot')
const express     = require('express')
const path        = require('path')
const cluster     = require('express-cluster')

cluster(function(worker) {

    var app = express()

    app.set('views', path.join(__dirname, '..', 'client'))
    app.set('view engine', 'pug')

    app.use(function(req, res, next) {
        let schema = req.headers['x-forwarded-proto']
        console.log(schema)
        if (schema === 'https' || !schema) {
            next()
        } else {
            res.redirect('https://' + req.headers.host + req.url)
        }
    })

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

    app.listen(PORT, function (error) {
        if (error) {
            console.error(error)
        } else {
            console.info(`==> Listening on port ${PORT}.`)
        }
    })

}, {count: CONCURRENCY})
