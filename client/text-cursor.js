
let transformCursor = (cursor, op) => {
  if (!op) {
    return cursor
  }
  var pos = op.offset
  var remove = op.toRemove
  var insert = op.toInsert.length
  if (typeof cursor === 'undefined') { return }
  if (typeof remove === 'number' && pos < cursor) {
    cursor -= Math.min(remove, cursor - pos)
  }
  if (typeof insert === 'number' && pos < cursor) {
    cursor += insert
  }
  return cursor
}

export const transform = (cursor, ops) => {
  if (Array.isArray(ops)) {
    for (let i = ops.length - 1; i >= 0; i--) {
      cursor = transformCursor(cursor, ops[i])
    }
    return cursor
  }
  return transformCursor(ops)
}
