const Tools = {
  /**
   * 判断传入对象是否为空
   * @param {obj} obj 判断对象
   * @returns 该对象是否为空
   */
  isEmpty (obj) {
    if (obj === undefined || obj === null || obj === '') {
      return true
    }

    if (obj instanceof Array && obj.length === 0) {
      return true
    }
    return false
  },

  /**
   * 处理出错
   * @param {vue.app} app vue对象
   * @param {string} msg 错误信息
   */
  messageError (app, msg = '') {
    app.$message.error(msg)
  },

  // ElementUI校验工具类
  validateTool: {

    // 抛出错误信息
    throwError (callback, msg) {
      callback(new Error(msg))
    },

    // 非空
    require (value, msg, callback) {
      if (Tools.isEmpty(value)) {
        this.throwError(callback, msg)
      }
      return this
    },
    // 数字
    num (value, msg, callback) {
      if (Tools.isEmpty(value) || isNaN(value)) {
        this.throwError(callback, msg)
      }
      return this
    },
    condition (isTrue, msg, callback) {
      if (isTrue) {
        this.throwError(callback, msg)
      }
      return this
    }
  }

}

export default Tools
