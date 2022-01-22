import moment from "moment"
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
  },

  // 遍历map中value组装成一个字符串，建个符号为interval
  mapForEachValueToString (map, interval = '\n') {
    let strCache = ''
    map.foreach((key, value) => {
      strCache.concat(interval)
    })
    return strCache
  },

  objectValuesToString (obj, interval = '\n') {
    return Object.values(obj).join(interval)
  },

  // 时间格式化
  dateFormater (time) {
    return moment(time).format('yyyy-MM-DD HH:mm:ss')
  }
}

export default Tools
