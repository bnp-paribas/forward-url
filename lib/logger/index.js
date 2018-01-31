module.exports = function createLogger(maxEntries) {
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
            timestamp: now.getTime(),
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
        },
        error: (msg) => {
            assureMaxEntries()
            log.unshift(wrapLog(ERR, msg))
        }
    }
}