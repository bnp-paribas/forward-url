const createLogger = require('./index')

describe('logger', () => {
    const maxEntries = 10
    const mockConsole = jasmine.createSpyObj('console', [
        'log',
        'error'
    ])
    let logger
    beforeEach(() => {
        logger = createLogger(maxEntries, mockConsole)
    })

    describe('console', () => {
        beforeEach(()=>{
            mockConsole.log.calls.reset()
            mockConsole.error.calls.reset()
        })
        it('should forward log to console as well', () => {
            logger.log('message1')
            expect(mockConsole.log).toHaveBeenCalledWith('message1')
        })

        it('should forward error to console as well', () => {
            logger.error('error1')
            expect(mockConsole.error).toHaveBeenCalledWith('error1')
        })
    })

    describe('log size', () => {
        it('should return an empty array', () => {
            expect(logger.get()).toEqual([])
        })

        it('should grow logs', () => {
            expect(logger.get().length).toBe(0);
            logger.log('Something happened')
            expect(logger.get().length).toBe(1);
            logger.error('Error happened')
            expect(logger.get().length).toBe(2);
        })

        it('should not grow logs beyond maxEntries', () => {
            for (let i = 0; i < maxEntries; i++) {
                logger.log('Something happened')
            }
            const messageOnly = (logs) => {
                return logs.map((log) => {
                    if (log.msg) {
                        return log.msg
                    }
                    return log
                })
            }
            expect(logger.get().length).toBe(maxEntries)
            logger.log('SurplusEntry')
            expect(logger.get().length).toBe(maxEntries)
            expect(messageOnly(logger.get())).toContain('SurplusEntry')

            logger.error('Error happened')
            expect(logger.get().length).toBe(maxEntries)
            expect(messageOnly(logger.get())).toContain('SurplusEntry')
            expect(messageOnly(logger.get())).toContain('Error happened')
        })
    })

    describe('log entries', () => {
        it('should wrap logs in objects', () => {
            logger.log('message')
            const storedLog = logger.get()[0]
            expect(storedLog.msg).toBe('message')
            expect(storedLog.timestamp).toMatch(/\d{4}-\d{2}-\d{2}.\d{2}:\d{2}:\d{2}\./)
            expect(storedLog.type).toBe('LOG')
        })
        it('should wrap errors in objects', () => {
            logger.error('message')
            const storedLog = logger.get()[0]
            expect(storedLog.msg).toBe('message')
            expect(storedLog.timestamp).toMatch(/\d{4}-\d{2}-\d{2}.\d{2}:\d{2}:\d{2}\./)
            expect(storedLog.type).toBe('ERR')
        })

        it('should keep logs in reversed order', () => {
            jasmine.clock().install()
            jasmine.clock().mockDate()

            logger.log('message')
            jasmine.clock().tick(1000)
            logger.error('message')
            const [err, log] = logger.get()
            expect(err.type).toBe('ERR')
            expect(log.type).toBe('LOG')
            expect(log.timestamp).toBeLessThan(err.timestamp)

            jasmine.clock().uninstall()
        })
    })
})