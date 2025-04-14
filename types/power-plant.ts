export interface PowerPlant {
  id: number;
  modified_at: string;
  status?: string; // 발전소 운영 상태 (정상, 점검중, 고장, 가동중, 멈춤 등)
  infra: {
    id: number;
    carrier_fk: number;
    name: string;
    type: string;
    address: string;
    latitude: number;
    longitude: number;
    altitude: number | null;
    capacity: number;
    install_date: string | null;
    kpx_identifier: {
      id: number;
      kpx_cbp_gen_id: string;
    };
    inverter: Array<{
      id: number;
      capacity: number;
      tilt: number;
      azimuth: number;
      install_type: string | null;
      module_type: string | null;
    }>;
    ess: Array<unknown>;
  };
  monitoring: {
    id: number;
    company: number;
    rtu_id: string;
    resource: number;
  };
  control: Array<{
    id: number;
    company: number;
    control_type: number;
    controllable_capacity: number;
    rtu_id: string;
    onoff_inverter_capacity: Record<string, unknown>;
    priority: number;
    resource: number;
  }>;
  contract: {
    id: number;
    modified_at: string;
    resource: number;
    contract_type: string;
    contract_date: string;
    weight: number;
    fixed_contract_type: string | null;
    fixed_contract_price: number | null;
    fixed_contract_agreement_date: string | null;
  };
  substation: number;
  dl: number;
  fixed_contract_price: number | null;
  guaranteed_capacity: number;
}
