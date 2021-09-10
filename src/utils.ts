export interface TemplateValues {
	[ templateName: string ]: string;
}

export function fillTemplate( text: string, values: TemplateValues ): string {
	if ( !text ) return ''
	
	return text.replace(/\${\s*(\w*)\s*}/g, function( _match , group){
		return values[ group ] || '';
	});
}
