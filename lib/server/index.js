const express = require('express')
const { join } = require('path')
const request = require('request-promise-native')
const bodyParser = require('body-parser')
const jsonPrettyHtml = require('json-pretty-html').default

module.exports = function (log) {
    return {
        init : (port, cb) => {
            const app = express()
            app.use(express.static(join(__dirname, '..','..','public')))
            app.use(bodyParser.json())

            app.post('/forward', (req, res) => {
                log.log(`Requesting url "${req.body.url}"`)
                request(req.body.url)
                    .then((data) => {
                        log.log(`Just received "${data}"`)
                        res.send(jsonPrettyHtml(JSON.parse(data)))
                    })
                    .catch((err) => {
                        const error = {
                            status: err.statusCode,
                            message: err.message

                        }
                        log.error(JSON.stringify(err))
                        res.send(jsonPrettyHtml(error))
                    })
            })

            app.get('/logs', (req, res) => {
                res.send(log.get())
            })

            const instance = app.listen(port, () => {
                log.log(`ForwardUrl server runs on port ${port}`)
                cb()
            })
            app.close = () => {
                instance.close()
            }
            return app;
        }
    }
}
