import Tools from '@/utils/Tool.js'
// eslint-disable-next-line no-unused-vars
const GlobalConst = {

  OPTION: {
    ADD: 'add',
    UPDATE: 'update',
    DELETE: 'delete'
  },
  // 分类Id
  CATLEVEL: {
    CATLEVEL_1: 1,
    CATLEVEL_2: 2,
    CATLEVEL_3: 3
  },

  /**
   * 请求响应返回
   */
  RESPONSE_CODE: {
    OK: '200',
    BODY_NOT_MATCH: '400',
    DATA_VALIDATE_ERROR: '405'
  },

  /**
   * 空的请求响应回调函数
   * @param {*} response 响应
   */
  RESPONSE_EMPTY_CALLBACK: (response) => {

  },

  RESPONSE_COMMON_CALLBACK: (app, response, successMsg = '操作成功!', onclose = null) => {
    if (response.code !== GlobalConst.RESPONSE_CODE.OK) {
      // 操作失败
      if (response.code === GlobalConst.RESPONSE_CODE.DATA_VALIDATE_ERROR) {
        // 数据校验错误，提示信息
        app.$message.error(Tools.objectValuesToString(response.error))
      } else {
        app.$message.error(response.msg)
      }
      return
    }
    app.$message({
      showClose: true,
      message: response.msg === 'success' ? successMsg : response.msg,
      type: 'success',
      duration: 1500,
      onclose: onclose()
    })
  }
}

export default GlobalConst
