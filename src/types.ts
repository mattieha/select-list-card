import { LovelaceCardConfig } from 'custom-card-helpers';

export interface SelectListCardConfig extends LovelaceCardConfig {
  type: string;
  title?: string;
  icon?: string;
  show_toggle?: boolean;
  entity: string;
  truncate?: boolean;
  scroll_to_selected?: boolean;
  max_options?: number;
  test_gui?: boolean;
  open: boolean;
}
