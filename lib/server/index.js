const express = require('express')
const { join } = require('path')
module.exports = function (log) {
    return {
        init : (port, cb) => {
            const app = express()
            app.use(express.static(join(__dirname, '..','..','public')))
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
