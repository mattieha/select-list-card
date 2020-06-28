import { LovelaceCardConfig } from 'custom-card-helpers';

export interface SelectListCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  entity: string;
  truncate?: boolean;
  scrollInToView?: boolean;
  maxHeight: string;
  test_gui?: boolean;
}
