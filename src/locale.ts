interface LocaleConfig {
	locale?: string
	localePath?: string
}

type Rule = ( word: string, locale: string ) => string | undefined

export class Locale {
	private constructor( config: LocaleConfig ) {
		this._table = undefined
		this._pendingPromise = undefined
		this._lang = config.locale || 'en'
		this._localePath = config.localePath || ''
	}

	public static get instance() {
		if ( !this._instance ) {
			this._instance = new Locale( this._registeredConfig )
		}
		return this._instance
	}

	pluralize( word: string, amount: number = 0, pluralizer?: Record<string, string> | Rule ) {
		if ( amount === 1 ) return word

		let plural: string | undefined

		if ( typeof pluralizer !== 'function' ) {
			plural = pluralizer?.[ word ]
			if ( plural ) return plural
		}
		else {
			plural = pluralizer?.( word, this._lang )
		}

		let i = 0
		const rules = Locale._registeredRules[ this._lang ]
		while ( !plural && rules && i < rules.length ) {
			plural = rules[ i++ ]!( word, this._lang )
		}

		return plural || word + 's'
	}

	static config( config: LocaleConfig ) {
		this._registeredConfig = {
			...this._registeredConfig,
			...config
		}
		this._instance = undefined
	}

	async get( component: string ): Promise< {} > {
		if ( !this._table ) {
			this._table = await this.fetchCache(
				async ()=>{
					try {
						return ( await fetch( this.getLocaleFilePath()	) ).json()
					}
					catch ( error ) {
						return ( await fetch( this.getLocaleFilePath('en')	) ).json()
					}
				}
			)
		}
		return this._table![ component ]
	}

	private fetchCache< T >( cachedPromise: ()=>Promise< T > ): Promise<T> {
		if ( !this._pendingPromise ) {
			this._pendingPromise = new Promise< T >( resolve => resolve( cachedPromise() ) )
		}
		return this._pendingPromise as Promise<T>
	}

	private getLocaleFilePath( locale?: string ) {
		if ( this._lang.indexOf('http') < 0 ) {
			return `${ this._localePath }/${ locale || this._lang }.json` 
		}

		return this._lang
	}

	static useRule( rule: Rule, locale: string ) {
		if ( !Locale._registeredRules[ locale ] ) Locale._registeredRules[ locale ] = []
		Locale._registeredRules[ locale ]!.push( rule )
	}

	private static rules = [
		( word: string, locale: string ) => {
			if ( locale!=='en' ) return
			return word.slice(-1) === 'y'? word.slice( 0, -1 ) + 'ies' : undefined
		},
		( word: string, locale: string ) => {
			if ( locale !== 'en' ) return
			return word.slice( -1 ) === 's' ? word + 'es' : undefined
		}
	]

	private static _instance: Locale | undefined = undefined
	private static _registeredConfig: LocaleConfig = {} as LocaleConfig
	private static _registeredRules: {[ locale: string ]: Rule[] } = { en: Locale.rules }
	private _lang: string
	private _localePath: string
	private _pendingPromise: Promise<unknown> | undefined = undefined
	private _table: {} | undefined = undefined
}
