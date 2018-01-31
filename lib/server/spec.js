const createServerModule = require('./index')
const mockLog = jasmine.createSpyObj('console',[
    'log',
    'error'
])

const jsonPrettyHtml = require('json-pretty-html').default

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
chai.use(chaiHttp)

const nock = require('nock')

describe('serverModule', () => {
    let serverModule
    beforeEach(() => {
        serverModule = createServerModule(mockLog)
    })
    afterEach(() => {
        mockLog.log.calls.reset()
        mockLog.error.calls.reset()
    })

    describe('init', () => {
        it('should return an express app that you can close', (done) => {
            const port = 8000
            const instance = serverModule.init(port, () => {
                expect(mockLog.log).toHaveBeenCalledWith(`ForwardUrl server runs on port ${port}`)
                instance.close()
                done()
            })
        })
    })
    describe('/', () => {
        let instance
        beforeEach((done) => {
            instance = serverModule.init(8000, done)
        })
        afterEach(() => {
            instance.close()
        })

        it('should provide a index.html on root', (done) => {
            chai.request(instance)
                .get('/')
                .end((err, res) => {
                    expect(err).toBeNull()
                    res.should.have.status(200);
                    res.text.should.match(/<html>/)
                    done()
                })
        })
    })

    describe('/foward', ()  => {
        const workingUrl = 'http://www.working-url.com'
        const mockData = {
            meaningOfLife: 42,
            hellOnEarth: 'working'
        }
        const failingUrl = 'http://www.failing-url.com'
        let instance, flushRequest
        beforeEach((done) => {
            nock(workingUrl)
                .get('/')
                .reply(200, mockData)

            nock(failingUrl)
                .get('/')
                .reply(404, {error: "Resource not found"})

            instance = serverModule.init(8000, done)
            flushRequest = (cb) => {
                chai.request(instance)
                    .post('/forward')
                    .send({url: workingUrl})
                    .end(cb)
            }
        })
        afterEach(() => {
            instance.close()
        })

        it('should forward the url passed in', (done) => {
            flushRequest((err, res) => {
                expect(err).toBeNull()
                res.text.should.equal(jsonPrettyHtml(mockData))
                done()
            })
        })

        it('should log start of request', (done) => {
            flushRequest((err, res) => {
                expect(mockLog.log).toHaveBeenCalledWith(`Requesting url "${workingUrl}"`)
                done()
            })
        })

        it('should log receivement of data', (done) => {
            flushRequest((err, res) => {
                expect(mockLog.log).toHaveBeenCalledWith(`Just received "${JSON.stringify(mockData)}"`)
                done()
            })
        })

        it('should error received error', (done) => {
            chai.request(instance)
            .post('/forward')
            .send({url: failingUrl})
            .end((err, data)=> {
                expect(mockLog.error).toHaveBeenCalled()
                done()
            })
        })

    })
    
})