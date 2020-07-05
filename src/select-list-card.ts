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
export class SelectListCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('select-list-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(hass, entities): object {
    const entity = entities.find(item => item.startsWith('input_select'));
    const dummy = hass;
    return {
      entity: entity || '',
      title: '',
      truncate: true,
      scroll_to_selected: true,
      max_options: 5,
    };
  }

  @property() public hass!: HomeAssistant;
  @property() private config!: SelectListCardConfig;
  private options: string[] = [];

  public setConfig(config: SelectListCardConfig): void {
    if (!config || !config.entity || !config.entity.startsWith('input_select')) {
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

  public async getCardSize(): Promise<number> {
    if (!this.config) {
      return 0;
    }
    // +1 for the header
    return (this.config.title ? 1 : 0) + (this.config.max_options ? this.config.max_options : this.options.length);
    /*if (this._headerElement) {
      const headerSize = computeCardSize(this._headerElement);
      size += headerSize instanceof Promise ? await headerSize : headerSize;
    }*/
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
    // this.offsetWidth < this.scrollWidth
    this.options = this.hass.states[this.config.entity].attributes.options;
    const style = this.config.max_options === 0 ? '' : `max-height: ${(this.config.max_options || 5) * 48 + 16}px`;
    return html`
      <ha-card aria-label=${`Select list card: ${this.config.entity}`}>
        ${this.config.title && this.config.title.length
          ? html`
              <div class="card-header">
                <div class="name">
                  ${this.config.title}
                </div>
              </div>
            `
          : ''}
        <paper-listbox
          @iron-select=${this._selectedOptionChanged}
          .selected=${this.options.indexOf(selected)}
          style="${style}"
        >
          ${this.options.map(option => {
            if (this.config.truncate) {
              return html`
                <paper-item title="${option}">
                  <div class="wrap">
                    <div
                      class="marquee-inner"
                      @mouseover=${this._marqueeMouseOver}
                      @mouseleave=${this._marqueeMouseLeave}
                    >
                      <span>${option}</span>
                      <span class="extra-text">${option}</span>
                    </div>
                  </div>
                </paper-item>
              `;
            }
            return html`
              <paper-item>${option}</paper-item>
            `;
          })}
        </paper-listbox>
      </ha-card>
    `;
  }
  private _marqueeMouseOver(e): void {
    const elements = this.getMarquee(e.path);
    if (!elements.marquee || !elements.span) {
      return;
    }
    if (elements.span.offsetWidth > elements.marquee.offsetWidth && !elements.marquee.classList.contains('hovering')) {
      // const newDelay = defaultDelay*(width/defaultWidth);
      const newDelay = 10 * (elements.span.offsetWidth / elements.marquee.offsetWidth);
      elements.marquee.style.animationDuration = newDelay;
      console.log('newDelay: ', newDelay);
      elements.marquee.classList.add('hovering');
      // console.log('SHOULD ANIMATE', marquee, span);
    }
  }

  private _marqueeMouseLeave(e): void {
    // console.log(e);
    const elements = this.getMarquee(e.path);
    if (!elements.marquee || !elements.span) {
      return;
    }
    elements.marquee.classList.remove('hovering');
  }

  private getMarquee(path): any {
    const marquee = path.find(item => item.classList.contains('marquee-inner'));
    return {
      marquee,
      span: typeof marquee !== 'undefined' ? marquee.children[0] : undefined,
    };
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
    await SelectListCard.setInputSelectOption(this.hass, this.config.entity, option);
  }

  private static setInputSelectOption(hass: HomeAssistant, entity: string, option: string): Promise<any> {
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
      paper-item {
        cursor: pointer;
      }
      paper-item:hover::before,
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
      .wrap {
        position: relative;
        width: 100%;
        height: 48px;
        line-height: 48px;
        margin-left: 16px;
        margin-right: 16px;
        overflow: hidden;
      }
      .marquee-inner {
        position: absolute;
        left: 0;
        right: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .marquee-inner.hovering {
        text-overflow: initial;
        overflow: initial;
        left: initial;
        right: initial;
        animation: marquee 10s linear infinite;
      }
      .marquee-inner .extra-text {
        visibility: hidden;
      }
      .marquee-inner.hovering .extra-text {
        visibility: visible;
        padding-left: 16px;
      }
      @keyframes marquee {
        0% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(-100%);
        }
      }
    `;
  }
}
