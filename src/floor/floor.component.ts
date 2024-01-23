import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  signal,
} from '@angular/core';
import { TableCdkComponent } from './components/table-cdk/table-cdk.component';

@Component({
  selector: 'app-floor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableCdkComponent],
  template: `
    <div
      #floor
      class="floor"
    >
      <app-table-cdk [table]="table1" [floorElement]="floorElement()" />
    </div>
  `,
  styleUrls: ['floor.component.css'],
})
export class FloorComponent {
  public avoidCollisionAppFloor() {}

  @ViewChild('floor') public floor!: ElementRef;

  table1 = {
    id: 1,
    nome: 'Table 1',
    pos_x: 13,
    pos_y: 22,
    width: 60,
    height: 60,
    degree: 0,
  };

  floorElement = signal<any | null>(null);

  constructor() {}

  ngAfterViewInit() {
    this.floorElement.update((v) => this.floor.nativeElement);
  }
}
