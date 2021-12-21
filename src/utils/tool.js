const Tools = {
  isEmpty (obj) {
    if (obj === undefined || obj === null) {
      return true
    }

    if (obj instanceof Array && obj.length === 0) {
      return true
    }
    return false
  },

  OK: 0

}

export default Tools
