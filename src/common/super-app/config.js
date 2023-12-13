// 平台号
const platform_num = 'Changmengkou';

// 请求配置项
const serviceInfo = {
  // url: 'https://develop.superapp.wsy010.cn'
  url: 'https://superapp.mlhcmk.com'
}

// 错误状态码字典
const errorDictionary = {
  [202]: 'Code 错误',
  [203]: 'Cocd 已失效',
  [204]: 'Cocd 已过期',
  [205]: '平台号信息错误',
  [206]: '该平台已删除',
  [207]: '该平台已停用',
  [208]: '该平台还未接入',
  [209]: '该平台已停止接入',
  [210]: '秘钥key错误',
  [211]: '秘钥secret错误',
  [212]: '接入标签错误'
}

export default {
  platform_num,
  serviceInfo,
  errorDictionary
}