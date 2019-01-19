import { Component, State } from '@stencil/core';

@Component({
  tag: 'sp-not-midi-ble',
  styleUrl: 'sp-not-midi-ble.scss',
  shadow: false
})
export class SpNotMidiBle {
  @State() midiOutput: any;

  constructor() {
    this.onMidiOutputSelected = this.onMidiOutputSelected.bind(this);
    
  }

  onMidiOutputSelected({ detail: midiOutput }) {
    this.midiOutput = midiOutput;
  }

  onBlePeripheralSelected(/* { detail: blePeripheral } */) {
    
  }

  render() {
    return <div>
      <sp-midi onMidiOutputSelected={this.onMidiOutputSelected}></sp-midi>
      {
        this.midiOutput && 
        <div>
          <p>{this.midiOutput.name} selected</p>
          <sp-ble-peripheral onBlePeripheralSelected={this.onBlePeripheralSelected}></sp-ble-peripheral>
        </div>
      }
    </div>;
  }
}
