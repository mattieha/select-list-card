# Select list Card by [@mattieha](https://github.com/mattieha)

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

Display the options of an input_select entity as a clickable list card.   
In other words: the content of the dropdown menu is displayed as a card.  

Some use cases:
* Select with (too) many options
* Options with long titles
* Have all options directly shown 
* You dont't want the extra click to open the dropdown menu  

## Usage

### Visual Editor

Select List Card supports Lovelace's Visual Editor. Click the + button to add a card and search for select list.

![Visual Editor](https://raw.githubusercontent.com/mattieha/select-list-card/master/assets/visual_editor.png)

## Examples

### Default config

![card](https://raw.githubusercontent.com/mattieha/select-list-card/master/assets/card.png)

```yaml
type: 'custom:select-list-card'
entity: input_select.scenes
```

## Options

| Name               | Type    | Requirement  | Description                                 | Default             |
| ------------------ | ------- | ------------ | ------------------------------------------- | ------------------- |
| type               | string  | **Required** | `custom:select-list-card`                   |                     |
| entity             | string  | **Required** | Entity id of an input_select                |                     |
| name               | string  | **Optional** | Card name                                   | ``                  |
| truncate           | boolean | **Optional** | Truncate option text                        | `true`              |
| scroll_to_selected | boolean | **Optional** | Scroll to selected option                   | `true`              |
| max_options        | number  | **Optional** | Max options before scroll bar shows         | `5`                 |


## Installation

### HACS

Install using [HACS](https://hacs.xyz) and add the following to your config:


```yaml
resources:
  - url: /hacsfiles/select-list-card/select-list-card.js
    type: module
```

### Manual

Download select-list-card.js from the [latest realease](https://github.com/mattieha/select-list-card/releases/latest) and place it in your `config/www` folder. Add the following to your config:

```yaml
resources:
  - url: /local/select-list-card.js
    type: module
```



## Support

Hey dude! Help me out for a couple of :beers: or a :coffee:!

[![beer](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/mattijsha)
