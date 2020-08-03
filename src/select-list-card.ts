import { CallServiceActionConfig } from 'custom-card-helpers/dist';
import { HassEntity } from 'home-assistant-js-websocket';
import {
  LitElement,
  html,
  customElement,
  property,
  CSSResult,
  TemplateResult,
  css,
  PropertyValues,
  query,
} from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  LovelaceCardEditor,
  getLovelace,
  LovelaceCard,
} from 'custom-card-helpers';

import './editor';

import { SelectListCardConfig } from './types';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  select-list-card \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'select-list-card',
  name: `${localize('common.name')}`,
  description: `${localize('common.description')}`,
  preview: true,
});

@customElement('select-list-card')
export class SelectListCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('select-list-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(hass, entities): object {
    const entity = entities.find(item => item.startsWith('input_select'));
    const dummy = hass;
    return {
      entity: entity || '',
      icon: '',
      truncate: true,
      show_toggle: false,
      scroll_to_selected: true,
      multi: false,
      max_options: 5,
    };
  }

  public setConfig(config: SelectListCardConfig): void {
    if (!config || !config.entity || !config.entity.startsWith('input_select')) {
      throw new Error(localize('error.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      title: '',
      icon: '',
      show_toggle: false,
      truncate: true,
      scroll_to_selected: true,
      max_options: 5,
      multi: false,
      toolbar: true,
      ...config,
    };
    this.open = this.open || this.config.open;
  }

  public async getCardSize(): Promise<number> {
    let size = 0;
    if (!this.config) {
      return size;
    }
    size += this.config.title ? 1 : 0;
    size += this.config.max_options ? this.config.max_options : this.options.length;
    return size;
  }

  @property() public hass!: HomeAssistant;
  @property() private config!: SelectListCardConfig;
  @property() private open = true;
  @query('#list') private listEl;
  private options: string[] = [];
  private selected: string | string[] = [];

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this.config.entity) {
      return this.showError();
    }
    const stateObj = this.stateObj;
    const selected = stateObj.state;
    this.options = stateObj.attributes.options;
    const style = this.config.max_options === 0 ? '' : `max-height: ${(this.config.max_options || 5) * 48 + 16}px`;
    return html`
      <ha-card aria-label=${`Select list card: ${this.config.entity}`}>
        ${this.config.title && this.config.title.length
          ? html`
              <div
                class="card-header ${this.config.show_toggle ? 'pointer' : ''}"
                @click=${this.toggle}
                ?open=${this.open}
              >
                <div class="name">
                  ${this.config.icon && this.config.icon.length
                    ? html`
                        <ha-icon class="icon" .icon="${this.config.icon}"></ha-icon>
                      `
                    : ''}
                  ${this.config.title}
                </div>
                ${this.config.show_toggle
                  ? html`
                      <ha-icon class="pointer" .icon="${this.open ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                    `
                  : ''}
              </div>
            `
          : ''}
        ${this.config.multi
          ? html`
              <paper-listbox
                id="list"
                @selected-items-changed=${this.selectedOptionsChanged}
                style="${style}"
                multi
                ?open=${this.open}
              >
                ${this.renderOptions()}
              </paper-listbox>
            `
          : html`
              <paper-listbox
                id="list"
                @iron-select=${this.selectedOptionChanged}
                .selected=${this.options.indexOf(selected)}
                style="${style}"
                ?open=${this.open}
              >
                ${this.renderOptions()}
              </paper-listbox>
            `}
        ${this.renderToolbar()}
      </ha-card>
    `;
  }

  private get stateObj(): HassEntity {
    return this.hass.states[this.config.entity] as HassEntity;
  }

  private toggle(): void {
    if (!this.config.show_toggle) {
      return;
    }
    this.open = !this.open;
    if (this.open) {
      const selected = this.listEl.querySelector('.iron-selected') as HTMLElement;
      if (selected) {
        setTimeout(() => {
          this.setScrollTop(selected.offsetTop);
        }, 100);
      }
    }
  }

  private setScrollTop(offsetTop: number): void {
    if (!this.config.scroll_to_selected) {
      return;
    }
    this.listEl.scrollTop = offsetTop - (this.listEl.offsetTop + 8);
  }

  private async selectedOptionsChanged(ev: any): Promise<any> {
    const options = ev.detail.value.map(item => item.innerText.trim());
    this.selected = options;
    console.log('EV', options);
  }

  private async selectedOptionChanged(ev: any): Promise<any> {
    const option = ev.detail.item.innerText.trim();
    this.selected = option;
    const selected = this.stateObj.state;
    if (ev.detail && ev.detail.item) {
      this.setScrollTop(ev.detail.item.offsetTop);
    }
    if (option === selected) {
      return;
    }
    await SelectListCard.setInputSelectOption(this.hass, this.config.entity, option);
  }

  private static setInputSelectOption(hass: HomeAssistant, entity: string, option: string): Promise<any> {
    return hass.callService('input_select', 'select_option', {
      option,
      entity_id: entity,
    });
  }

  private callDebug(): void {
    console.log('EL', this.listEl);
    console.log('ITEMS', this.listEl.selectedItems);
    console.log('SELECTED', this.selected);
  }

  private callService(actionConfig: CallServiceActionConfig, options: string): Promise<any> {
    const [domain, service] = actionConfig.service.split('.', 2);
    return this.hass.callService(domain, service, {
      options,
      ...actionConfig.service_data,
    });
  }

  private renderOptions(): TemplateResult {
    return html`
      ${this.options.map(option => {
        if (this.config.truncate) {
          return html`
            <paper-item title="${option}"><div class="truncate-item">${option}</div></paper-item>
          `;
        }
        return html`
          <paper-item>${option}</paper-item>
        `;
      })}
    `;
  }

  private renderToolbar(): TemplateResult {
    if (!this.config.toolbar) {
      return html``;
    }
    return html`
      <div class="toolbar">
        <paper-button @click=${this.callDebug}>
          <ha-icon icon="hass:play"></ha-icon>
          Execute
        </paper-button>
      </div>
    `;
  }

  private showError(): TemplateResult {
    return html`
        <ha-card>
          <div class="preview not-available">
            <div class="metadata">
              <div class="not-available">
                ${localize('error.not_available')}
              </div>
            <div>
          </div>
        </ha-card>
      `;
  }

  static get styles(): CSSResult {
    return css`
      select-list-card:focus {
        outline: none;
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        user-select: none;
      }
      .pointer {
        cursor: pointer;
      }
      paper-listbox {
        display: none;
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-color: var(--scrollbar-thumb-color) transparent;
        scrollbar-width: thin;
        background: var(--paper-card-background-color);
      }
      paper-listbox[open] {
        display: block;
      }
      paper-listbox::-webkit-scrollbar {
        width: 0.4rem;
        height: 0.4rem;
      }
      paper-listbox::-webkit-scrollbar-thumb {
        -webkit-border-radius: 4px;
        border-radius: 4px;
        background: var(--scrollbar-thumb-color);
      }
      paper-item {
        cursor: pointer;
      }
      paper-item:hover::before,
      paper-listbox[multi] paper-item.iron-selected:focus::before,
      .iron-selected:before {
        position: var(--layout-fit_-_position);
        top: var(--layout-fit_-_top);
        right: var(--layout-fit_-_right);
        bottom: var(--layout-fit_-_bottom);
        left: var(--layout-fit_-_left);
        background: currentColor;
        content: '';
        opacity: var(--dark-divider-opacity);
        pointer-events: none;
        display: block;
      }
      paper-listbox[multi] paper-item:focus::before {
        display: none;
      }
      .truncate-item {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .toolbar {
        background: var(--lovelace-background, var(--primary-background-color));
        min-height: 30px;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
      }
      .toolbar ha-icon-button {
        color: var(--primary-color);
        flex-direction: column;
        width: 44px;
        height: 44px;
        --mdc-icon-button-size: 44px;
        margin: 5px 0;
      }
      .toolbar ha-icon-button:first-child {
        margin-left: 5px;
      }
      .toolbar ha-icon-button:last-child {
        margin-right: 5px;
      }
      .toolbar paper-button {
        color: var(--primary-color);
        flex-direction: column;
        margin-right: 10px;
        padding: 15px 10px;
        cursor: pointer;
      }
      .toolbar ha-icon-button:active,
      .toolbar paper-button:active {
        opacity: 0.4;
        background: rgba(0, 0, 0, 0.1);
      }
      .toolbar paper-button {
        color: var(--primary-color);
        flex-direction: row;
      }
      .toolbar ha-icon {
        color: var(--primary-color);
        padding-right: 15px;
      }
      .fill-gap {
        flex-grow: 1;
      }
    `;
  }
}
