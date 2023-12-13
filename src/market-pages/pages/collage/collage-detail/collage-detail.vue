<template>
  <view>
    <view class="collage-info">
      <block v-if="collage.activity_sn">
        <block v-if="collage.hasJoin">
          <block v-if="collage.activity_status == 1">
            <block v-if="collage.pay_status == 1">
              <view class="collage-status">
                未付款
              </view>
              <view class="collage-timeouts">
                请点击 查看订单 去付款
              </view>
            </block>
            <block v-if="collage.pay_status == 2">
              <block v-if="collage.need > 0">
                <view class="collage-status">
                  还差<text>{{collage.need}}</text>人成团
                </view>
                <view v-if="collage.join_user_type == 1" class="collage-tips">必须邀请用户才能拼团成功哦</view>
                <view v-if="collage.join_user_type == 2" class="collage-tips">必须邀请新用户才能拼团成功哦</view>
                <view v-if="collage.join_user_type == 3" class="collage-tips">必须邀请老用户才能拼团成功哦</view>
              </block>
              <block v-if="collage.need == 0">
                <view class="collage-status">
                  等待团队成员全员支付中
                </view>
                <view class="collage-tips">有团员未支付，全员支付后即可成团</view>
              </block>
              <view class="collage-timeouts">
                <view style="margin-right: 23rpx">剩余 </view>
                <view class="collage-timeout-primary" style="margin-right: 23rpx">{{collage.timeout[0]}}</view>
                <view class="collage-timeout-primary" style="margin-right: 11rpx">{{collage.timeout[1]}}</view>
                <view style="margin-right: 11rpx"> : </view>
                <view class="collage-timeout-primary" style="margin-right: 11rpx">{{collage.timeout[2]}}</view>
                <view style="margin-right: 11rpx"> : </view>
                <view class="collage-timeout-warning" style="margin-right: 23rpx">{{collage.timeout[3]}}</view>
                <view> 结束</view> 
              </view>
            </block>
          </block>
          <block v-if="collage.activity_status == 2">
            <view class="collage-status">拼团成功</view>
            <view class="collage-tips">恭喜您拼团成功</view>
          </block>
          <block v-if="collage.activity_status == 3">
            <view class="collage-status">拼团超时未成团</view>
            <view class="collage-tips">该拼团活动未能完成</view>
          </block>
          <block v-if="collage.activity_status == -1">
            <view class="collage-status">您已取消拼团</view>
            <view class="collage-tips">该拼团订单已失效</view>
          </block>
          <block v-if="collage.activity_status == -2">
            <view class="collage-status">已退款</view>
            <view class="collage-tips">该拼团订单已失效</view>
          </block>
        </block>
        <block v-else>
          <!-- 并没有参团 -->
          <block v-if="collage.group_number == collage.users.length">
            <block v-if="collage.activity_status != 2">
              <view class="collage-status">该团已满</view>
              <view class="collage-tips">请重新选择其他团队参团</view>
            </block>
            <block v-if="collage.activity_status == 2">
              <view class="collage-status">拼团成功</view>
              <view class="collage-tips">恭喜您拼团成功</view>
            </block>
          </block>
          <block v-else>
            <block v-if="collage.activity_status == 1">
              <view class="collage-status">
                还差<text>{{collage.need}}</text>人成团
              </view>
              <view class="collage-tips">点击 去参团 按钮参加拼团</view>
              <view class="collage-timeouts">
                <view style="margin-right: 23rpx">剩余 </view>
                <view class="collage-timeout-primary" style="margin-right: 23rpx">{{collage.timeout[0]}}</view>
                <view class="collage-timeout-primary" style="margin-right: 11rpx">{{collage.timeout[1]}}</view>
                <view style="margin-right: 11rpx"> : </view>
                <view class="collage-timeout-primary" style="margin-right: 11rpx">{{collage.timeout[2]}}</view>
                <view style="margin-right: 11rpx"> : </view>
                <view class="collage-timeout-warning" style="margin-right: 23rpx">{{collage.timeout[3]}}</view>
                <view> 结束</view> 
              </view>
            </block>
            <block v-if="collage.activity_status == 3">
              <view class="collage-status">拼团已失效</view>
              <view class="collage-tips">请重新选择有效的团队参团</view>
            </block>
          </block>

        </block>
      </block>
      
      <view class="collage-users">
        <view v-for="(item, index) in collage.users" class="collage-user" :key="item.uid">
          <image class="collage-user-avatar" :src="item.avatarUrl" webp lazy-load></image>
          <view v-if="index == 0 && item.pay_status != 1" class="collage-user-tag">团长</view>
          <view v-if="item.pay_status == 1" class="collage-unpay-tag">未支付</view>
        </view>
        
      </view>
      <view class="collage-info-ctrls">
        <button v-if="collage.activity_status == 1 && collage.pay_status == 2 && collage.hasJoin" class="collage-info-ctrl primary" open-type="share">邀请好友参团</button>
        <view v-if="collage.activity_status == 1 && !collage.pay_status && !collage.hasJoin && collage.group_number > collage.users.length" class="collage-info-ctrl primary" @tap="goToProduct(true)">去参团</view>
        <view v-if="collage.activity_status > 1" class="collage-info-ctrl primary" @tap="goToCollage">逛更多优惠商品</view>
        <view v-if="collage.hasJoin && !fromOrder" class="collage-info-ctrl" @tap="goToOrder">查看订单</view>
        <view v-if="collage.hasJoin && fromOrder" class="collage-info-ctrl" @tap="toOrder">查看订单</view>
      </view>
    </view>





    <view class="order-infos">
      <view class="order-info" @tap="redirectToProduct">
        <view class="order-info-name">商品名称</view>
        <view class="order-info-val order-info-important">{{collage.goods.title}}</view>
        <image class="order-info-arrow" src="/static/images/more.png"></image>
      </view>
      <view class="order-info">
        <view class="order-info-name">开团时间</view>
        <view class="order-info-val">{{collage.start_time_text}}</view>
      </view>
      <view class="order-info">
        <view class="order-info-name">参团身份要求</view>
        <view class="order-info-val">{{userTypeTexts[collage.join_user_type]}}</view>
      </view>
      <view class="order-info">
        <view class="order-info-name">拼团须知</view>
        <view class="order-info-val">人满发货、人不满立刻退款</view>
      </view>
    </view>

    <view v-if="false" class="recommands">
      <view class="recommand-tabs">
        <view :class="{'recommand-tab': true, 'active': recommandTabIndex == 'other'}" data-val="other" @tap="updateRecommandTabIndex">其他拼团</view>
        <view :class="{'recommand-tab': true, 'active': recommandTabIndex == 'hot'}" data-val="hot" @tap="updateRecommandTabIndex">好物推荐</view>
      </view>
      <!-- 动态标记点 -->
      <view v-if="recommandTabIndex == 'other'" class="recommand-list">
        <view v-for="item in otherProducts[recommandTabIndex]" class="recommand-item" :data-sn="item.goods_sn" @tap="replaceProduct" :key="item.sku_sn">
          <view class="recommand-img-box">
            <image class="recommand-img" :src="item.main_image" mode="widthFix" webp lazy-load></image>
          </view>
          <view class="recommand-name">{{item.title}}</view>
          <view class="recommand-val">￥{{item.sku_min}}</view>
          <view class="recommand-val-tags">
            <view class="recommand-val-tag">满200减10元</view>
          </view>
        </view>
      </view>
      <view v-if="recommandTabIndex == 'hot'" class="product-list">
        <view v-for="item in otherProducts[recommandTabIndex]" class="product-item" :data-sn="item.goods_sn" @tap="replaceProduct" :key="item.product_id">
          <view class="product-img-box">
            <image class="product-img" :src="item.main_image" mode="aspectFill" webp lazy-load></image>
          </view>
          <view class="product-info">
            <view class="product-title">{{item.title}}</view>
            <view class="other-collage-info">
              <view class="collage-info-avatars">
                <image class="collage-product-avatar-default" src="/static/images/joiner.png" mode="widthFix"></image>
              </view>
              <view class="collage-info-number">等已拼团</view>
            </view>
            <view class="index-product-vals">
              <view class="index-product-val">¥{{item.member_price}}</view>
              <view class="index-product-val-unactive"></view>
              <view class="collage-product-ctrls">
                <view class="collage-product-ctrl">拼团</view>
              </view>
            </view>

          </view>
        </view>
      </view>

    </view>
  </view>
  
