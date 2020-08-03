import { LitElement, html, customElement, property, TemplateResult, CSSResult, css } from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor, stateIcon } from 'custom-card-helpers';
import { localize } from './localize/localize';
import { SelectListCardConfig } from './types';

@customElement('select-list-card-editor')
export class SelectListCardEditor extends LitElement implements LovelaceCardEditor {
  @property() public hass?: HomeAssistant;
  @property() private _config?: SelectListCardConfig;

  public setConfig(config: SelectListCardConfig): void {
    this._config = config;
  }

  get _title(): string {
    if (this._config) {
      return this._config.title || '';
    }

    return '';
  }

  get _icon(): string {
    if (this._config) {
      return this._config.icon || '';
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

  get _show_toggle(): boolean {
    if (this._config) {
      return this._config.show_toggle || false;
    }

    return false;
  }

  get _max_options(): number {
    if (this._config) {
      return typeof this._config.max_options !== 'undefined' ? this._config.max_options : 5;
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
              label="${localize('editor.entity')}"
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
            <div class="side-by-side">
              <paper-input
                label="${localize('editor.title')}"
                .value=${this._title}
                .configValue=${'title'}
                @value-changed=${this._valueChanged}
              ></paper-input>
              <paper-input
                .configValue=${'icon'}
                .value=${this._icon}
                .label="${localize('editor.icon')}"
                .placeholder=${this._icon || stateIcon(this.hass.states[this._entity])}
                @value-changed=${this._valueChanged}
                pattern="^\\\\S+:\\\\S+$"
              >
                ${this._icon || stateIcon(this.hass.states[this._entity])
                  ? html`
                      <ha-icon .icon=${this._icon || stateIcon(this.hass.states[this._entity])} slot="suffix">
                      </ha-icon>
                    `
                  : ''}
              </paper-input>
            </div>
          </div>
          <div class="row">
            <paper-input
              label="${localize('editor.max_options')}"
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
            >
            </ha-switch>
            <span class="switch-label">${localize('editor.truncate')}</span>
          </div>
          <div class="row">
            <ha-switch
              aria-label=${`Toggle scroll to selected ${this._scroll_to_selected ? 'off' : 'on'}`}
              .checked=${this._scroll_to_selected}
              .configValue=${'scroll_to_selected'}
              @change=${this._valueChanged}
            >
            </ha-switch>
            <span class="switch-label">${localize('editor.scroll_to_selected')}</span>
          </div>
          <div class="row">
            <ha-switch
              aria-label=${`Toggle show toggle ${this._show_toggle ? 'off' : 'on'}`}
              .checked=${this._show_toggle}
              .configValue=${'show_toggle'}
              @change=${this._valueChanged}
            >
            </ha-switch>
            <span class="switch-label">${localize('editor.show_toggle')}</span>
          </div>
        </div>
      </div>
    `;
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
    const skipValues = ['entity', 'title', 'icon'];
    if (target.configValue) {
      if (value === '' && !skipValues.includes(target.configValue)) {
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
      .side-by-side {
        display: flex;
      }
      .side-by-side > * {
        flex: 1;
        padding-right: 4px;
      }
      .switch-label {
        margin-left: 10px;
      }
    `;
  }
}
