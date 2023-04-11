import { Component, useEffect, useState } from 'react'
import { Locale } from './locale'

export interface LocaleEntries {
	[ key: string | symbol ]: string & LocaleEntries
}

export interface LocalizedState {
	locale: LocaleEntries
}

/**
 * Creates a safe localizer function. The function will return the translated 
 * value associated to the keyPath. If the locale is undefined or the keyPath is
 * not found in the locale, the function will return the keyPath.
 * @param locale the locale to use
 * @param throwOnKeyNotFound if true, the function will throw an error if the keyPath is not found in the locale
 * @returns a function that will return the translated value associated to the keyPath
 * @throws Error if the keyPath is not found in the locale and throwOnKeyNotFound is true
 * @see safeLocalize
 * @sample 
 * ```ts
 * const safeLocalizer = createSafeLocalizerFor( locale ) // returns the localizer function
 * safeLocalizer( 'myComponent.myKey' ) // returns the translated value
 * ```
 * @sample const safeLocalizer = createSafeLocalizerFor( locale, true )
 * 
 */
export function createSafeLocalizerFor( locale: LocaleEntries | undefined, throwOnKeyNotFound = false ): ( keyPath: string ) => string {
	return ( keyPath: string, throwOnNotFound = throwOnKeyNotFound ) => {
		if ( !locale ) return keyPath
		const value = keyPath.split('.').reduce(( acc: {}, prop: string ) => acc[ prop ], locale )
		if ( value === undefined && throwOnNotFound ) throw Error( `Translation for ${ keyPath } not found` )
		return value || keyPath
	}
}

/**
 * Returns the translated value associated to the keyPath. If the locale is
 * undefined or the keyPath is not found in the locale, the function will return
 * the keyPath.
 * @param locale the locale to use
 * @param keyPath the key path to the value to return
 * @param throwOnKeyNotFound if true, the function will throw an error if the keyPath is not found in the locale
 * @returns the translated value associated to the keyPath
 * @throws Error if the keyPath is not found in the locale and throwOnKeyNotFound is true
 * @see createSafeLocalizerFor
 * @sample safeLocalize( locale, 'myComponent.myKey' )
 * @sample safeLocalize( locale, 'myRootKey', true )
 */
export function safeLocalize( locale: LocaleEntries | undefined, keyPath: string, throwOnKeyNotFound = false ): string {
	return createSafeLocalizerFor( locale, throwOnKeyNotFound )( keyPath )
}

export type StateWithLocale<S> = S & LocalizedState

/**
 * Derive React components from this class to provide locale capabilities.
 * 
 * The locale is a javascript object. The main entries (properties) of object
 * are the names of the components. Every component has its own entry and every
 * subentry is a key-value pair where key is the reference used in the code and
 * the value is the translation to the corresponding idiom.
 * 
 * You can use this method or @see localize method to provide localization to your 
 * component.
 */
export abstract class LocalizedComponent<P={}, S extends LocalizedState=LocalizedState> extends Component<P, S> {	
	constructor( props: P ) {
		super( props )

		this.state = { locale: {} } as S

		Promise.all([
			Locale.instance.get( this.className() ),
			Locale.instance.get( 'Generic' )
		]).then( resp => {
			const locale = { ...resp[0], ...resp[1] }

			this.setState({ locale  })
			this.onLoadLocale( locale )
		})
	}

	/**
	 * Derived classes should implement the className method to return a string 
	 * with the class name.
 	 */
	abstract className(): string

	/**
	 * Override this method to get a notification when the locale has been loaded
	 * @param locale the loaded locale
	 */
	onLoadLocale( locale: LocaleEntries ) {}
}

/**
 * Decorator to inject locale capabilities. The decorator will set the component
 * related locale strings in the locale property created on the component state. 
 * To have access to the locale state property, you should pass a state interface
 * derived from LocaleState. @see LocalizedComponent
 * 
 * You can use this method or @see LocalizedComponent method to provide 
 * localization to your component.
 * 
 * @param className the class name to retrieve the locale strings for this class.
 * @returns decorator
 */
export function localize( className: string ) {
	return function<T extends { new (...args: any[]): {} }>(constructor: T) {
		return class extends constructor {
				state = { locale: {}, ...this['state'] }
				loadLocale = Promise.all([
					Locale.instance.get( className ),
					Locale.instance.get( 'Generic' )
				]).then( resp => {
					const locale = { ...resp[0], ...resp[1] }
					this['setState']({ locale })
					this['onLoadLocale'] && this['onLoadLocale']( locale )
				})
		}
	}
}

/**
 * Hook to add locale capabilities to React functional components. The hook will 
 * return an object with the component related locale strings. 
 * 
 * @param componentName the component name associated to the locale strings.
 * @returns an object with the localized strings
 */
export function useLocale( componentName: string ) {
	const [ locale, setLocale ] = useState({} as LocaleEntries)

	useEffect( () => {

		Promise.all([
			Locale.instance.get( componentName ),
			Locale.instance.get( 'Generic' )
		]).then( resp => setLocale({ ...resp[0], ...resp[1] }))

	}, [])

	return locale
}
