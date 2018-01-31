module.exports = function createLogger(maxEntries, console) {
    const log = []
    const assureMaxEntries = () => {
        if (log.length < maxEntries) {
            return
        }
        log.pop()
    }
    const LOG = 'LOG'
    const ERR = 'ERR'
    const wrapLog = (type, msg) => {
        const now = new Date()
        return {
            msg: msg,
            timestamp: now.toISOString(),
            type: type
        }
    }
    return {
        get: () => {
            return log;
        },
        log: (msg) => {
            assureMaxEntries()
            log.unshift(wrapLog(LOG, msg))
            console.log(msg)
        },
        error: (msg) => {
            assureMaxEntries()
            log.unshift(wrapLog(ERR, msg))
            console.error(msg)
        }
    }
}