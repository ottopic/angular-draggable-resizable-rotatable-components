import {
  ChangeDetectionStrategy,
  Component,
  Input,
  effect,
  input,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { ResizeDirective } from './resize.directives';

@Component({
  selector: 'app-table-cdk',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, ResizeDirective, CommonModule, NgClass],
  template: `
    <div
      [id]="id"
      [style.height.px]="itemSize?.height"
      [style.width.px]="itemSize?.width"
      [style.left.px]="left"
      [style.top.px]="top"
      [style.transform]="'translate3d(' + itemSize?.left + 'px,' + itemSize?.top + 'px, 0px ) rotate(' + itemRotateDeg + 'deg)'"
      [style.background-color] = "isSelected ? 'red' : ''"
      [style.display] = "isLoaded ? 'inline' : 'none'"
      resize
      cdkDrag
      cdkDragBoundary=".floor"
      class="table-area"
      (updatedSize)="updateSize($event)"
      (updatedRotation)="updatedRotation($event)"
      (endRotation)="endRotation()"
      (endResize)="endResize()"
      (cdkDragEnded)="dragEnd($event)"
      (click)="activeToggle()"
    >
      {{ table.nome }}
    </div>
  `,
  styleUrls: ['table-cdk.component.css'],
})
export class TableCdkComponent {
  @Input() table: any;

  itemSize!: any;
  itemRotateDeg!: number;
  extraX = 32;
  extraY = 32;
  moveItemSize: DOMRect | undefined;
  isSelected = false;
  id!: number;
  borderWidth = 1;
  left = 0;
  top = 0;
  isLoaded = false;
  floorElement = input<any | null>(null);

  constructor() {
    // get parent offset for right dispositions of elements with relative elements
    effect(() => {
      if (!this.floorElement()) return;

      this.left = this.floorElement().offsetLeft + this.table.pos_x;
      this.top = this.floorElement().offsetTop + this.table.pos_y;

      this.isLoaded = true;
    });
  }

  ngOnInit() {
    this.itemSize = {
      width: this.table.width,
      height: this.table.height,
      left: 0,
      top: 0,
    };
    this.itemRotateDeg = this.table.degree;
    this.id = this.table.id;
  }

  updatedRotation(deg: number) {
    //console.log('updatedRotation', deg);
    this.itemRotateDeg = deg;
  }

  endRotation() {
    console.log('lastAngle', this.itemRotateDeg);
    // save new angle on db
  }

  endResize() {
    // save new dimensions on db
  }

  updateSize(ev: DOMRect) {
    console.log('updateSize', ev);
    this.itemSize = { ...ev };
  }

  dragEnd(ev: any) {
    console.log('ended', ev);
    this.activeToggle();

    const element = ev.source.element.nativeElement;
    const transform = element.style.transform;
    let regex =
      /translate3d\(\s?(?<x>[-]?\d*)px,\s?(?<y>[-]?\d*)px,\s?(?<z>[-]?\d*)px\)/;
    var values = regex.exec(transform);
    var posX = values ? +values[1] : 0;
    var posY = values ? +values[2] : 0;

    // save new position on db
  }

  activeToggle() {
    this.isSelected = !this.isSelected;
  }
}
