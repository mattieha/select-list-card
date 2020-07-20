# Select list Card

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

Display the options of an `input_select` entity as a clickable list card.   
In other words: the content of the dropdown menu is displayed as a card.  
The `input_select.select_option` service is called after the user clicks (selects) an option.

Some use cases:
* Select with too many options to show in dropdown
* Options with long titles
* Have all options directly shown 
* You dont't want the extra click to open the dropdown menu  

![List animation][card-scroll-gif]


## Using the card

### Visual Editor

Select List Card supports Lovelace's Visual Editor. Click the + button to add a card and search for select list.

![Visual Editor][visual-editor]

### Options

| Name               | Type    | Default      | Description                                                                 |
| ------------------ | ------- | ------------ | --------------------------------------------------------------------------- |
| type               | string  | **required** | `custom:select-list-card`                                                   |
| entity             | string  | **required** | An entity_id within the `input_select` domain.                              |
| title              | string  |  ``          | Card header title                                                           |
| icon               | string  |  ``          | Card header icon                                                            |
| show_toggle        | boolean | `false`      | Card header toggle                                                          |
| truncate           | boolean | `true`       | Truncate option text to fit 1 line                                          |
| scroll_to_selected | boolean | `true`       | Scroll the list to the position of the selected option                      |
| max_options        | number  | `5`          | Number of options before a scrollbar appears, 0 = no scrollbar              |



### Manual yaml mode

```yaml
type: 'custom:select-list-card'
entity: input_select.tracks
title: Tracks
icon: 'mdi:playlist-music'
max_options: 6
scroll_to_selected: true
show_toggle: true
truncate: true
```


## Installation

### HACS

This card is available in [HACS][hacs] (Home Assistant Community Store).

Just search for `Select list Card` in Frontend tab.

### Manual

1. Download `select-list-card.js` file from the [latest-release].
2. Put `select-list-card.js` file into your `config/www` folder.
3. Add reference to `select-list-card.js` in Lovelace. There's two way to do that:
   1. **Using UI:** _Configuration_ → _Lovelace Dashboards_ → _Resources_ → Click Plus button → Set _Url_ as `/local/select-list-card.js` → Set _Resource type_ as `JavaScript Module`.
   2. **Using YAML:** Add following code to `lovelace` section.
      ```yaml
      resources:
        - url: /local/select-list-card.js
          type: module
      ```
4. Add `custom:select-list-card` to Lovelace UI as any other card (using either editor or YAML configuration).


## Supported languages

This card supports translations. Please, help to add more translations and improve existing ones. Here's a list of supported languages:

- English
- Nederlands (Dutch)
- [_Your language?_][add-translation]

## Support

Hey dude! Help me out for a couple of :beers: or a :coffee:!

[![beer](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/mattijsha)

<!-- References -->

[hacs]: https://hacs.xyz
[visual-editor]: https://raw.githubusercontent.com/mattieha/select-list-card/master/assets/visual_editor.png
[card-scroll-gif]: https://raw.githubusercontent.com/mattieha/select-list-card/master/assets/card_scroll.gif
[latest-release]: https://github.com/mattieha/select-list-card/releases/latest
[add-translation]: https://github.com/mattieha/select-list-card/tree/master/src/localize/languages
[releases-shield]: https://img.shields.io/github/release/mattieha/select-list-card.svg?style=for-the-badge
[releases]: https://github.com/mattieha/select-list-card/releases
[license-shield]: https://img.shields.io/github/license/mattieha/select-list-card.svg?style=for-the-badge
