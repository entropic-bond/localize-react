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
			},
			"pluralizeExceptions": {
				"mouse": "mice",
				"foot": "feet"
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

	describe( 'Pluralizer', ()=>{
		
		it( 'should pluralize by default', async ()=>{
			expect( await Locale.instance.pluralize( 'apple' ) ).toEqual( 'apples' )
		})

		it( 'should pluralize exceptions', async () => {
			expect( await Locale.instance.pluralize( 'mouse' ) ).toEqual( 'mice' )
		})
		
		it( 'should not pluralize on amount equal to 1', async () => {
			expect( await Locale.instance.pluralize( 'apple', 1 ) ).toEqual( 'apple' )
		})
		
		it( 'should pluralize on amounts greather than 1', async () => {
			expect( await Locale.instance.pluralize( 'apple', 2 ) ).toEqual( 'apples' )
			expect( await Locale.instance.pluralize( 'apple', 3 ) ).toEqual( 'apples' )
		})
		
		it( 'should pluralize on negative amounts', async () => {
			expect( await Locale.instance.pluralize( 'apple', -1 ) ).toEqual( 'apples' )
			expect( await Locale.instance.pluralize( 'apple', -2 ) ).toEqual( 'apples' )
			expect( await Locale.instance.pluralize( 'apple', -3 ) ).toEqual( 'apples' )
		})

		it( 'should pluralize on 0 amount', async () => {
			expect( await Locale.instance.pluralize( 'apple', 0 ) ).toEqual( 'apples' )
		})

		it( 'should use provided pluralize function', async ()=>{
			expect( 
				await Locale.instance.pluralize( 'city', 0, Locale.rules.endsY ) 
			).toEqual( 'cities' )
		})
		
		it( 'should use rules', async ()=>{
			Locale.useRule( Locale.rules.endsY, 'en' )

			expect( 
				await Locale.instance.pluralize( 'city' ) 
			).toEqual( 'cities' )
		})		
	})
})
