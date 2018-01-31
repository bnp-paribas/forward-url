const createLogger = require('./index')

describe('logger', () => {
    describe('when no logs have happend yet', () => {
        maxEntries = 10
        let logger
        beforeEach(() => {
            logger = createLogger(maxEntries)
        })

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

        describe('log entries', () => {
            it('should wrap logs in objects', () => {
                logger.log('message')
                const storedLog = logger.get()[0]
                expect(storedLog.msg).toBe('message')
                expect(typeof storedLog.timestamp).toEqual('number')
                expect(storedLog.type).toBe('LOG')
            })
            it('should wrap errors in objects', () => {
                logger.error('message')
                const storedLog = logger.get()[0]
                expect(storedLog.msg).toBe('message')
                expect(typeof storedLog.timestamp).toEqual('number')
                expect(storedLog.type).toBe('ERR')
            })

            it('should keep logs in reversed order', () => {
                jasmine.clock().install()

                logger.log('message')
                jasmine.clock().tick(10)
                logger.error('message')
                const [err, log] = logger.get()
                expect(err.type).toBe('ERR')
                expect(log.type).toBe('LOG')
                expect(log.timestamp).toBeLessThan(err.timestamp)

                jasmine.clock().uninstall()
            })
        })
    })
})