import { LitElement, html, customElement, property, TemplateResult, CSSResult, css } from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { SelectListCardConfig } from './types';

const options = {
  required: {
    icon: 'tune',
    name: 'Required',
    secondary: 'Required options for this card to function',
    show: true,
  },
  appearance: {
    icon: 'palette',
    name: 'Appearance',
    secondary: 'Customize the name, max-height, truncate',
    show: true,
  },
};

@customElement('select-list-card-editor')
export class SelectListCardEditor extends LitElement implements LovelaceCardEditor {
  @property() public hass?: HomeAssistant;
  @property() private _config?: SelectListCardConfig;
  @property() private _toggle?: boolean;

  public setConfig(config: SelectListCardConfig): void {
    this._config = config;
  }

  get _name(): string {
    if (this._config) {
      return this._config.name || '';
    }

    return '';
  }

  get _entity(): string {
    if (this._config) {
      return this._config.entity || '';
    }

    return '';
  }

  get _truncate(): boolean {
    if (this._config) {
      return this._config.truncate || true;
    }

    return true;
  }

  get _scroll_to_selected(): boolean {
    if (this._config) {
      return this._config.scroll_to_selected || true;
    }

    return true;
  }

  get _max_options(): number {
    if (this._config) {
      return this._config.max_options || 5;
    }
    return 5;
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    // You can restrict on domain type
    const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'input_select');

    return html`
      <div class="card-config">
        <div class="values">
          <div class="row">
            <paper-dropdown-menu
              label="Entity (Required)"
              @value-changed=${this._valueChanged}
              .configValue=${'entity'}
            >
              <paper-listbox slot="dropdown-content" .selected=${entities.indexOf(this._entity)}>
                ${entities.map(entity => {
                  return html`
                    <paper-item>${entity}</paper-item>
                  `;
                })}
              </paper-listbox>
            </paper-dropdown-menu>
          </div>
          <div class="row">
            <paper-input
              label="Name (Optional)"
              .value=${this._name}
              .configValue=${'name'}
              @value-changed=${this._valueChanged}
            ></paper-input>
          </div>
          <div class="row">
            <paper-input
              label="Max options (0 = show all)"
              .value=${this._max_options}
              .configValue=${'max_options'}
              type="number"
              @value-changed=${this._valueChanged}
            ></paper-input>
          </div>
          <div class="row">
            <ha-switch
              aria-label=${`Toggle truncate ${this._truncate ? 'off' : 'on'}`}
              .checked=${this._truncate}
              .configValue=${'truncate'}
              @change=${this._valueChanged}
              >Truncate long names?</ha-switch
            >
          </div>
          <div class="row">
            <ha-switch
              aria-label=${`Toggle scroll to selected ${this._truncate ? 'off' : 'on'}`}
              .checked=${this._scroll_to_selected}
              .configValue=${'scroll_to_selected'}
              @change=${this._valueChanged}
              >Scroll to selected?</ha-switch
            >
          </div>
        </div>
      </div>
    `;
  }

  private _toggleOption(ev): void {
    this._toggleThing(ev, options);
  }

  private _toggleThing(ev, optionList): void {
    const show = !optionList[ev.target.option].show;
    for (const [key] of Object.entries(optionList)) {
      optionList[key].show = false;
    }
    optionList[ev.target.option].show = show;
    this._toggle = !this._toggle;
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    const value = target.configValue === 'max_options' ? parseInt(target.value) : target.value;
    if (this[`_${target.configValue}`] === value) {
      return;
    }
    if (target.configValue) {
      if (value === '') {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static get styles(): CSSResult {
    return css`
      .row {
        margin-bottom: 5px;
      }
      .values {
        padding-left: 0px;
      }
      paper-dropdown-menu {
        width: 100%;
      }
      ha-switch {
        padding-bottom: 8px;
      }
    `;
  }
}
