// eslint-disable-next-line no-unused-vars
const GlobalConst = {
  /**
   * 请求响应返回
   */
  RESPONSE_CODE: {
    OK: 0
  },

  /**
   * 空的请求响应回调函数
   * @param {*} response 响应
   */
  RESPONSE_EMPTY_CALLBACK: (response) => {

  },

  RESPONSE_COMMON_CALLBACK: (app, response, successMsg = '操作成功!') => {
    if (response.code !== this.RESPONSE_CODE.OK) {
      app.$message.error(response.msg)
      return
    }

    app.$message({
      showClose: true,
      message: response.msg === 'success' ? successMsg : response.msg,
      type: 'success',
      duration: 1000
    })
  }
}

export default GlobalConst
