import { LitElement, html, customElement, property, CSSResult, TemplateResult, css, PropertyValues } from 'lit-element';
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
export class SelectListCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('select-list-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(hass, entities): object {
    const entity = entities.find(item => item.startsWith('input_select'));
    const dummy = hass;
    return {
      entity: entity || '',
      name: '',
      truncate: true,
      scroll_to_selected: false,
      max_options: 3,
    };
  }

  @property() public hass!: HomeAssistant;
  @property() private config!: SelectListCardConfig;

  public setConfig(config: SelectListCardConfig): void {
    if (!config || !config.entity || !config.entity.startsWith('input_select') || config.show_error) {
      throw new Error(localize('error.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      title: '',
      truncate: true,
      scroll_to_selected: true,
      max_options: 5,
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this.config.entity) {
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
    const selected = this.hass.states[this.config.entity].state;
    const options = this.hass.states[this.config.entity].attributes.options;
    const style = this.config.max_options === 0 ? '' : `max-height: ${(this.config.max_options || 5) * 48 + 16}px`;
    return html`
      <ha-card .header=${this.config.title} aria-label=${`Select list card: ${this.config.entity}`}>
        <paper-listbox
          @iron-select=${this._selectedOptionChanged}
          .selected=${options.indexOf(selected)}
          style="${style}"
        >
          ${options.map(option => {
            const item = this.config.truncate
              ? html`
                  <div class="truncate-item">${option}</div>
                `
              : option;
            return html`
              <paper-item>${item}</paper-item>
            `;
          })}
        </paper-listbox>
      </ha-card>
    `;
  }

  private showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card') as LovelaceCard;
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }
  private async _selectedOptionChanged(ev: any): Promise<any> {
    const option = ev.detail.item.innerText.trim();
    const selected = this.hass.states[this.config.entity].state;
    if (this.config.scroll_to_selected) {
      ev.path[0].scrollTop = ev.detail.item.offsetTop - (ev.path[0].offsetTop + 8);
    }
    if (option === selected) {
      return;
    }
    await this.setInputSelectOption(this.hass, this.config.entity, option);
  }

  private setInputSelectOption(hass: HomeAssistant, entity: string, option: string): Promise<any> {
    return hass.callService('input_select', 'select_option', {
      option,
      entity_id: entity,
    });
  }

  static get styles(): CSSResult {
    return css`
      select-list-card:focus {
        outline: none;
      }
      paper-listbox {
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-color: var(--scrollbar-thumb-color) transparent;
        scrollbar-width: thin;
        background: var(--paper-card-background-color);
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
      }
      .truncate-item {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    `;
  }
}
