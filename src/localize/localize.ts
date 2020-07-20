import * as en from './languages/en.json';
import * as es from './languages/es.json';
import * as hu from './languages/hu.json';
import * as nl from './languages/nl.json';

const languages = {
  en: en,
  es: es,
  hu: hu,
  nl: nl,
};

export function localize(string: string, search: string = '', replace: string = ''): string {
  const section = string.split('.')[0];
  const key = string.split('.')[1];

  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_');

  let tranlated: string;

  try {
    tranlated = languages[lang][section][key];
  } catch (e) {
    tranlated = languages['en'][section][key];
  }

  if (tranlated === undefined) tranlated = languages['en'][section][key];

  if (search !== '' && replace !== '') {
    tranlated = tranlated.replace(search, replace);
  }
  return tranlated;
}
