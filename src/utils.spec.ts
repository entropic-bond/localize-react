import { fillTemplate } from './utils'

describe( 'Utils', ()=>{
	describe( 'fillTemplates', ()=>{
		const text = 'The population of ${country} is ${ people} million \
											and the GDP is $${ gdpValue } million'
		const expected = 'The population of U.S.A. is 100 million \
											and the GDP is $1000 million'
		const vars = {
			country: 'U.S.A.',
			people: '100',
			gdpValue: '1000'
		}

		it( 'should replace vars as a template literal', ()=>{
			expect( fillTemplate( text, vars ) ).toEqual( expected )
		})

		it( 'should replace vars with empty value', ()=>{
			vars.country = ''
			vars.people = undefined

			expect( 
				fillTemplate( 
					'The population of ${country} is ${ people} million', 
					vars 
				) 
			).toEqual( 'The population of  is  million' )
		})

		it( 'should resturn empty string on falsy', ()=>{
			expect( fillTemplate( undefined, vars ) ).toEqual( '' )
			expect( fillTemplate( null, vars ) ).toEqual( '' )
			expect( fillTemplate( '', vars ) ).toEqual( '' )
		})
		
	})
	
})