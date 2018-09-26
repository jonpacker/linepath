const bezier = require('bezier')
const {parseSVG, makeAbsolute} = require('svg-path-parser')

module.exports = (d, complexity = 10) => {
  const segments = parseSVG(d)
  makeAbsolute(segments)
  const output = []
  for (let segment of segments) {
    switch (segment.command) {
      case 'moveto':
      case 'lineto':
        output.push(segment)
        break

      case 'vertical lineto':
      case 'horizontal lineto':
        output.push({...segment, command: 'lineto', code: 'L'})
        break

      case 'curveto': {
        let x = [segment.x0, segment.x1, segment.x2, segment.x]
        let y = [segment.y0, segment.y1, segment.y2, segment.y]
        output.push.apply(output, bezierSegments(x, y, segment.x0, segment.y0, complexity))
        break
      }
      
      default: break
    }
  }
  return output
}

const bezierSegments = (x, y, x0, y0, complexity) => [...Array(complexity)].map((_, i) => {
  return bezierSegment(x, y, x0, y0, i * 1/complexity, 1/complexity)
})

const bezierSegment = (x, y, x0, y0, step, stepSize) => ({
  code: 'L',
  command: 'lineto',
  x0: !step ? x0 : bezier(x, step - stepSize),
  y0: !step ? y0 : bezier(y, step - stepSize),
  x: bezier(x, step),
  y: bezier(y, step)
})
