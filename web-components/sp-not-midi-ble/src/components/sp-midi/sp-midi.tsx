import { Component, State, Event, EventEmitter } from '@stencil/core';
import WebMidi from 'webmidi';

@Component({
  tag: 'sp-midi',
  styleUrl: 'sp-midi.scss',
  shadow: false
})
export class SpMidi {
  @State() midiReady = false;
  @State() midiOutputs = [];
  @Event() midiOutputSelected: EventEmitter;

  constructor() {
    this.onSelectMidiOutput = this.onSelectMidiOutput.bind(this);
  }

  componentWillLoad() {
    this.enableWebMidi();
  }

  componentWillUpdate() {
    this.enableWebMidi();
  }

  enableWebMidi() {
    WebMidi.enable((err) => {
      if (err) {
        this.midiReady = false;
        console.error('WebMidi could not be enabled.', err);
        return;
      }
      this.midiReady = true;
      this.midiOutputs = WebMidi.outputs.slice();
      console.info('WebMidi enabled!');
    });
  }

  getMidiReady() {
    return !this.midiReady ? 
    <p>MIDI not enabled!</p> :
    [
      <h1>Select a MIDI Output</h1>,
      <select onChange={this.onSelectMidiOutput}>
        <option value={-1} selected>Please Select</option>
        {this.midiOutputs.map((output, i) => 
          <option value={i}>{output.name}</option>
        )}
      </select>
    ];
  }

  onSelectMidiOutput(ev) {
    const index = ev.target.value;
    if (index !== -1) {
      const midiOutput = WebMidi.outputs[ev.target.value];
      this.midiOutputSelected.emit(midiOutput);
    } else {
      this.midiOutputSelected.emit(null);
    }
  }

  render() {
    return <div>
      {this.getMidiReady()}
    </div>;
  }
}
