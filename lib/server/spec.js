const createServerModule = require('./index')
const mockLog = jasmine.createSpyObj('console',[
    'log',
    'error'
])

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
chai.use(chaiHttp)

describe('serverModule', () => {
    let serverModule
    beforeEach(() => {
        serverModule = createServerModule(mockLog)
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
    describe('public', () => {
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
    
})