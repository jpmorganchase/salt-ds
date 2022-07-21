export type ScrollPositionSource = "ui" | "model";

export class GridScrollPosition {
  public readonly scrollLeft: number;
  public readonly scrollTop: number;
  public readonly source: ScrollPositionSource;

  constructor(
    scrollLeft: number,
    scrollTop: number,
    source: ScrollPositionSource
  ) {
    this.scrollLeft = scrollLeft;
    this.scrollTop = scrollTop;
    this.source = source;
  }

  public setScrollLeft(scrollLeft: number) {
    return new GridScrollPosition(scrollLeft, this.scrollTop, this.source);
  }

  public setScrollTop(scrollTop: number) {
    return new GridScrollPosition(this.scrollLeft, scrollTop, this.source);
  }

  public setSource(source: ScrollPositionSource) {
    return new GridScrollPosition(this.scrollLeft, this.scrollTop, source);
  }

  public static equals(
    a: GridScrollPosition | undefined,
    b: GridScrollPosition | undefined
  ) {
    if (!a) {
      return !b;
    }
    return (
      b &&
      a.scrollLeft === b.scrollLeft &&
      a.scrollTop === b.scrollTop &&
      a.source === b.source
    );
  }

  public toString() {
    return `[${this.scrollLeft}, ${this.scrollTop}] (${this.source})`;
  }
}
