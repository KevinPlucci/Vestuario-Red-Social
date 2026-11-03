import { AfterViewInit, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';

/**
 * En un <textarea>: crece con el texto en vez de mostrar una barra de desplazamiento, y vuelve a su
 * tamaño cuando el formulario lo vacía (por ejemplo, después de publicar).
 */
@Directive({ selector: 'textarea[appAutoAltura]', host: { '(input)': 'ajustar()' } })
export class AutoAlturaDirective implements AfterViewInit {
  private readonly area: HTMLTextAreaElement = inject(ElementRef).nativeElement;
  private readonly control = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    this.ajustar();
    // Los cambios hechos desde el código (reset, setValue) no disparan el evento input.
    this.control?.valueChanges
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => requestAnimationFrame(() => this.ajustar()));
  }

  protected ajustar(): void {
    this.area.style.height = 'auto';
    this.area.style.height = `${this.area.scrollHeight + 2}px`;
  }
}
