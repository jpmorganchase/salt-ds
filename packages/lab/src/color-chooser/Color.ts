import tinycolor from "tinycolor2";

export type RGBAValue = {
  r: number;
  b: number;
  g: number;
  a: number;
};

export class Color {
  private color: tinycolor.Instance = tinycolor();

  public get hex(): string {
    return this.color.getAlpha() === 1
      ? this.color.toHexString()
      : this.color.toHex8String();
  }

  public get rgba(): RGBAValue {
    return {
      r: this.color.toRgb().r,
      g: this.color.toRgb().g,
      b: this.color.toRgb().b,
      a: this.color.toRgb().a,
    };
  }

  static makeColorFromHex(hexValue: string | undefined): Color | undefined {
    const colorObj = new Color();
    colorObj.color = tinycolor(hexValue);

    if (colorObj.color.isValid()) {
      return colorObj;
    } else {
      return undefined;
    }
  }

  static makeColorFromRGB(r: number, g: number, b: number, a?: number): Color {
    const colorObj = new Color();
    colorObj.color = tinycolor({ r: r, g: g, b: b, a: a });
    return colorObj;
  }

  setAlpha(alpha: number): Color {
    const colorObj = new Color();
    colorObj.color = this.color.setAlpha(alpha);
    return colorObj;
  }
}
