import { Component, Event, EventEmitter, State, Prop } from '@stencil/core';
import 'socket.io-client';

interface Characteristic {
  item: any;
  isConnecting?: boolean;
  isNotifying?: boolean;
}

@Component({
  tag: 'sp-ble-peripheral',
  shadow: false
})
export class SpBle {
  @Event() blePeripheralSelected: EventEmitter;
  @Prop() socket: SocketIOClient.Socket;
  @State() server: any;
  @State() optionalServices = [];
  @State() characteristics = [] as Characteristic[];
  @State() services = [];
  @State() peripherals = [];
  @State() connectedPeripherals = [];
  @State() showPeripherals = false;

  constructor() {
    this.onClickAddPeripheral = this.onClickAddPeripheral.bind(this);
    this.onInputSetService = this.onInputSetService.bind(this);
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
  }

  scan() {
    fetch('http://localhost:3000/peripherals', { method: 'POST' });
  }

  componentDidUnload() {
    this.socket.off('peripherals');
  }

  onInputSetService(ev) {
    this.optionalServices = ev.target.value
      .split(/, ?/).map(s => s.startsWith('0x') ? parseInt(s) : s)
      .filter(s => s && window['BluetoothUUID'].getService);
    console.log(this.optionalServices);
  }

  onClickAddPeripheral() {
    this.showPeripherals = true;
    this.scan();
  }

  listPeripherals() {
    return (
      <section>
        <button onClick={() => this.scan()}>Rescan</button>
        <div class="list-group">
          {this.peripherals && this.peripherals.map(peripheral => {
            const classList = ['list-group-item d-flex justify-content-between list-group-item-action'];
            return (
              <button
                onClick={() => this.connectToPeripheral(peripheral)}
                class={classList.join(' ')}>
                {peripheral.advertisement && peripheral.advertisement.localName ? peripheral.advertisement.localName : peripheral.id}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  connectToPeripheral(peripheral) {
    console.log(peripheral);
  }  

  render() {
    return (
      <article>
        {this.showPeripherals ? 
          this.listPeripherals() : 
          <button onClick={this.onClickAddPeripheral}>Add Peripheral</button>
        }
      </article>
    );
  }
}
