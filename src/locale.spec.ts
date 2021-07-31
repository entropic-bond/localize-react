import fetchMock from "fetch-mock"
import { Locale } from "./locale"

describe( 'Locale', ()=> {
	beforeEach(()=>{
		Locale.config({
			localePath: 'locales' 
		})
		fetchMock.mock('locales/en.json', ()=> { return {
			"hi": "Hello",
			"moduleA": {
				"bye": "Bye",
				"goodMorning": "Good Morning"
			}
		}})
		fetchMock.mock('locales/es.json', ()=> { return {
			"hi": "Hola!!!"
		}})
	})

	afterEach( () => fetchMock.restore() )

	it( 'should translate string', async()=> {
		expect( await Locale.instance.get('hi') ).toEqual( 'Hello' )
	})

	it( 'should change locale', async ()=> {
		Locale.config({ locale: 'es' })
		expect( await Locale.instance.get('hi') ).toEqual( 'Hola!!!' )
	})

	it( 'should work for named modules', async ()=>{
		Locale.config({ locale: 'en' })
		const module:{} = await Locale.instance.get( 'moduleA' )
		expect( module[ 'bye' ] ).toEqual( 'Bye' )
		expect( module[ 'goodMorning' ] ).toEqual( 'Good Morning' )
	})

	it( 'should retrieve data only once in successive calls to get (cache calls)', async ()=>{
		expect( fetchMock.calls().length ).toBe( 0 )
		Locale.instance.get( 'moduleA' )
		Locale.instance.get( 'hi' )
		Locale.instance.get( 'moduleA' )['bye']
		expect( fetchMock.calls('locales/en.json').length ).toBe( 1 )
	})
})
