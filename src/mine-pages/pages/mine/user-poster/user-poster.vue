<template>
  <view class="uni-common-pb-withbtn">
    <view class="poster-page">
      <image class="poster" :src="posterUrl" mode="widthFix" webp></image>
      <canvas id="poster-canvas" canvas-id="poster-canvas"
        :style="'width: 710px; height: ' + posterHeight + 'px'"></canvas>

      <!-- #ifdef H5 -->
      <view class="poster-tips">长按海报保存图片</view>
      <!-- #endif -->
    </view>
    <!-- #ifndef H5 -->
    <view class="bottom-btns">
      <view class="bottom-btn" @tap="saveImage">
        <view>保存图片</view>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import config from '@/config'
import {getClient} from '@/common/clientShare'
export default {
  data() {
    return {
      couldSave: false, //是否可以保存

      posterUrl: '',

      userInfo: uni.getStorageSync('userInfo'),

      bg: {
        path: null,
        left: 0,
        top: 0,
        width: 710,
        height: 1200
      },
      qrCode: {
        path: null,
        left: 594,
        top: 1194,
        width: 120,
        height: 120
      },
      logo: {
        path: '/static/images/logo.png',
        width: 50,
        height: 50
      },
      posterHeight: 1200,  //画布高度
    }
  },
  onLoad(options) {
    uni.showLoading({title: '生成专属图中'});
    Promise.all([ this.getPosterBg(), this.getLogo(), this.getQrcode()]).then(() => {
      return this.drawPoster();
    }).then(() => {
      uni.hideLoading();
    }).catch(err => {
      uni.hideLoading();
      console.log('err', err);
      setTimeout(() => {
        uni.showToast({
          title: '网络有问题请重试',
          mask: true,
          icon: 'none'
        })
      }, 200)

    });

    // 获取小程序的授权，仅小程序有效
    // #ifdef MP
    uni.getSetting({
      success: res =>{
        let couldSave = false;
        couldSave = res.authSetting['scope.writePhotosAlbum'] == false ? false : true;
        this.couldSave = couldSave;
      }
    })
    // #endif
  },
  methods: {

    saveImage: function () {
      // 小程序有效，保存图片
      let that = this;
      // #ifdef MP
      if(!that.couldSave) {
        uni.openSetting({
          success(settingdata) {
            if (settingdata.authSetting['scope.writePhotosAlbum']) {
              // 获取权限成功，给出再次点击图片保存到相册的提示。
              that.couldSave = true;
              uni.showToast({
                title: '授权成功请重试',
                icon: "success",
                mask: true
              })
            } else {
              // 获取权限失败，给出不给权限就无法正常使用的提示
              uni.showToast({
                title: '需要授权方可保存',
                icon: "none",
                mask: true
              })
            }
          }
        })
        return;
      }
      // #endif
      uni.saveImageToPhotosAlbum({
        filePath: that.posterUrl,
        success: function (res) {
          uni.showToast({
            title: '保存成功',
            icon: "success",
            mask: true
          })
        },
        fail: function (res) {
          if(res.errMsg == 'saveImageToPhotosAlbum:fail auth deny') {
            that.couldSave = false;
          }
          uni.showToast({
            title: '保存失败，请重试',
            icon: "none",
            mask: true
          })

          console.log('fail', res)
        }
      })
    },

    getPosterBg() {
      // let promise = new Promise( (resolve, reject) => {
      //   if (config.simplifyName == 'ql') {
      //     that.bg.path = '/mine-pages/static/images/poster/user_poster_ql.jpg';
      //   } else {
      //     that.bg.path = '/mine-pages/static/images/poster/user_poster.jpg';
      //   }
      //   resolve();
      // })
      // return promise;
      let that = this;
      return new Promise(async (resolve, reject) => {
        const data = await getClient('poster_image')
        that.bg.path = data
        resolve()
      })
    },

    getLogo() {
      let that = this;
      let promise = new Promise( (resolve, reject) => {

        that.logo.path = '/static/images/logo.png';
        resolve();
      })
      return promise;

    },

    // #ifndef H5 || APP-PLUS
    getQrcode() {
      // 获取二维码

      let promise = new Promise( (resolve, reject) => {
        let content = 'Nope';
        if(uni.getStorageSync('userInfo').uid) content += `&${uni.getStorageSync('userInfo').uid}`;
        let params = {
          page: 'pages/index/index',
          content: content,
          width: '233px',
          auto_color: false
        }
        this.$post('/home/wxCode', params, res => {
          uni.getImageInfo({
            src: res.data,
            success: image => {
              this.qrCode.path = image.path;
              resolve();
            },
            fail: err => {
              console.log(err);
              uni.showToast({
                title: '获取二维码失败',
                icon: 'none'
              })
              reject();
            }
          });
        }, err => {
          console.log(err);
          uni.showToast({
            title: '获取二维码失败',
            icon: 'none'
          })
          reject();
        });
      })
      return promise;
    },
    // #endif

    // #ifdef H5 || APP-PLUS
    getQrcode() {
      // 获取二维码

      let promise = new Promise( (resolve, reject) => {
        let content = '';
        // #ifdef H5
        content = `${window.location.origin}?link_uid=${uni.getStorageSync('userInfo').uid}`
        // #endif
        // #ifdef APP-PLUS
        content = `${this.$href}?link_uid=${uni.getStorageSync('userInfo').uid}`
        // #endif
        let params = {
          content: content,
        }
        this.$post('/home/QrCode', params, res => {
          uni.getImageInfo({
            src: res.data,
            success: image => {
              this.qrCode.path = image.path;
              resolve();
            },
            fail: err => {
              console.log(err);
              uni.showToast({
                title: '获取二维码失败',
                icon: 'none'
              })
              reject();
            }
          });
        }, err => {
          console.log(err);
          uni.showToast({
            title: '获取二维码失败',
            icon: 'none'
          })
          reject();
        });
      })
      return promise;
    },
    // #endif

    drawPoster() {
      let that = this;
      return new Promise( (resolve, reject) => {
        let ctx = uni.createCanvasContext('poster-canvas');
        ctx.clearRect(0, 0, 710, this.posterHeight);
        ctx.setFillStyle('#ffffff');
        ctx.fillRect(0, 0, 710, this.posterHeight);
        ctx.restore();

        ctx.font = 'normal 28px/1.4 "pingfangSC"';
        ctx.setFillStyle('#313131');  //设置全局绘画颜色为#313131
        ctx.setTextAlign('left');
        ctx.setTextBaseline('top');
        ctx.save();


        ctx.drawImage(that.bg.path, that.bg.left, that.bg.top, that.bg.width, that.bg.height);      //画顶部背景
        ctx.restore();

        ctx.setFontSize(28);
        let fontWidth = 10; //其实10px宽
        let currentRowWidth = 0;
        let userInfo = this.userInfo;
        let userName = '';
        for (let j = 0; j < userInfo.name.length; j++) {
          let currentWord = userInfo.name[j];
          let currentWordWidth = ctx.measureText(currentWord).width;
          currentRowWidth += currentWordWidth;
          // 每行只能有400px宽度
          if(currentRowWidth > 300 || j == userInfo.name.length - 1) {

            let endIndex = j + 1;

            userName = userInfo.name.substring(0, endIndex);
            if(endIndex < userInfo.name.length - 1) userName = userName.substring(0, userName.length - 1) + '...';

            fontWidth += currentRowWidth;
            break;
          }
        }

        fontWidth += 10;  //左边距10
        let startRecommendStart = fontWidth;
        let currentWordWidth = ctx.measureText(' 向你推荐').width;
        fontWidth += currentWordWidth;

        fontWidth += 10;  //右边距10

        let shareBarWidth = fontWidth + 56 + 28; //字宽 加上logo 以及半圆
        let shareBarOffset = (710 - shareBarWidth) / 2;

        ctx.drawImage('/mine-pages/static/images/poster/left.png', shareBarOffset, 900, 28, 56);      //画顶部背景
        ctx.restore();

        ctx.drawImage('/mine-pages/static/images/poster/right.png', shareBarOffset + 56 + fontWidth, 900, 28, 56);      //画顶部背景
        ctx.restore();

        ctx.setFillStyle('#f6f6f6');
        ctx.fillRect(shareBarOffset + 28, 900, fontWidth + 28, 56);
        ctx.restore();


        ctx.drawImage(that.logo.path, shareBarOffset + 3, 903, that.logo.width, that.logo.height);    //画印章
        ctx.restore();

        ctx.drawImage(that.qrCode.path, 300, 1000, that.qrCode.width, that.qrCode.height);    //画印章
        ctx.restore();


        ctx.setFontSize(28);
        ctx.setTextBaseline('middle');
        ctx.setFillStyle('#000000')
        ctx.fillText(`${userName} 向你推荐`, shareBarOffset + 56 + 10, 928);
        ctx.restore();

        ctx.draw(false, () => {
          uni.canvasToTempFilePath({
            canvasId: 'poster-canvas',
            fileType: 'jpg',
            success: function (res) {
              let poster = res.tempFilePath;
              that.posterUrl = poster;
              resolve();
            },
            fail: function (err) {
              reject();
            }
          })
        });

      })



    }
  }
}
</script>

<style lang="scss" scoped>
@import './user-poster.scss';
</style>