</template>
<script>
import moment from 'moment';
import config from '@/config';
export default {
  data() {
    return {
      activity_code: null,
      activity_sn: null,
      fromOrder: false,
      startCollage: false,

      collage: {},
      collageTimeout: null,
      userTypeTexts: {
        [1]: '全部成员',
        [2]: '新用户',
        [3]: '老用户'
      },

      otherProducts: {},
      recommandTabIndex: 'other'
    }
  },
  onLoad(options) {
    this.activity_code = options.code;
    this.activity_sn = options.sn;
    if(options.fromOrder) this.fromOrder = options.fromOrder;

    this.getData();
    this.getUserTypes();
    // this.getOtherProducts();

    // #ifdef MP-WEIXIN
    // 微信小程序订阅消息
    if(uni.getStorageSync('subscribeReject')) {
      // 存在不接受局部/全部消息的情况
      if(uni.getStorageSync('subscribeReject') == 'all') {
        uni.showModal({
          title: '提示',
          content: '您有部分消息不接收或默认禁止该类别的消息推送，导致部分服务消息无法推送给您。为了后面您更好的体验，建议您前往 设置->订阅消息 开启相关服务消息的推送。',
          confirmText: '前往设置',
          success: res => {
            if(res.confirm) {
              uni.openSetting();
            }
          }
        })
      } else {
        uni.showModal({
          title: '提示',
          content: `您关闭了${this.$name}的消息提醒服务，无法给您推送对应的服务消息。为了后面您更好的体验，建议您前往 设置->订阅消息 开启服务消息的推送。`,
          confirmText: '前往设置',
          success: res => {
            if(res.confirm) {
              uni.openSetting();
            }
          }
        })
      }
      uni.removeStorageSync('subscribeReject');
    }
    // #endif
  },
  onUnload() {
    if(this.collageTimeout) clearInterval(this.collageTimeout);
  },
  onShareAppMessage() {
    let target = `/market-pages/pages/collage/collage-detail/collage-detail?sn=${this.activity_sn}&code=${this.activity_code}`;
    let path = `/pages/index/index?redirect=${encodeURIComponent(target)}&link_uid=${uni.getStorageSync('userInfo').uid}`;
    if(!this.startCollage || this.collage.activity_status == 3 || this.collage.activity_status == -2) {
      path = '/pages/index/index';
      uni.showModal({
        title: '提示',
        content: '该团状态异常或团长未正式开团，分享无效。请选择其他团队参团或等待团长支付后正式开团',
        showCancel: false
      })
    }
    let shareInfo = {
      title: this.collage.share_title || `诚邀您参加拼团抢购`,
      desc: this.collage.share_desc || config.written.shareTitle,
      imageUrl: this.collage.share_cover || this.collage.goods.image,
      path: path
    }
    console.log(shareInfo);
    return shareInfo;
  },
  methods: {
    getData() {
      let params = {
        activity_code: this.activity_code,
        activity_sn: this.activity_sn,
      }
      this.$get('/pt/info', params, res => {
        let dataList = res.data;
        let collage = {};
        collage.users = [];
        for(let i = 0; i < dataList.length;i++) {
          dataList[i].user.pay_status = dataList[i].pay_status;
          if(dataList[i].user_role == 1) {
            if(dataList[i].pay_status == 2) this.startCollage = true;
            collage.users.unshift(dataList[i].user);  //将团长身份的调到第一个
          } else {
            collage.users.push(dataList[i].user);
          }
          if(dataList[i].uid == uni.getStorageSync('userInfo').uid) {
            collage.hasJoin = true;
            collage.order_sn = dataList[i].order_sn;
            collage.activity_status = dataList[i].activity_status;
            collage.pay_status = dataList[i].pay_status;
          }
        }
        
        collage.goods = dataList[0].goods;
        collage.activity_sn = dataList[0].activity_sn;
        collage.activity_code = dataList[0].activity_code;
        collage.activity_title = dataList[0].activity.activity_title;
        collage.sku_sn = dataList[0].sku_sn;
        collage.group_number = dataList[0].group_number;
        collage.need = dataList[0].group_number - dataList.length;
        collage.join_user_type = dataList[0].join_user_type;
        collage.start_user_type = dataList[0].start_user_type;
        collage.share_title = dataList[0].activity ? dataList[0].activity.share_title : null;
        collage.share_desc = dataList[0].activity ?  dataList[0].activity.share_desc : null;
        collage.share_cover = dataList[0].activity ?  dataList[0].activity.share_cover : null;

        if(!collage.hasJoin) {
          if(dataList[0].activity_status == 1 || dataList[0].activity_status == 3 || dataList[0].activity_status == -2) {
            collage.activity_status = dataList[0].activity_status;
          }
        }

        
        collage.start_time = dataList[0].start_time;
        collage.start_time_text = moment(dataList[0].start_time).format('YYYY.MM.DD');
        collage.end_time = dataList[0].end_time;
        if(collage.activity_status == 1) {
          let timeSpan = moment(collage.end_time).diff(moment(new Date()), 'seconds');
          let duration = moment.duration(timeSpan, 'seconds');
          if( timeSpan <= 0) {
            collage.activity_status = 3;  //检查是不是超时了，超时改状态避免后台定时任务有时候有问题
          } else {
            collage.timeout = [
              duration.days(), 
              duration.hours() < 10 ? ('0' + duration.hours()) : duration.hours(),
              duration.minutes() < 10 ? ('0' + duration.minutes()) : duration.minutes(),
              duration.seconds() < 10 ? ('0' + duration.seconds()) : duration.seconds()
            ];
            this.timeOut();
          }
        }
        this.collage = collage;
      }, err => {
        console.log(err);
      })
        
    },
    
    getUserTypes() {
      this.$sget('/home/userTypeList', null, res => {
        let userTypes = res.data;
        let userTypeTexts = {};
        for(let i = 0; i < userTypes.length; i++) {
          userTypeTexts[userTypes[i].u_type] = userTypes[i].u_name;
        }
        this.userTypeTexts = userTypeTexts;
        
      })
    },
    timeOut() {
      this.collageTimeout = setInterval(() => {
        let timeSpan = moment(this.collage.end_time).diff(moment(new Date()), 'seconds');
        if(timeSpan <= 0) {
          this.collage.activity_status = 3;
          return clearInterval(this.collageTimeout);
        }
        let duration = moment.duration(timeSpan, 'seconds');
        this.collage.timeout = [duration.days(), duration.hours(), duration.minutes(), duration.seconds()];
        
      }, 1000)
    },


    getOtherProducts() {
      let params = {
        category_code: '0027'
      }
      this.$get('/goods/other', params, res => {
        this.otherProducts = res.data;
      })
        
    },
    replaceProduct(e) {
      let sn = e.currentTarget.dataset.sn;
      uni.redirectTo({
        url: `/pages/product-detail/product-detail?sn=${sn}`
      })
    },
    updateRecommandTabIndex(e) {
      let val = e.currentTarget.dataset.val;
      this.recommandTabIndex = val;
    },
    
    goToCollage() {
      uni.navigateTo({
        url: `/market-pages/pages/collage/collages/collages?code=${this.collage.activity_code}&name=${this.collage.activity_title}`
      })
    },
    goToOrder() {
      uni.navigateTo({
        url: `/pages/order-detail/order-detail?sn=${this.collage.order_sn}`
      })
    },
    toOrder() {
      uni.redirectTo({
        url: `/pages/order-detail/order-detail?sn=${this.collage.order_sn}`
      })
    },
    goToProduct(join = false) {
      // 带好信息去课程详情
      if(join) uni.setStorageSync('collage', this.collage);
      uni.navigateTo({
        url: `/pages/product-detail/product-detail?sn=${this.collage.goods.goods_sn}`
      })
    },
    redirectToProduct() {
      uni.redirectTo({
        url: `/pages/product-detail/product-detail?sn=${this.collage.goods.goods_sn}&fromJoin=true`
      })
    }
  }
  
}
</script>
<style lang="scss" scoped>
  @import 'collage-detail.scss';
</style>