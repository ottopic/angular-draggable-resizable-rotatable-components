import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  AfterViewInit,
  HostListener,
  Output,
  EventEmitter,
  Inject,
} from '@angular/core';

const enum Cursor {
  SIDE = 'ew-resize',
  UPDOWN = 'ns-resize',
  UPLEFT = 'nwse-resize',
  DOWNRIGHT = 'nwse-resize',
  UPRIGHT = 'nesw-resize',
  DONWLEFT = 'nesw-resize',
}

const enum Move {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  ALL = 'all',
  ROTATE = 'rotate',
}

const enum Start {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  TOPLEFT = 'top-left',
  TOPRIGHT = 'top-right',
  BOTTOMLEFT = 'bottom-left',
  BOTTOMRIGHT = 'bottom-right',
}

@Directive({
  selector: '[resize]',
  standalone: true,
})
export class ResizeDirective implements AfterViewInit {
  previousSize: {
    left: number;
    top: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
  } = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
  resizers: ElementRef<HTMLDivElement>[] = [];
  rotator: ElementRef<HTMLDivElement>[] = [];
  isResizing: boolean = false;
  isRotating: boolean = false;
  move!: Move;
  start!: Start;
  mouseX!: number;
  mouseY!: number;
  startWidth!: number;
  startHeight!: number;
  startAngle!: number;
  prevDistance: number = 0;
  MIN_SIZE = 60;
  MIN_DEG = 15;
  SLOWDOWN = 0.5;
  @Output('updatedSize') resizeEnd = new EventEmitter();
  @Output('endResize') endResize = new EventEmitter<DOMRect>();
  @Output('updatedRotation') updatedRotation = new EventEmitter<number>();
  @Output('endRotation') endRotation = new EventEmitter();

  constructor(
    private ele: ElementRef,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(ev: MouseEvent) {
    console.log('mouseleave');

    if (!this.isResizing) {
      this.resizers.forEach((single) => {
        single.nativeElement.remove();
      });
      this.resizers = [];
    }

    if (!this.isRotating) {
      this.rotator.forEach((single) => {
        single.nativeElement.remove();
      });
      this.rotator = [];
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(ev: MouseEvent) {
    // emitters for final save on db (not included in this version)
    if (this.isRotating) this.endRotation.emit();
    else if (this.isResizing) this.endResize.emit();

    this.isResizing = false;
    this.isRotating = false;
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(ev: MouseEvent) {
    ev.stopPropagation();

    // creata upper right green square for rotation
    this.rotator.push(
      new ElementRef(
        this.createRotator(
          Cursor.UPRIGHT,
          'top-0 left-full',
          Move.ROTATE,
          Start.TOPRIGHT
        )
      )
    );

    // creata lower right red square for resize
    this.resizers.push(
      new ElementRef(
        this.createResizers(
          Cursor.DOWNRIGHT,
          'top-full left-full',
          Move.ALL,
          Start.BOTTOMRIGHT
        )
      )
    );

    // adding squares to element (multiple predisposition)
    this.resizers.forEach((single) => {
      this.ele.nativeElement.appendChild(single.nativeElement);
    });
    this.rotator.forEach((single) => {
      this.ele.nativeElement.appendChild(single.nativeElement);
    });
  }

  createResizers(cursor: Cursor, position: string, move: Move, start: Start) {
    let div = document.createElement('div');
    div.className = 'absolute ' + position;
    // div.style.cursor = cursor;
    div.style.cursor =
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.8 3.8l16.4 16.4M20.2 3.8L3.8 20.2M15 3h6v6M9 3H3v6M15 21h6v-6M9 21H3v-6'/%3E%3C/svg%3E\") 12 12, pointer";
    div.style.width = '15px';
    div.style.height = '15px';
    div.style.background = 'red';
    div.style.transform = 'translate(-50%,-50%)';
    div.addEventListener('mousedown', (e: MouseEvent) => {
      console.log('mousedown createResizers');
      e.stopPropagation();
      this.setResizePositions(e, move, start);
      this.startWidth = this.ele.nativeElement.offsetWidth;
      this.startHeight = this.ele.nativeElement.offsetHeight;
      this.isResizing = true;
    });
    return div;
  }

  createRotator(cursor: Cursor, position: string, move: Move, start: Start) {
    let div = document.createElement('div');
    div.className = 'absolute ' + position;
    div.style.cursor =
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2'/%3E%3C/svg%3E\") 12 12, pointer";
    div.style.width = '15px';
    div.style.height = '15px';
    div.style.background = 'green';
    div.style.transform = 'translate(-50%,-50%)';
    div.addEventListener('mousedown', (e: MouseEvent) => {
      console.log('mousedown createRotator');
      e.stopPropagation();
      this.getRotationDegrees(e);
      this.isRotating = true;
    });
    return div;
  }

  setResizePositions(e: MouseEvent, move: Move, start: Start) {
    this.move = move;
    this.start = start;
    this.isResizing = true;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  @HostListener('window:mousemove', ['$event'])
  resizeDiv(e: any) {
    e.stopPropagation();
    this.setPreviousState();

    let distX = e.clientX - this.mouseX;
    let distY = e.clientY - this.mouseY;

    if (this.isRotating) {
      // new angle with slowdown factor + minimum degree stepper
      var angle =
        this.startAngle +
        Math.atan2(distY, distX) * (180 / Math.PI) * this.SLOWDOWN;
      angle = Math.round(angle / this.MIN_DEG) * this.MIN_DEG;

      this.updatedRotation.emit(angle);
    } else if (this.isResizing) {
      if (this.move === Move.ALL) {
        var newWidth = this.startWidth + distX;
        var newHeight = this.startHeight + distY;

        // New dimensions with MIN_SIZE stepper
        newWidth = Math.round(newWidth / this.MIN_SIZE) * this.MIN_SIZE;
        newHeight = Math.round(newHeight / this.MIN_SIZE) * this.MIN_SIZE;

        // Minimum dimension MIN_SIZE
        if (newWidth < this.MIN_SIZE) newWidth = this.MIN_SIZE;
        if (newHeight < this.MIN_SIZE) newHeight = this.MIN_SIZE;

        var updatedSize = {
          height: newHeight,
          width: newWidth,
        } as DOMRect;

        this.resizeEnd.emit(updatedSize);
      }
    }
  }

  ngAfterViewInit() {
    this.setPreviousState();
  }

  setPreviousState() {
    const element = this.ele.nativeElement;
    this.previousSize.width = element.offsetWidth;
    this.previousSize.height = element.offsetHeight;
    const values = element.style.transform?.split(/\w+\(|\);?/);
    const transform = values[1]
      ?.split(/,\s?/g)
      .map((numStr: any) => parseInt(numStr));
    let result = { x: 0, y: 0, z: 0 };
    if (transform)
      result = {
        x: transform[0],
        y: transform[1],
        z: transform[2],
      };
    this.previousSize.left = result.x;
    this.previousSize.top = result.y;
    this.previousSize.right = result.x + this.previousSize.width;
    this.previousSize.bottom = result.y + this.previousSize.height;

    return result;
  }

  // Funzione per ottenere l'angolo di rotazione attuale
  getRotationDegrees(e: MouseEvent) {
    const element = this.ele.nativeElement;

    const values = element.style.transform?.split(/\w+\(|\);?/);
    const transform = values[3]
      ?.split(/,\s?/g)
      .map((numStr: any) => parseInt(numStr));

    if (transform && transform[0]) {
      this.startAngle = parseFloat(transform[0]);
    } else {
      this.startAngle = 0;
    }

    this.isRotating = true;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }
}
