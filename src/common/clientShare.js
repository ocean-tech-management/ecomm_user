/*
 * @Author: xiaojun
 * @Date: 2023-09-19 14:25:21
 * @Last Modified by: xiaojun
 * @Last Modified time: 2023-09-19 16:20:44
 * @Description: 分享
 */
import config from '@/config';
import util from '@/common/util';

export function getClient(target = '') {
  const defaultImage = {
    'share_image': '/static/images/share.jpg',
    'poster_image': '/mine-pages/static/images/poster/user_poster.jpg',
    title: config.written.h5ShareTitle,
    desc: config.written.h5ShareDesc,
  }
  const defaultBack = target && defaultImage[target] ? defaultImage[target] : defaultImage;
  return new Promise((resolve) => {
    const getImageInfo = (posterImage) => {
      uni.getImageInfo({
        src: posterImage,
        success: image => {
          resolve(image.path);
        },
        fail: err => {
          resolve(defaultBack);
        }
      });
    }
    const rtnData = (dataVO = {}) => {
      if (target && !dataVO[target]) {
        resolve(defaultBack);
      } else {
        !uni.getStorageSync('clientGg') && uni.setStorageSync('clientGg', dataVO)
        target ? getImageInfo(dataVO[target]) : resolve(dataVO);
      }
    }
    if (
      uni.getStorageSync('clientGg') &&
      typeof uni.getStorageSync('clientGg') === 'object' &&
      Object.keys(uni.getStorageSync('clientGg')).length > 0
    ) {
      rtnData(uni.getStorageSync('clientGg'))
    } else {
      util.get('/system/clientGg', {}, res => {
        const data = res.data
        if (data && Array.isArray(data) && data.length > 0) {
          rtnData(data[0])
        } else {
          resolve(defaultBack);
        }
      }, err => {
        resolve(defaultBack);
      }, true);
    }
  })
}