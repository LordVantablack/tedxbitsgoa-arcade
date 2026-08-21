import * as constant from './constant'

const drawLawn = (ctx, width, height, top, opacity) => {
  if (top >= height || opacity <= 0) return
  const pixel = Math.max(3, Math.round(width * 0.012))
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = '#35533a'
  ctx.fillRect(0, top, width, height - top)
  ctx.fillStyle = '#6f984f'
  for (let x = 0; x < width; x += pixel * 3) {
    const rowOffset = (Math.floor(x / pixel) % 3) * pixel
    ctx.fillRect(x, top + rowOffset, pixel * 2, pixel)
    ctx.fillRect(x + pixel, top + (pixel * 4) + rowOffset, pixel, pixel)
  }
  ctx.fillStyle = '#9fbb63'
  for (let x = pixel; x < width; x += pixel * 5) ctx.fillRect(x, top + (pixel * 2), pixel, pixel)
  ctx.restore()
}

export const background = (engine) => {
  const { ctx, width, height } = engine
  const bg = engine.getImg('background')
  const scale = Math.max(width / bg.width, height / bg.height)
  const zoomedWidth = bg.width * scale
  const zoomedHeight = bg.height * scale
  const offsetHeight = (height - zoomedHeight) / 2
  engine.setVariable(constant.lineInitialOffset, height * 0.84)
  ctx.fillStyle = '#86a6ed'
  ctx.fillRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(bg, (width - zoomedWidth) / 2, offsetHeight, zoomedWidth, zoomedHeight)
  const lawnOffset = engine.getVariable(constant.lawnOffset, 0)
  const lawnTravel = engine.getVariable(constant.blockHeight)
  engine.getTimeMovement(
    constant.moveDownMovement,
    [[lawnOffset, lawnOffset + lawnTravel]],
    value => engine.setVariable(constant.lawnOffset, value),
    { name: 'lawn' }
  )
  const lawnOpacity = Math.max(0, 1 - (lawnOffset / (lawnTravel * 3)))
  drawLawn(ctx, width, height, (height * 0.84) + lawnOffset, lawnOpacity)
  const dust = engine.getVariable(constant.landingDust)
  const age = dust ? engine.utils.getCurrentTime() - dust.start : Infinity
  if (age >= 0 && age < 440) {
    const progress = age / 440
    ctx.save()
    ctx.globalAlpha = 1 - progress
    ctx.fillStyle = '#fff0d5'
    for (let i = 0; i < 7; i += 1) {
      const direction = i - 3
      const size = Math.max(3, width * (0.011 + ((i % 3) * 0.004)))
      ctx.fillRect(dust.x + (direction * size * 2.3), dust.y - (progress * height * (0.025 + ((i % 2) * 0.018))), size, size)
    }
    ctx.restore()
  }
}
