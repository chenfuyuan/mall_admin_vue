const Tools = {
  /**
   * 判断传入对象是否为空
   * @param {判断对象} obj 
   * @returns 该对象是否为空
   */
  isEmpty (obj) {
    if (obj === undefined || obj === null) {
      return true
    }

    if (obj instanceof Array && obj.length === 0) {
      return true
    }
    return false
  },

  /**
   * 处理出错
   * @param {出错组件} app
   * @param {出错信息} msg
   */
  messageError (app, msg = '') {
    app.$message.error(msg)
  }

}

export default Tools
