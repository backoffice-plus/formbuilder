export const translationsErrors = {
    'error.minLength': 'Die Eingabe muss mindestens ${limit} Zeichen haben.',
    'error.maxLength': 'Die Eingabe darf nicht mehr ${limit} Zeichen haben.',
    'error.pattern': 'Die Eingabe muss folgendem Pattern entsprechen: ${pattern}',
    'error.minimum': 'Die Eingabe muss größer als ${limit} sein.',
    'error.maximum': 'Die Eingabe muss kleiner als ${limit} sein.',
    'error.required': 'Die Eingabe muss ausgefüllt sein.',
}

export const formBuilder = {
    'i18n.description': 'Alternativer Schlüssel für Übersetztungskatalog',
    'options.placeholder.label': 'Platzhalter',
    'options.placeholder.description': 'ACHTUNG: Platzhalter können derzeit noch nicht übersetzt werden',
    'pattern.description': 'zB: \"[abc]+\"',
    'oneOf.const.label': 'Name',
    'oneOf.title.label': 'Title',
}


export const formBuilderCatalogue = {
    ...translationsErrors,
    ...formBuilder,
}
