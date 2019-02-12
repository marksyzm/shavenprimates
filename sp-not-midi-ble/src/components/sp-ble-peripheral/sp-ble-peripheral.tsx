import { Component, Event, EventEmitter, State, Prop } from '@stencil/core';
import { getServicePropFromHexString, getCharacteristicPropFromHexString, formatHexShortCode } from '../../utils/ble';

/* interface Characteristic {
  item: any;
  isConnecting?: boolean;
  isNotifying?: boolean;
} */

const API_HOST = 'http://localhost:3000/';
const ID_LENGTH = 4;

@Component({
  tag: 'sp-ble-peripheral',
  shadow: false
})
export class SpBle {
  @Event() blePeripheralSelected: EventEmitter;
  @Prop() socket: SocketIOClient.Socket;
  @State() loadingCharacteristics = false;
  @State() characteristics = [];
  @State() peripherals = [];
  @State() connectedPeripherals = [];
  @State() showPeripherals = false;
  @State() showConnectedPeripherals = false;
  @State() currentPeripheral;
  @State() currentServiceUuid: string;
  @State() scanning = false;

  constructor() {
    this.onClickAddPeripheral = this.onClickAddPeripheral.bind(this);
  }

  static getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
      if (characteristic.properties[p] === true) {
        supportedProperties.push(p.toUpperCase());
      }
    }
    return supportedProperties;
  }

  componentDidLoad() {
    this.socket.on('peripherals', peripherals => {
      this.peripherals = peripherals;
    });

    this.socket.on('scanning', scanning => {
      this.scanning = scanning;
    });

    this.socket.on('connectedPeripherals', connectedPeripherals => {
      this.connectedPeripherals = connectedPeripherals;
    });
  }

  scan() {
    this.socket.emit('scan', true);
  }

  stopScanning() {
    this.socket.emit('scan', false);
  }

  close() {
    this.stopScanning();
    this.showPeripherals = false;
  }

  componentDidUnload() {
    this.socket.off('peripherals');
    this.socket.off('scanning');
  }

  onClickAddPeripheral() {
    this.showPeripherals = true;
    this.currentPeripheral = undefined;
    this.scan();
  }

  getActionButtons() {
    return (
      <p class="d-flex align-items-center">
        <span class="btn-group">
          <button
            onClick={this.onClickAddPeripheral}
            class="btn btn-primary btn-large"
            >Add Peripheral</button>
          {this.getConnectedPeripheralsButton()}
        </span>
      </p>
    )
  }

  getConnectedPeripheralsButton() {
    const length = this.connectedPeripherals.length;
    return (
      <button
        onClick={() => this.getConnectedPeripherals()}
        class="btn btn-info btn-large"
        disabled={!this.connectedPeripherals.length}>
        {length} Connected Peripheral{length !== 1 && 's'}
      </button>
    );
  }

  listPeripherals() {
    if (!this.showPeripherals) {
      return this.getActionButtons();
    }

    return (
      <section>
        <p class="d-flex align-items-center">
          <span class="btn-group">
            {!this.scanning &&
            <button
              class="btn btn-success btn-large"
              onClick={() => this.scan()}
              >Rescan</button>}
            {this.scanning &&
            <button
              class="btn btn-warning btn-large"
              onClick={() => this.stopScanning()}
              >Stop Scanning</button>
            }
            <button
              class="btn btn-danger btn-large"
              onClick={() => this.close()}
              >Close</button>
            {this.getConnectedPeripheralsButton()}
          </span>
          {this.scanning &&
          <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
          }
        </p>
        <h1>Peripherals</h1>
        <ul class="list-group">
          {this.peripherals && this.peripherals.map(peripheral => {
            const classList = ['list-group-item list-group-item-action flex-column align-items-start'];
            return (
              <li class={classList.join(' ')}>
                <h5>{this.getPeripheralName(peripheral)}</h5>
                {this.showPeripheralServices(peripheral)}
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  getPeripheralName(peripheral): string {
    return peripheral.advertisement && peripheral.advertisement.localName ? peripheral.advertisement.localName : peripheral.id.slice(0, ID_LENGTH);
  }

  showPeripheralServices(peripheral) {
    const { advertisement } = peripheral;
    return (
      <section>
        {advertisement && advertisement.serviceUuids &&
          advertisement.serviceUuids.map(serviceUuid => {
              const formattedServiceUuid = formatHexShortCode(serviceUuid);
              return (
                <button
                  class={`btn mr-2 ${this.currentServiceUuid === serviceUuid ? 'btn-success':  'btn-secondary'}`}
                  onClick={() => this.getCharacteristics(peripheral, serviceUuid)}
                  title={getServicePropFromHexString(formattedServiceUuid, 'id')}>
                  {getServicePropFromHexString(formattedServiceUuid, 'name')}
                </button>
              );
          })
        }
      </section>
    );
  }

  async getCharacteristics(peripheral, serviceUuid) {
    this.showPeripherals = false;
    this.currentPeripheral = peripheral;
    this.currentServiceUuid = serviceUuid;
    this.loadingCharacteristics = true;
    this.characteristics = [];
    try {
      const response = await fetch(
        `${API_HOST}peripherals/${peripheral.id}/services/${serviceUuid}`, { method: 'POST' }
      ).then(() => fetch(
        `${API_HOST}peripherals/${peripheral.id}/services/${serviceUuid}/characteristics`
      ));
      this.characteristics = await response.json();
      this.loadingCharacteristics = false;
      console.log(this.characteristics);
    } catch (e) {
      this.loadingCharacteristics = false;
      console.error(e);
    }
  }

  showPeripheralCharacteristics() {
    if (!this.currentPeripheral) {
      return;
    }

    const { characteristics, currentPeripheral: peripheral } = this;
    return (
      <section>
        <h1>
          <span class="mr-2">{this.getPeripheralName(peripheral)}</span>
          <small>characteristics</small>
        </h1>
        <section>
          <h2>Services</h2>
          {this.showPeripheralServices(peripheral)}
        </section>
        <section>
          <h2>Characteristics</h2>
          {
            this.loadingCharacteristics ?
              <div class="d-flex align-items-center">
                <strong>Loading Characteristics...</strong>
                <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
              </div> :
              this.getCharacteristicButtons(characteristics)
          }
        </section>
      </section>
    )
  }

  getConnectedPeripherals() {
    this.showConnectedPeripherals = true;
  }

  getCharacteristicButtons(characteristics) {
    if (!characteristics || !characteristics.length) {
      return <p>No Characteristics Found!</p>;
    }
    return characteristics.map(characteristic => {
      const formattedCharacteristicUuid = formatHexShortCode(characteristic.uuid);
      return (
        <button
          class="btn btn-info mr-2"
          title={getCharacteristicPropFromHexString(formattedCharacteristicUuid, 'id')}>
          {getCharacteristicPropFromHexString(formattedCharacteristicUuid, 'name')}
          {characteristic.properties.map(property =>
            <span class="badge badge-light ml-2">{property}</span>
          )}
        </button>
      );
    })
  }

  listConnectedPeripherals() {
    if (!this.showConnectedPeripherals) {
      return;
    }

    return (
      <ul class="list-group">
        {this.connectedPeripherals && this.connectedPeripherals.map(connectedPeripheral => {
          const classList = ['list-group-item list-group-item-action flex-column align-items-start'];
          return (
            <li class={classList.join(' ')}>
              <h5>{this.getPeripheralName(connectedPeripheral.peripheral)}</h5>
              {this.showPeripheralServices(connectedPeripheral.peripheral)}
            </li>
          );
        })}
      </ul>
    );
  }

  closeConnectedPeripherals() {
    this.showConnectedPeripherals = false;
  }

  render() {
    return (
      <article>
        {this.listPeripherals()}
        {this.showPeripheralCharacteristics()}
        {this.listConnectedPeripherals()}
      </article>
    );
  }
}
