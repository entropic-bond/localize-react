import React, { Component } from 'react'
import { render } from '@testing-library/react'
import fetchMock from 'fetch-mock'
import { Locale } from './locale'
import { localize, LocalizedState, LocalizedComponent, useLocale } from './localized-component'

interface SomeState extends LocalizedState {
	someState: string
}

@localize( 'LocalizedWithDecorator' )
class LocalizedWithDecorator extends Component<{}, SomeState> {
	constructor( props: {}) {
		super( props )
		this.state = {
			someState: 'a decorator nice starting point'
		}
	}

	render() {
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
			someState: 'a class nice starting point',
			...this.state
		}
	}

	render() {
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
	beforeEach(async ()=>{
		Locale.config({
			localePath: 'locales' 
		})
		fetchMock.mock('locales/en.json', ()=> { return {
			"hi": "Hello",
			"LocalizedWithClass": {
				"house": "albergo" 
			},
			"LocalizedWithDecorator": {
				"house": "maison" 
			},
			"LocalizedWithHook": {
				"house": "morada"
			}
		}})
	})

	afterEach(()=>{
		fetchMock.restore();
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
	
})