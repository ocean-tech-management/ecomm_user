<template>
  <view class="uni-common-pb-withbtn">
    <view class="poster-page">
      <image class="poster" :src="posterUrl" mode="widthFix" webp></image>
      <canvas id="poster-canvas" canvas-id="poster-canvas" :style="'width: 750px; height: ' + posterHeight + 'px'"></canvas>
    </view>
    <view class="bottom-btns">
      <view class="bottom-btn" @tap="saveImage">
        <view>保存图片</view>
      </view>

    </view>
  </view>

</template>

<script>
import moment from 'moment';
export default {
  data() {
    return {
      userInfo: uni.getStorageSync('userInfo') || {}, 
      couldSave: false, //是否可以保存
      
      posterUrl: '',

      bg: {
        path: null,
        left: 0,
        top: 0,
        width: 750,
        height: 1018
      },
      posterHeight: 1018,  //画布高度
    }
  },
  onLoad(options) {
    this.getMemberInfo(() => {
      uni.showLoading({title: '生成专属图中'});
      Promise.all([ this.getPosterBg() ]).then(() => {
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
    getMemberInfo(handler) {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/warrant/user', params, res => {
        let userInfo = res.data;
        userInfo.create_time = userInfo.member.create_time ? moment(userInfo.member.create_time).format('YYYY年MM月DD日') : '——';
        this.userInfo = userInfo;
        if(handler && typeof handler === 'function') handler();
      })
    },
    saveImage: function () {
      // 小程序有效，保存图片
      // #ifdef MP
      let that = this;
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
      // #endif
    },

    getPosterBg() {
      let that = this;
      let promise = new Promise( (resolve, reject) => {
        that.bg.path = '/mine-pages/static/images/license.jpg';
        resolve();
      })
      return promise;
      
    },

    
    drawPoster() {
      let that = this;
      let userInfo = this.userInfo;
        
      return new Promise( (resolve, reject) => {
        let ctx = uni.createCanvasContext('poster-canvas');
        ctx.clearRect(0, 0, 750, this.posterHeight);
        ctx.setFillStyle('#ffffff');
        ctx.fillRect(0, 0, 750, this.posterHeight);
        ctx.restore();

        ctx.font = 'normal 28px/1.4 "pingfangSC"';
        ctx.setFillStyle('#313131');  //设置全局绘画颜色为#313131
        ctx.setTextAlign('center');
        ctx.setTextBaseline('top');
        ctx.save();
        
        ctx.drawImage(that.bg.path, that.bg.left, that.bg.top, that.bg.width, that.bg.height);      //画顶部背景

        let fontSize = 28;  //设置字号大小
        ctx.font = `bold ${fontSize}px/1.4 "pingfangSC"`;
        ctx.fillText(userInfo.name || '——', 375, 480);  //画名称
        ctx.restore();

        fontSize = 26;  //设置字号大小
        ctx.font = `bold ${fontSize}px/1.4 "pingfangSC"`;
        ctx.fillText(userInfo.phone || '——', 375, 522);  //画手机号码
        ctx.restore();

        fontSize = 28;  //设置字号大小
        ctx.font = `bold ${fontSize}px/1.4 "pingfangSC"`;
        ctx.fillText(userInfo.vip_name || '——', 375, 564);  //画手机号码
        ctx.restore();

        fontSize = 22;  //设置字号大小
        ctx.font = `normal ${fontSize}px/1.4 "pingfangSC"`;
        ctx.fillText(userInfo.create_time || '——', 375, 754);  //画手机号码
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
  @import './auth-license.scss';
</style>