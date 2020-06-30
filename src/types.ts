import { LovelaceCardConfig } from 'custom-card-helpers';

export interface SelectListCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  entity: string;
  truncate?: boolean;
  scroll_to_selected?: boolean;
  max_options?: number;
  test_gui?: boolean;
}
