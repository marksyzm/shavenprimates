import { Component, State } from '@stencil/core';
import io from 'socket.io-client';

@Component({
  tag: 'sp-not-midi-ble',
  shadow: false
})
export class SpNotMidiBle {
  @State() midiOutput: any;
  @State() socketConnected = false;
  @State() socket: SocketIOClient.Socket;

  constructor() {
    this.onMidiOutputSelected = this.onMidiOutputSelected.bind(this);
  }

  componentDidLoad() {
    this.socket = io('http://localhost:3000');
    this.socket.on('connect', () => {
      this.socketConnected = true;
    });
    this.socket.on('disconnect', () => {
      this.socketConnected = false;
    });
  }

  onMidiOutputSelected({ detail: midiOutput }) {
    this.midiOutput = midiOutput;
  }

  onBlePeripheralSelected(/* { detail: blePeripheral } */) {
    
  }

  render() {
    return (
      <div>
        {
          this.socket && this.socketConnected ?
            <sp-ble-peripheral
              onBlePeripheralSelected={this.onBlePeripheralSelected}
              socket={this.socket}
              ></sp-ble-peripheral> : 
            <h1>Socket not connected...</h1>
        }
      </div>
    );
  }
}
