import { BaseSprite } from "@webav/av-cliper";

export class TimeSprite extends BaseSprite {

  render(ctx: CanvasRenderingContext2D): void {
    super.render(ctx)
    ctx.fillStyle = '#fff'
    ctx.font = '300px Noto Sans SC'
    ctx.fillText(String(~~performance.now() / 1000), -500, 100)
  }

  destroy(): void { }
}