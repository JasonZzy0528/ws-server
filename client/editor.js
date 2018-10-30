import Hyperjson from './bower_components/hyperjson/hyperjson'

const shouldSerialize = () => {
  return true
}

export const getEditorHyperjson = (editor) => {
  const el = editor.editable().$
  const json = Hyperjson.fromDOM(el, shouldSerialize)
  return json
}

export const listenOnChange = (editor, chainpad) => {
  editor.on('change', () => {
    console.error('change', editor.getData())
    const newContent = JSON.stringify(getEditorHyperjson(editor))
    chainpad.contentUpdate(newContent)
  })
}

export const editorInit = (el) => {
  if (el) {
    const editor = CKEDITOR.replace(el)
    return editor
  }
  throw new Error('Unexpected el ', el)
}

var slice = function (coll) {
  return Array.prototype.slice.call(coll)
}

const removeListeners = root => {
  slice(root.attributes).map(function (attr) {
    if (/^on/.test(attr.name)) {
      root.attributes.removeNamedItem(attr.name)
    }
  })
  slice(root.children).forEach(removeListeners)
}

export const hjsonToDom = function (hjson) {
  var dom = Hyperjson.toDOM(hjson)
  removeListeners(dom)
  return dom
}


const forbiddenTags = [
  'SCRIPT',
  //'IFRAME',
  'OBJECT',
  'APPLET',
  //'VIDEO',
  //'AUDIO'
]

export const mkDiffOptions = (cursor, readOnly) => {
  return {
    preDiffApply: function (info) {
      /*
      Don't accept attributes that begin with 'on'
      these are probably listeners, and we don't want to
      send scripts over the wire.
      */
      if (['addAttribute', 'modifyAttribute'].indexOf(info.diff.action) !== -1) {
        if (info.diff.name === 'href') {
          // console.log(info.diff)
          //var href = info.diff.newValue

          // TODO normalize HTML entities
          if (/javascript *: */.test(info.diff.newValue)) {
            // TODO remove javascript: links
          }
        }

        if (/^on/.test(info.diff.name)) {
          console.log('Rejecting forbidden element attribute with name (%s)', info.diff.name)
          return true
        }
      }


      // MEDIATAG
      // Never modify widget ids
      if (info.node && info.node.tagName === 'SPAN' && info.diff.name === 'data-cke-widget-id') {
        return true
      }
      if (info.node && info.node.tagName === 'SPAN' &&
      info.node.getAttribute('class') &&
      /cke_widget_wrapper/.test(info.node.getAttribute('class'))) {
        if (info.diff.action === 'modifyAttribute' && info.diff.name === 'class') {
          return true
        }
        //console.log(info)
      }
      // CkEditor drag&drop icon container
      if (info.node && info.node.tagName === 'SPAN' &&
      info.node.getAttribute('class') &&
      info.node.getAttribute('class').split(' ').indexOf('cke_widget_drag_handler_container') !== -1) {
        return true
      }
      // CkEditor drag&drop title (language fight)
      if (info.node && info.node.getAttribute &&
        info.node.getAttribute('class') &&
        (info.node.getAttribute('class').split(' ').indexOf('cke_widget_drag_handler') !== -1 ||
        info.node.getAttribute('class').split(' ').indexOf('cke_image_resizer') !== -1 )
      ) {
        return true
      }


      /*
      Also reject any elements which would insert any one of
      our forbidden tag types: script, iframe, object,
      applet, video, or audio
      */
      if (['addElement', 'replaceElement'].indexOf(info.diff.action) !== -1) {
        if (info.diff.element && forbiddenTags.indexOf(info.diff.element.nodeName) !== -1) {
          console.log('Rejecting forbidden tag of type (%s)', info.diff.element.nodeName)
          return true
        } else if (info.diff.newValue && forbiddenTags.indexOf(info.diff.newValue.nodeType) !== -1) {
          console.log('Rejecting forbidden tag of type (%s)', info.diff.newValue.nodeName)
          return true
        }
      }

      if (info.node && info.node.tagName === 'BODY') {
        if (info.diff.action === 'removeAttribute' &&
        ['class', 'spellcheck'].indexOf(info.diff.name) !== -1) {
          return true
        }
      }

      /* DiffDOM will filter out magicline plugin elements
      in practice this will make it impossible to use it
      while someone else is typing, which could be annoying.

      we should check when such an element is going to be
      removed, and prevent that from happening. */
      if (info.node && info.node.tagName === 'SPAN' &&
      info.node.getAttribute('contentEditable') === 'false') {
        // it seems to be a magicline plugin element...
        // but it can also be a widget (MEDIATAG), in which case the removal was
        // probably intentional

        if (info.diff.action === 'removeElement') {
          // and you're about to remove it...
          if (!info.node.getAttribute('class') ||
          !/cke_widget_wrapper/.test(info.node.getAttribute('class'))) {
            // This element is not a widget!
            // this probably isn't what you want
            /*
            I have never seen this in the console, but the
            magic line is still getting removed on remote
            edits. This suggests that it's getting removed
            by something other than diffDom.
            */
            console.log('preventing removal of the magic line!')

            // return true to prevent diff application
            return true
          }
        }
      }

      // Do not change the contenteditable value in view mode
      if (readOnly && info.node && info.node.tagName === 'BODY' &&
      info.diff.action === 'modifyAttribute' && info.diff.name === 'contenteditable') {
        return true
      }

      cursor.update()

      // no use trying to recover the cursor if it doesn't exist
      if (!cursor.exists()) { return }

      /*  frame is either 0, 1, 2, or 3, depending on which
      cursor frames were affected: none, first, last, or both
      */
      var frame = info.frame = cursor.inNode(info.node)

      if (!frame) { return }

      if (typeof info.diff.oldValue === 'string' && typeof info.diff.newValue === 'string') {
        var pushes = cursor.pushDelta(info.diff.oldValue, info.diff.newValue)

        if (frame & 1) {
          // push cursor start if necessary
          if (pushes.commonStart < cursor.Range.start.offset) {
            cursor.Range.start.offset += pushes.delta
          }
        }
        if (frame & 2) {
          // push cursor end if necessary
          if (pushes.commonStart < cursor.Range.end.offset) {
            cursor.Range.end.offset += pushes.delta
          }
        }
      }
    },
    postDiffApply: function (info) {
      if (info.frame) {
        if (info.node) {
          if (info.frame & 1) { cursor.fixStart(info.node) }
          if (info.frame & 2) { cursor.fixEnd(info.node) }
        } else { console.error('info.node did not exist') }

        var sel = cursor.makeSelection()
        var range = cursor.makeRange()

        cursor.fixSelection(sel, range)
      }
    }
  }
}
