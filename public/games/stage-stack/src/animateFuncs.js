import { Instance } from 'cooljs'
import { blockAction, blockPainter } from './block'
import {
  checkMoveDown,
  getMoveDownValue,
  drawYellowString,
  getAngleBase
} from './utils'
import { addFlight } from './flight'
import * as constant from './constant'

const drawPixelHeart = (ctx, x, y, size, inactive) => {
  const pixel = Math.max(2, Math.floor(size / 11))
  const shape = [
    [1, 0], [2, 0], [4, 0], [5, 0],
    [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
    [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
    [1, 3], [2, 3], [3, 3], [4, 3],
    [2, 4], [3, 4], [2, 5]
  ]
  const hasPixel = (column, row) => shape.some(([xPos, yPos]) => xPos === column && yPos === row)
  ctx.save()
  ctx.globalAlpha = inactive ? 0.28 : 1
  ctx.fillStyle = '#1d253b'
  shape.forEach(([column, row]) => {
    for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
      for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
        if (!hasPixel(column + xOffset, row + yOffset)) ctx.fillRect(x + ((column + xOffset) * pixel), y + ((row + yOffset) * pixel), pixel, pixel)
      }
    }
  })
  ctx.fillStyle = '#e62b1e'
  shape.forEach(([column, row]) => {
    ctx.fillRect(x + (column * pixel), y + (row * pixel), pixel, pixel)
  })
  ctx.fillStyle = '#ff7868'
  ctx.fillRect(x + pixel, y + pixel, pixel, pixel)
  ctx.fillRect(x + (pixel * 2), y + pixel, pixel, pixel)
  ctx.restore()
}

export const endAnimate = (engine) => {
  const gameStartNow = engine.getVariable(constant.gameStartNow)
  if (!gameStartNow) return
  const successCount = engine.getVariable(constant.successCount, 0)
  const failedCount = engine.getVariable(constant.failedCount)
  const gameScore = engine.getVariable(constant.gameScore, 0)
  const threeFiguresOffset = Number(successCount) > 99 ? engine.width * 0.1 : 0

  drawYellowString(engine, {
    string: 'FLOOR',
    size: engine.width * 0.05,
    x: (engine.width * 0.2) + threeFiguresOffset,
    y: engine.width * 0.1,
    textAlign: 'left',
    fontName: 'RasterForge',
    fontWeight: 'bold'
  })
  drawYellowString(engine, {
    string: successCount,
    size: engine.width * 0.13,
    x: (engine.width * 0.19) + threeFiguresOffset,
    y: engine.width * 0.16,
    textAlign: 'right'
  })
  drawYellowString(engine, { string: 'SCORE', size: engine.width * 0.042, x: engine.width * 0.9, y: engine.width * 0.18, textAlign: 'right', fontName: 'RasterForge', fontWeight: 'bold' })
  drawYellowString(engine, {
    string: gameScore,
    size: engine.width * 0.052,
    x: engine.width * 0.9,
    y: engine.width * 0.235,
    textAlign: 'right'
  })
  const { ctx } = engine
  const zoomedHeartWidth = engine.width * 0.085
  drawPixelHeart(ctx, engine.width * 0.82, engine.width * 0.27, zoomedHeartWidth, failedCount >= 1)
}

export const startAnimate = (engine) => {
  const gameStartNow = engine.getVariable(constant.gameStartNow)
  if (!gameStartNow) return
  const lastBlock = engine.getInstance(`block_${engine.getVariable(constant.blockCount)}`)
  if (!lastBlock || [constant.land, constant.out].indexOf(lastBlock.status) > -1) {
    if (checkMoveDown(engine) && getMoveDownValue(engine)) return
    if (engine.checkTimeMovement(constant.hookUpMovement)) return
    const angleBase = getAngleBase(engine)
    const initialAngle = (Math.PI
        * engine.utils.random(angleBase, angleBase + 5)
        * engine.utils.randomPositiveNegative()
    ) / 180
    engine.setVariable(constant.blockCount, engine.getVariable(constant.blockCount) + 1)
    engine.setVariable(constant.initialAngle, initialAngle)
    engine.setTimeMovement(constant.hookDownMovement, 500)
    const block = new Instance({
      name: `block_${engine.getVariable(constant.blockCount)}`,
      action: blockAction,
      painter: blockPainter
    })
    engine.addInstance(block)
  }
  const successCount = Number(engine.getVariable(constant.successCount, 0))
  switch (successCount) {
    case 2:
      addFlight(engine, 1, 'leftToRight')
      break
    case 6:
      addFlight(engine, 2, 'rightToLeft')
      break
    case 8:
      addFlight(engine, 3, 'leftToRight')
      break
    case 14:
      addFlight(engine, 4, 'bottomToTop')
      break
    case 18:
      addFlight(engine, 5, 'bottomToTop')
      break
    case 22:
      addFlight(engine, 6, 'bottomToTop')
      break
    case 25:
      addFlight(engine, 7, 'rightTopToLeft')
      break
    default:
      break
  }
}
