<template>
  <view class="flex-page">
    
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <view class="reputation-baseinfo">
        <view class="reputation-title">口碑信息</view>
        <view class="reputation-tag-box">
          <input class="reputation-tag" type="text" placeholder="请填写个人标签" maxlength="36" v-model="reputation.user_tag" @input="updateTag"/>
        </view>
        <view class="reputation-desc-box">
          <textarea class="reputation-desc" type="textarea" placeholder="请填写口碑内容…" maxlength="256" v-model="reputation.content" @input="updateDesc"></textarea>
        </view>
      </view>

      <view class="reputation-extend">
        <view class="reputation-extend-title">
          <view class="reputation-extend-title-lg">口碑信息</view>
          <view class="reputation-extend-title-tips">限9张</view>
        </view>
        <view class="reputation-uploads">
          <view v-for="(item, index) in reputation.images" class="reputation-upload-item" :key="index">
            <view class="reputation-upload-img-box">
              <image class="reputation-upload-img" :src="item.image_url" mode="widthFix"></image>
            </view>
            <view class="return-picture-delete-box" @tap="deletePicture(index)">
              <image class="return-picture-delete" src="/static/images/delddre.png"></image>
            </view>
          </view>
          <view v-if="reputation.images.length < 9" class="reputation-upload" @tap="uploadPicture">＋</view>
        </view>
      </view>
    </view>

    <view class="bottom-btns">
      <view class="bottom-btn confirm-btn" @tap="confirmAdd">
        提交审核
      </view>
    </view>

    <kps-image-cutter @ok="onok" @cancel="oncancel" :url="currentImg" :fixed="true" :width="1500" :height="1500"></kps-image-cutter>
    
  </view>
  
</template>

<script>
import util from '@/common/util';
import kpsImageCutter from "@/components/ksp-image-cutter/ksp-image-cutter.vue";

export default {
  components: {
    kpsImageCutter
  },
  data() {
    return {
      sn: '',
      reputation: {
        user_tag: '',
        content: '',
        images: []
      },
      currentImg: ''
    }
  },
  onLoad(options) {
    if(!options.sn) {
      uni.showToast({
        title: '不要尝试啦，正在返回首页',
        icon: 'none',
        mask: true
      })
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500);
      return;
    }
    this.sn = options.sn;
    if(uni.getStorageSync('userTag')) this.reputation.user_tag = uni.getStorageSync('userTag');
  },
  methods: {
    updateTag(e) {
      this.reputation.user_tag = e.detail.value;
    },
    updateDesc(e) {
      this.reputation.content = e.detail.value;
    },
    
    uploadPicture() {
      uni.chooseImage({
        count: 1,
        success: (chooseImageRes) => {
          const tempFilePaths = chooseImageRes.tempFilePaths;
          this.currentImg = tempFilePaths[0];
        }
      });
    },

    onok(res) {
      let uploadTask = uni.uploadFile({
        url: `${util.serviceInfo.url}/upload/upload`, 
        filePath: res.path,
        name: 'file',
        header: {
          token: uni.getStorageSync('token').token
        },
        reputation: {},
        success: (uploadFileRes) => {
          let res = JSON.parse(uploadFileRes.data);
          if(res && res.error_code == 0) {
            let item = {
              id: new Date().getTime(),
              image_url: res.data
            }
            this.reputation.images.push(item);
            this.currentImg = '';
            uni.showToast({
              title: '上传图片成功',
              mask: true
            })
          } else {
            console.log(res.msg);
            uni.showModal({
              title: '提示',
              content: res.msg || '上传失败请重试',
              showCancel: false
            })
          }
        },
        fail: err => {
          console.log(err)
          uni.showToast({
            title: '上传失败请重试',
            icon: 'none'
          })
        }
      });
    },
    oncancel() {
      this.currentImg = '';
    },
    
    deletePicture(index) {
      uni.showModal({
        title: '提示',
        content: '您确定删除该口碑图？',
        success: res => {
          if(res.confirm) {
            this.reputation.images.splice(index, 1);
            uni.showToast({
              title:'删除成功',
              mask: true
            })
          }
        }
      })
    },

    confirmAdd() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        goods_sn: this.sn,
        user_tag: this.reputation.user_tag,
        content: this.reputation.content.trim(),
        images: []
      }
      for(let i = 0; i < this.reputation.images.length; i++) {
        let item = {
          image_url: this.reputation.images[i].image_url,
          sort: i
        }
        params.images.push(item);
      }
      if(!params.user_tag || params.user_tag === '') {
        return uni.showModal({
          title: '提示',
          content: '请填写个人标签',
          showCancel: false
        })
      } else if(!params.content || params.content === '') {
        return uni.showModal({
          title: '提示',
          content: '请填写口碑内容，不能留空或者全为空格哦',
          showCancel: false
        })
      } else if(params.images.length == 0) {
        return uni.showModal({
          title: '提示',
          content: '请上传至少一张口碑图片哦',
          showCancel: false
        })
      } 
      this.$post('/reputation/create', params, res => {
        uni.setStorageSync('userTag', params.user_tag);
        setTimeout(() => {
          uni.showToast({
            title: '提交审核成功',
            mask: true,
            duration: 2000
          })
          setTimeout(() => {
            uni.navigateBack();
          }, 1800)
        }, this.$toastDelay)
        
      });

    }

  }
}
</script>


<style lang="scss" scoped>
  @import 'reputation-add.scss';
</style>