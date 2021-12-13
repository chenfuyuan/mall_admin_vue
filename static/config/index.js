/**
 * 开发环境
 */
;(function () {
  window.SITE_CONFIG = {};

  // api接口请求地址
  //window.SITE_CONFIG['baseUrl'] = 'http://localhost:8080/renren-fast';
  //修改为向网关发请求
  window.SITE_CONFIG['baseUrl'] = 'http://192.168.249.4:88/api';
  // cdn地址 = 域名 + 版本号
  window.SITE_CONFIG['domain']  = './'; // 域名
  window.SITE_CONFIG['version'] = '';   // 版本号(年月日时分)
  window.SITE_CONFIG['cdnUrl']  = window.SITE_CONFIG.domain + window.SITE_CONFIG.version;
})();
