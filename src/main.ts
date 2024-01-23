import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FloorComponent } from './floor/floor.component';
import 'zone.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FloorComponent],
  template: `
    <app-floor />
  `,
})
export class App {
  public avoidCollisionAppFloor() {}
}

bootstrapApplication(App);
