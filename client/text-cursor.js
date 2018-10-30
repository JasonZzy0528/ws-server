
const transformCursor = (cursor, op, isLocalChange) => {
  if (!op) {
    return cursor
  }
  var pos = op.offset
  var remove = op.toRemove
  var insert = op.toInsert.length
  if (typeof cursor === 'undefined') { return }
  if (isLocalChange) {
    if (typeof remove === 'number') {
      cursor -= remove
    }
    if (typeof insert === 'number') {
      cursor += insert
    }
  } else {
    if (typeof remove === 'number' && pos < cursor) {
      cursor -= Math.min(remove, cursor - pos)
    }
    if (typeof insert === 'number' && pos < cursor) {
      cursor += insert
    }
  }
  return cursor
}

export const transform = (cursor, ops, isLocalChange) => {
  if (Array.isArray(ops)) {
    for (let i = ops.length - 1; i >= 0; i--) {
      cursor = transformCursor(cursor, ops[i], isLocalChange)
    }
    return cursor
  }
  return transformCursor(ops)
}
