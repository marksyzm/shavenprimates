import { Component, Event, EventEmitter, State } from '@stencil/core';

@Component({
  tag: 'sp-ble-peripheral',
  styleUrl: 'sp-ble-peripheral.scss',
  shadow: false
})
export class SpBle {
  @Event() blePeripheralSelected: EventEmitter;
  @State() server: any;

  constructor() {
    this.onClickAddPeripheral = this.onClickAddPeripheral.bind(this);
  }

  async onClickAddPeripheral() {
    if (!navigator['bluetooth']) {
      throw 'Bluetooth API is not available!';
    }
    const device = await navigator['bluetooth'].requestDevice({ acceptAllDevices: true })
    const server = await device.gatt.connect();
    console.log(server);
    this.server = server;
  }

  getGattServiceList () {
    return (
      <section>
        <p>Now select a service type:</p>
        <input type="text" list="bleServices" placeholder="Bluetooth Services (e.g. generic_access, 0x1234)" />
        <datalist id="bleServices">
          <option value="alert_notification">alert_notification</option>
          <option value="automation_io">automation_io</option>
          <option value="battery_service">battery_service</option>
          <option value="blood_pressure">blood_pressure</option>
          <option value="body_composition">body_composition</option>
          <option value="bond_management">bond_management</option>
          <option value="continuous_glucose_monitoring">continuous_glucose_monitoring</option>
          <option value="current_time">current_time</option>
          <option value="cycling_power">cycling_power</option>
          <option value="cycling_speed_and_cadence">cycling_speed_and_cadence</option>
          <option value="device_information">device_information</option>
          <option value="environmental_sensing">environmental_sensing</option>
          <option value="generic_access">generic_access</option>
          <option value="generic_attribute">generic_attribute</option>
          <option value="glucose">glucose</option>
          <option value="health_thermometer">health_thermometer</option>
          <option value="heart_rate">heart_rate</option>
          <option value="human_interface_device">human_interface_device (blacklisted)</option>
          <option value="immediate_alert">immediate_alert</option>
          <option value="indoor_positioning">indoor_positioning</option>
          <option value="internet_protocol_support">internet_protocol_support</option>
          <option value="link_loss">link_loss</option>
          <option value="location_and_navigation">location_and_navigation</option>
          <option value="next_dst_change">next_dst_change</option>
          <option value="phone_alert_status">phone_alert_status</option>
          <option value="pulse_oximeter">pulse_oximeter</option>
          <option value="reference_time_update">reference_time_update</option>
          <option value="running_speed_and_cadence">running_speed_and_cadence</option>
          <option value="scan_parameters">scan_parameters</option>
          <option value="tx_power">tx_power</option>
          <option value="user_data">user_data</option>
          <option value="weight_scale">weight_scale</option>
        </datalist>
      </section>
    );
  } 
  
  render() {
    return (
      <article>
        <button onClick={this.onClickAddPeripheral}>Add Peripheral</button>
        { this.server && this.getGattServiceList()}
      </article>
    );
  }
}
