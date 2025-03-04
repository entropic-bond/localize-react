import { Component } from 'react'
import { render } from '@testing-library/react'
import fetchMock from 'fetch-mock'
import { Locale } from './locale'
import { localize, LocalizedState, LocalizedComponent, useLocale, safeLocalize, LocaleEntries, createSafeLocalizerFor } from './localized-component'

interface SomeState extends LocalizedState {
	someState: string
}

let loadedSpy = vi.fn()

@localize( 'LocalizedWithDecorator' )
class LocalizedWithDecorator extends Component<{}, SomeState> {
	constructor( props: {}) {
		super( props )
		this.state = {
			someState: 'a decorator nice starting point',
			locale: {}
		}
	}

	onLoadLocale( locale: LocaleEntries ) {
		loadedSpy( locale )
	}

	override render() {
		return (
			<div>
				<p data-testid="casa">Casa es { this.state.locale.house }</p>
				<span>{ this.state.someState }</span>
			</div>
		)
	}
}

class LocalizedWithClass extends LocalizedComponent<{}, SomeState> {
	constructor( props: {}) {
		super( props )
		this.state = {
			...this.state,
			someState: 'a class nice starting point'
		}
	}

	override onLoadLocale( locale: LocaleEntries ): void {
		loadedSpy( locale )	
	}

	override render() {
		return (
			<div>
				<p data-testid="casa">Casa es { this.state.locale.house }</p>
				<span>{ this.state.someState }</span>
			</div>
		)
	}

	className() {
		return 'LocalizedWithClass'
	}
}

function LocalizedWithHook() {
	const locale = useLocale( 'LocalizedWithHook' )

	return (
		<div>
			<p data-testid="casa">Casa es { locale.house }</p>
		</div>
	)
}

describe( 'React Component Localizer', ()=>{
	beforeEach(()=>{
		fetchMock.mock('locales/en.json', ()=> { return {
			"hi": "Hello",
			"LocalizedWithClass": {
				"house": "albergo",
				"car": {
					"sedan": "Sedan",
					"coupe": "Coupe"
				} 
			},
			"LocalizedWithDecorator": {
				"house": "maison" 
			},
			"LocalizedWithHook": {
				"house": "morada"
			}
		}})
		Locale.config({
			localePath: 'locales' 
		})
	})

	afterEach(()=>{
		fetchMock.restore();
		loadedSpy.mockReset()
	});

	it( 'should render localized word with decorator', async ()=>{
		const wrapper = render( <LocalizedWithDecorator/> )

		const elem = await wrapper.findByText( 'Casa es maison' )
		expect( elem ).toBeInTheDocument()
	})

	it( 'should render localized word by extending class', async ()=>{
		const wrapper = render( <LocalizedWithClass/> )

		const elem = await wrapper.findByText( 'Casa es albergo' )
		expect( elem ).toBeInTheDocument()
	})

	it( 'should not overwrite state of localized class', async ()=>{
		const classWrapper = render( <LocalizedWithClass/> )
		const decoratorWrapper = render( <LocalizedWithDecorator/> )

		expect(
			await classWrapper.findByText( 'a class nice starting point' )
		).toBeInTheDocument()
		
		expect(
			await decoratorWrapper.findByText( 'a decorator nice starting point' )
		).toBeInTheDocument()
	})
	 
	it( 'should render localized word with hook', async ()=>{
		const wrapper = render( <LocalizedWithHook/> )

		const elem = await wrapper.findByText( 'Casa es morada' )
		expect( elem ).toBeInTheDocument()
	})

	it( 'should wait locale json to load', async ()=>{
		Locale.config({
			locale: 'en'
		})
		const wrapper = render( <LocalizedWithDecorator/> )

		const elem = await wrapper.findByText( 'Casa es maison' )
		expect( elem ).toBeInTheDocument()
	})

	it( 'should notify on locale loaded with decorator', async ()=>{
		const wrapper = render( <LocalizedWithDecorator/> )

		await wrapper.findByText( 'Casa es maison' )
		expect( loadedSpy ).toHaveBeenCalledWith( expect.objectContaining({ house: 'maison' }))
	})
	
	it( 'should notify on locale loaded with class', async ()=>{
		const wrapper = render( <LocalizedWithClass/> )

		await wrapper.findByText( 'Casa es albergo' )
		expect( loadedSpy ).toHaveBeenCalledWith( expect.objectContaining({ house: 'albergo' }))
	})

	it( 'should get a safe translation', async ()=>{
		const locale = await Locale.instance.get( 'LocalizedWithClass' )
		const loc = createSafeLocalizerFor( locale )
		expect( safeLocalize( locale, 'house' )).toBe( 'albergo' )
		expect( loc( 'house' )).toBe( 'albergo' )
		expect( safeLocalize( locale, 'car.sedan' )).toBe( 'Sedan' )
		expect( loc( 'car.sedan' )).toBe( 'Sedan' )
		expect( safeLocalize( locale, 'notExistingKey' )).toBe( 'notExistingKey' )
		expect( loc( 'notExistingKey' )).toBe( 'notExistingKey' )
	})

	it( 'should throw error when trying to get a translation from a non existing locale', async ()=>{
		const locale = await Locale.instance.get( 'LocalizedWithClass' )
		const loc = createSafeLocalizerFor( locale, true )
		expect( 
			()=> loc( 'carSedan' )
		).toThrow()
	})

	it( 'should not throw when locale is undefined', async ()=>{ 
		const loc = createSafeLocalizerFor( undefined )
		expect( 
			()=> loc( 'house' )
		).not.toThrow()
	})
})