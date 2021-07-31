interface LocaleConfig {
	locale?: string
	localePath?: string
}

export interface LocaleEntries {
	[ key: string ]: string
}

export class Locale {
	private constructor( config: LocaleConfig ) {
		this._table = null
		this._pendingPromise = null
		this._lang = config.locale || 'en'
		this._localePath = config.localePath || ''
	}

	public static get instance() {
		if ( !this._instance ) {
			this._instance = new Locale( this._registeredConfig )
		}
		return this._instance
	}

	static pluralize( word: string, amount: number, pluralizer: string ) {
		if ( amount > 1 ) {
			return word + pluralizer
		}
		return word
	}

	static config( config: LocaleConfig ) {
		this._registeredConfig = {
			...this._registeredConfig,
			...config
		}
		this._instance = null
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
		return this._table[ component ]
	}

	private fetchCache< T >( cachedPromise: ()=>Promise< T > ) {
		if ( !this._pendingPromise ) {
			this._pendingPromise = new Promise< T >( resolve => resolve( cachedPromise() ) )
		}
		return this._pendingPromise
	}

	private getLocaleFilePath( locale?: string ) {
		if ( this._lang.indexOf('http') < 0 ) {
			return `${ this._localePath }/${ locale || this._lang }.json` 
		}

		return this._lang
	}

	private static _instance: Locale = null
	private static _registeredConfig: LocaleConfig = {} as LocaleConfig
	private _lang: string
	private _localePath: string
	private _pendingPromise = null
	private _table: {} = null
}
