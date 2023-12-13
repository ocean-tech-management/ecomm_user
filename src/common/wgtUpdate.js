import util from './util.js';
/**
 * 对比版本号，如需要，请自行修改判断规则
 * 支持比对	("3.0.0.0.0.1.0.1", "3.0.0.0.0.1")	("3.0.0.1", "3.0")	("3.1.1", "3.1.1.1") 之类的
 * @param {Object} v1
 * @param {Object} v2
 * v1 > v2 return 1
 * v1 < v2 return -1
 * v1 == v2 return 0
 */
function compare(v1 = '0', v2 = '0') {
	v1 = String(v1).split('.')
	v2 = String(v2).split('.')
	const minVersionLens = Math.min(v1.length, v2.length);

	let result = 0;
	for (let i = 0; i < minVersionLens; i++) {
		const curV1 = Number(v1[i])
		const curV2 = Number(v2[i])

		if (curV1 > curV2) {
			result = 1
			break;
		} else if (curV1 < curV2) {
			result = -1
			break;
		}
	}

	if (result === 0 && (v1.length !== v2.length)) {
		const v1BiggerThenv2 = v1.length > v2.length;
		const maxLensVersion = v1BiggerThenv2 ? v1 : v2;
		for (let i = minVersionLens; i < maxLensVersion.length; i++) {
			const curVersion = Number(maxLensVersion[i])
			if (curVersion > 0) {
				v1BiggerThenv2 ? result = 1 : result = -1
				break;
			}
		}
	}
	return result;
}
/**
 * 更新弹窗
 * @param {标题} title
 * @param {升级内容} contents
 * @param {是否强制更新} is_mandatory
 * @param {安装包下载地址} url
 * @param {安装包平台} platform 默认 Android
 * @param {安装包类型} type wgt
 * 
 */
function updateUseModal({ title, contents, is_mandatory, url, platform = 'Android', type = 'wgt' }) {
  let isWGT = type === 'wgt';
  let isiOS = !isWGT ? platform.includes('iOS') : false;
  let confirmText = isiOS ? '立即跳转更新' : '立即下载更新';
  return uni.showModal({
    title,
    content: contents,
    showCancel: !is_mandatory,
    confirmText,
    success: res => {
      if (res.cancel) return;
      // 安装包下载
      if (isiOS) {
        plus.runtime.openURL(url);
        return;
      }
      let waiting =  plus.nativeUI.showWaiting("正在下载 - 0%");  
      // uni.showLoading({
      // 	title: '安装包下载中'
      // });
      // wgt 和 安卓下载更新
      var downloadTask = uni.downloadFile({
        url,
        success: res => {
          if (res.statusCode !== 200) {
            console.error('下载安装包失败', err);
            return;
          }
          // 下载好直接安装，下次启动生效
          plus.runtime.install(res.tempFilePath, {
            force: false
          }, () => {
            uni.hideLoading()
            plus.nativeUI.closeWaiting();
            if (is_mandatory) {
              //更新完重启app
              plus.runtime.restart();
              return;
            }
            uni.showModal({
              title: '安装成功是否重启？',
              success: res => {
                if (res.confirm) {
                  //更新完重启app
                  plus.runtime.restart();
                }
              }
            });
          }, err => {
            uni.hideLoading()
            uni.showModal({
              title: '更新失败',
              content: err.message,
              showCancel: false
            });
            plus.nativeUI.closeWaiting();
          });
        },
        //接口调用结束
        complete: (e)=>{
          console.log('complete', e);
          uni.hideLoading();
          downloadTask.offProgressUpdate();//取消监听加载进度
          plus.nativeUI.closeWaiting();
        }
      });
      //监听下载进度
      downloadTask.onProgressUpdate(res => {
        // state.percent = res.progress;
        waiting.setTitle("正在下载 - "+res.progress+"%");
        // console.log('下载进度百分比:' + res.progress); // 下载进度百分比
        // console.log('已经下载的数据长度:' + res.totalBytesWritten); // 已经下载的数据长度，单位 Bytes
        // console.log('预期需要下载的数据总长度:' + res.totalBytesExpectedToWrite); // 预期需要下载的数据总长度，单位 Bytes
      });
    }
  });
}
/**
 * 检查是否更新
 */
function sCheckVersion() {
  util.sget('/appVersion/list', {}, res => {
    const list = res.data || [];
    let app, grayscale = [];
    list.forEach(e => {
      if (e.type == 1) app = e; // 线上版本
      if (e.type == 2) grayscale.push(e); // 灰度版本, 可能存在多个灰度版本
    })
    if (!app) return;
    plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
      let nVerSta = compare(app.version, widgetInfo.version),
        sLaststVersion = widgetInfo.version,
        sLaststVersionCode = widgetInfo.versionCode;
      if (nVerSta == 1 && app.version_code > sLaststVersionCode) {
        updateUseModal({
          title: app.title || '',
          contents: app.desc || '',
          is_mandatory: app.force_update == 1, // 1-是 2-否
          url: app.package_url
        })
      }
    })
  })
}
/**
 * 检查是否更新
 */
function checkVersion() {
  util.get('/appVersion/list', {}, res => {
    const list = res.data || [];
    let app, grayscale = [];
    list.forEach(e => {
      if (e.type == 1) app = e; // 线上版本
      if (e.type == 2) grayscale.push(e); // 灰度版本, 可能存在多个灰度版本
    });
    if (!app) return uni.showToast({
      title: '当前为最新版本',
      icon: 'none'
    });
    plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
      let nVerSta = compare(app.version, widgetInfo.version),
        sLaststVersion = widgetInfo.version,
        sLaststVersionCode = widgetInfo.versionCode;
      if (nVerSta == 1 && app.version_code > sLaststVersionCode) {
        updateUseModal({
          title: app.title || '',
          contents: app.desc || '',
          is_mandatory: app.force_update == 1, // 1-是 2-否
          url: app.package_url
        });
      } else {
        uni.showToast({
          title: '当前为最新版本',
          icon: 'none'
        });
      }
    })
  })
}
export default {
  checkVersion,
  sCheckVersion
}