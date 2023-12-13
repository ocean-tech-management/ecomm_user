<template>
  <view>
    <view class="ppyl-maincontent">
      <view class="ppyl-bg"></view>
      <view class="ppyl-info">
        <block v-if="ppyl.activity_sn">
          <block v-if="ppyl.hasJoin">
            <block v-if="ppyl.activity_status == 1">
              <block v-if="ppyl.pay_status == 1">
                <view class="ppyl-status">
                  未付款
                </view>
                <view class="ppyl-timeouts">
                  系统正在关闭订单，15秒后可继续支付
                </view>
              </block>
              <block v-if="ppyl.pay_status == 2">
                <block v-if="ppyl.need > 0">
                  <view class="ppyl-status">
                    还差<text>{{ppyl.need}}</text>人成团
                  </view>
                  <!-- <view v-if="ppyl.join_user_type == 1" class="ppyl-tips">必须邀请用户才能拼团成功哦</view>
                  <view v-if="ppyl.join_user_type == 2" class="ppyl-tips">必须邀请新用户才能拼团成功哦</view>
                  <view v-if="ppyl.join_user_type == 3" class="ppyl-tips">必须邀请老用户才能拼团成功哦</view> -->
                </block>
                <block v-if="ppyl.need == 0">
                  <view class="ppyl-status">
                    等待团队成员全员支付中
                  </view>
                  <view class="ppyl-tips">有团员未支付，全员支付后即可成团</view>
                </block>
                <view class="ppyl-timeouts">
                  <view style="margin-right: 23rpx">剩余 </view>
                  <view class="ppyl-timeout-primary" style="margin-right: 23rpx">{{ppyl.timeout[0]}}</view>
                  <view class="ppyl-timeout-primary" style="margin-right: 11rpx">{{ppyl.timeout[1]}}</view>
                  <view style="margin-right: 11rpx"> : </view>
                  <view class="ppyl-timeout-primary" style="margin-right: 11rpx">{{ppyl.timeout[2]}}</view>
                  <view style="margin-right: 11rpx"> : </view>
                  <view class="ppyl-timeout-warning" style="margin-right: 23rpx">{{ppyl.timeout[3]}}</view>
                  <view> 结束</view> 
                </view>
              </block>
            </block>
            <block v-if="ppyl.activity_status == 2">
              <block v-if="myPpyl.draw_timeout && myPpyl.win_status == 3">
                <view class="ppyl-tips-md">等待开奖，预计<text class="draw-cold-down">{{myPpyl.draw_time_texts}}</text>公布结果</view>
              </block>
              <block v-else>
                <view v-if="myPpyl.win_status == 1" class="ppyl-tips">您已中奖，可在拼拼订单中查看相关信息</view>
                <view v-else-if="myPpyl.win_status == 2" class="ppyl-tips">很遗憾，您未拼中，请再接再厉</view>
                <view v-else class="ppyl-tips">开奖中，如页面不更新请重新进入</view>
              </block>
            </block>
            <block v-if="ppyl.activity_status == 3">
              <view class="ppyl-status">拼团超时未成团</view>
              <view class="ppyl-tips">该拼团活动未能完成</view>
            </block>
            <block v-if="ppyl.activity_status == -1">
              <view class="ppyl-status">您已取消拼团</view>
              <view class="ppyl-tips">该拼团订单已失效</view>
            </block>
            <block v-if="ppyl.activity_status == -2">
              <view class="ppyl-status">已退款</view>
              <view class="ppyl-tips">该拼团订单已失效</view>
            </block>
            <block v-if="ppyl.activity_status == -3">
              <!-- 未拼中退款 -->
              <view class="ppyl-status">未拼中</view>
              <!-- <view class="ppyl-tips">退款金额已{{refundRoute[myPpyl.refund_route]}}</view> -->
            </block>
          </block>
          <block v-else>
            <!-- 并没有参团 -->
            <block v-if="ppyl.group_number == ppyl.users.length">
              <block v-if="ppyl.activity_status != 2">
                <view class="ppyl-status">该团已满</view>
                <view class="ppyl-tips">请重新选择其他团队参团</view>
              </block>
              <block v-if="ppyl.activity_status == 2">
                <view class="ppyl-status">拼团成功</view>
                <view class="ppyl-tips">恭喜您拼团成功</view>
              </block>
            </block>
            <block v-else>
              <block v-if="ppyl.activity_status == 1">
                <view class="ppyl-status">
                  还差<text>{{ppyl.need}}</text>人成团
                </view>
                <view class="ppyl-tips">点击 去参团 按钮参加拼团</view>
                <view class="ppyl-timeouts">
                  <view style="margin-right: 23rpx">剩余 </view>
                  <view class="ppyl-timeout-primary" style="margin-right: 23rpx">{{ppyl.timeout[0]}}</view>
                  <view class="ppyl-timeout-primary" style="margin-right: 11rpx">{{ppyl.timeout[1]}}</view>
                  <view style="margin-right: 11rpx"> : </view>
                  <view class="ppyl-timeout-primary" style="margin-right: 11rpx">{{ppyl.timeout[2]}}</view>
                  <view style="margin-right: 11rpx"> : </view>
                  <view class="ppyl-timeout-warning" style="margin-right: 23rpx">{{ppyl.timeout[3]}}</view>
                  <view> 结束</view> 
                </view>
              </block>
              <block v-if="ppyl.activity_status == 3">
                <view class="ppyl-status">拼团已失效</view>
                <view class="ppyl-tips">请重新选择有效的团队参团</view>
              </block>
            </block>

          </block>
        </block>
        
        <view class="ppyl-users">
          <view v-for="(item, index) in ppyl.users" class="ppyl-user" :key="item.uid">
            <image class="ppyl-user-avatar" :src="item.avatarUrl" webp lazy-load></image>
            <view v-if="index == 0 && item.pay_status != 1" class="ppyl-user-tag">团长</view>
            <view v-if="item.pay_status == 1" class="ppyl-unpay-tag">未支付</view>
            <view class="ppyl-user-name">{{item.name}}</view>
          </view>
        </view>



        <view v-if="ppyl.pay_status == 1" class="ppyl-continue-btn" @tap="backToPrev">
          返回重新购买
        </view>
        <button v-else-if="ppyl.hasJoin && ppyl.activity_status == 1 && ppyl.pay_status == 2" class="ppyl-continue-btn" open-type="share">
          邀请好友参团
        </button>

        <block v-else-if="!ppyl.hasJoin && ppyl.activity_status == 1">          
          <view class="ppyl-auto-box">
            <view class="pply-auto-title">开启自动拼团</view>
            <view class="pply-auto-tips">
              <view class="pply-auto-tips-content">CVIP专属</view>
            </view>
                  
            <view class="pply-auto-trigger-box">
              <switch class="pply-auto-trigger" :disabled="userInfo.c_vip_level != 1" :checked="autoPP" @change="toggleAutoPP" @tap="validAutoPp"/>
            </view>
          </view>
          <view class="ppyl-continue-btn" @tap="goToProduct">
            去参团
          </view>
        </block>
        <view v-else class="ppyl-continue-btn" @tap="toIndex">
          返回首页
        </view>

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
      area_code: null,
      activity_sn: null,
      fromOrder: false,
      startppyl: false,

      ppyl: {
      },
      myPpyl: {},
      ppylTimeout: null,
      drawTimeout: null,
      userTypeTexts: {
        [1]: '全部成员',
        [2]: '新用户',
        [3]: '老用户'
      },
      winStatus: {
        [1]: '中奖',
        [2]: '未拼中',
        [3]: '待开奖'
      },
      refundRoute: {
        [1]: '原路退回',
        [2]: '退回余额'
      },

      otherProducts: {},
      recommandTabIndex: 'other',

      autoPP: false,
    }
  },
  onLoad(options) {
    this.area_code = options.code;
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
    if(this.ppylTimeout) clearTimeout(this.ppylTimeout);
    if(this.drawTimeout) clearTimeout(this.drawTimeout);
  },
  onShareAppMessage() {
    let target = `/market-pages/pages/ppyl/ppyl-team/ppyl-team?sn=${this.activity_sn}&code=${this.area_code}`;
    let path = `/pages/index/index?redirect=${encodeURIComponent(target)}&link_uid=${uni.getStorageSync('userInfo').uid}`;
    if(!this.startppyl || this.ppyl.activity_status == 3 || this.ppyl.activity_status == -2) {
      path = '/pages/index/index';
      uni.showModal({
        title: '提示',
        content: '该团状态异常或团长未正式开团，分享无效。请选择其他团队参团或等待团长支付后正式开团',
        showCancel: false
      })
    }
    let shareInfo = {
      title: this.ppyl.share_title || `诚邀您参加拼团抢购`,
      desc: this.ppyl.share_desc || this.$written.shareTitle,
      imageUrl: this.ppyl.goods.image || this.ppyl.share_cover,
      path: path
    }
    console.log(shareInfo);
    return shareInfo;
  },
  methods: {
    /**
     * @param init 是否是初次加载，初次加载的需要倒计时
     */
    getData(init = true) {
      let params = {
        area_code: this.area_code,
        activity_sn: this.activity_sn,
      }
      this.$get('/ppyl/info', params, res => {
        let dataList = res.data;
        let ppyl = {};
        ppyl.users = [];
        for(let i = 0; i < dataList.length;i++) {
          dataList[i].user.pay_status = dataList[i].pay_status;
          if(dataList[i].user_role == 1) {
            if(dataList[i].pay_status == 2) this.startppyl = true;
            ppyl.users.unshift(dataList[i].user);  //将团长身份的调到第一个
          } else {
            ppyl.users.push(dataList[i].user);
          }
          if(dataList[i].uid == uni.getStorageSync('userInfo').uid) {
            ppyl.hasJoin = true;
            ppyl.order_sn = dataList[i].order_sn;
            ppyl.activity_status = dataList[i].activity_status;
            ppyl.pay_status = dataList[i].pay_status;

            this.myPpyl = dataList[i];
            if(this.myPpyl.activity_status == 2 && this.myPpyl.draw_time) {
              if(init) {
                let timeSpan = moment(this.myPpyl.draw_time).add(5, 'seconds').diff(moment(new Date()), 'seconds');
                if(timeSpan <= 0) {
                  if(this.myPpyl.draw_timeout) delete this.myPpyl.draw_timeout;
                  clearTimeout(this.drawTimeout);
                } else {
                  let duration = moment.duration(timeSpan, 'seconds');
                  this.myPpyl.draw_timeout = [duration.days(), duration.hours(), duration.minutes(), duration.seconds()];
                  let draw_time_texts = [];
                  if(duration.days() > 0) draw_time_texts.push(`${duration.days()}天`);
                  if(duration.hours() > 0) draw_time_texts.push(`${duration.hours()}小时`);
                  if(duration.minutes() > 0) draw_time_texts.push(`${duration.minutes()}分钟`);
                  if(duration.seconds() > 0) draw_time_texts.push(`${duration.seconds()}秒`);
                  this.myPpyl.draw_time_texts = draw_time_texts.join('');
                  this.tryDrawColdDown();
                }
                
              }
            }
          }
        }
        
        ppyl.goods = dataList[0].goods;
        ppyl.activity_sn = dataList[0].activity_sn;
        ppyl.activity_code = dataList[0].activity_code;
        ppyl.area_code = dataList[0].area_code;
        ppyl.activity_title = dataList[0].activity.activity_title;
        ppyl.sku_sn = dataList[0].sku_sn;
        ppyl.group_number = dataList[0].group_number;
        ppyl.need = dataList[0].group_number - dataList.length;
        ppyl.join_user_type = dataList[0].join_user_type;
        ppyl.start_user_type = dataList[0].start_user_type;
        ppyl.share_title = dataList[0].activity ? dataList[0].activity.share_title : null;
        ppyl.share_desc = dataList[0].activity ?  dataList[0].activity.share_desc : null;
        ppyl.share_cover = dataList[0].activity ?  dataList[0].activity.share_cover : null;

        if(!ppyl.hasJoin) {
          if(dataList[0].activity_status == 1 || dataList[0].activity_status == 3 || dataList[0].activity_status == -2) {
            ppyl.activity_status = dataList[0].activity_status;
          }
        }

        
        ppyl.start_time = dataList[0].start_time;
        ppyl.start_time_text = moment(dataList[0].start_time).format('YYYY.MM.DD');
        ppyl.end_time = dataList[0].end_time;
        if(ppyl.activity_status == 1) {
          if(init) {
            let timeSpan = moment(ppyl.end_time).diff(moment(new Date()), 'seconds'); //多预5秒出来，服务器可能没法处理得那么快
            if(timeSpan <= 0) {
              ppyl.activity_status = 3;
              clearTimeout(this.ppylTimeout);
            } else {
              let duration = moment.duration(timeSpan, 'seconds');
              ppyl.timeout = [duration.days(), duration.hours(), duration.minutes(), duration.seconds()];
              this.tryTimeOut();
            }
          }
        }
        this.ppyl = ppyl;
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
    tryTimeOut() {
      if(this.ppylTimeout) clearTimeout(this.ppylTimeout);
      this.ppylTimeout = setTimeout(() => {
        this.tryTimeOut();
        this.timeOut();
      }, 1000)

    },
    timeOut() {
      let timeSpan = moment(this.ppyl.end_time).diff(moment(new Date()), 'seconds');
      if(timeSpan <= 0) {
        this.ppyl.activity_status = 3; 
        clearTimeout(this.ppylTimeout);
        return;
      }
      let duration = moment.duration(timeSpan, 'seconds');
      this.ppyl.timeout = [duration.days(), duration.hours(), duration.minutes(), duration.seconds()];
    },
    
    tryDrawColdDown() {
      if(this.drawTimeout) clearTimeout(this.drawTimeout);
      this.drawTimeout = setTimeout(() => {
        this.tryDrawColdDown();
        this.drawColdDowning();
      }, 1000);
    },
    drawColdDowning() {
      if(this.myPpyl.activity_status != 2) {
        if(this.drawTimeout) clearTimeout(this.drawTimeout);
      }
      let timeSpan = moment(this.myPpyl.draw_time).add(5, 'seconds').diff(moment(new Date()), 'seconds'); //多预5秒出来，服务器可能没法处理得那么快
      if(timeSpan <= 0) {
        if(this.myPpyl.draw_timeout) delete this.myPpyl.draw_timeout;
        clearTimeout(this.drawTimeout);
        this.getData(false);
        return;
      }
      let duration = moment.duration(timeSpan, 'seconds');
      this.myPpyl.draw_timeout = [duration.days(), duration.hours(), duration.minutes(), duration.seconds()];
      let draw_time_texts = [];
      if(duration.days() > 0) draw_time_texts.push(`${duration.days()}天`);
      if(duration.hours() > 0) draw_time_texts.push(`${duration.hours()}小时`);
      if(duration.minutes() > 0) draw_time_texts.push(`${duration.minutes()}分钟`);
      if(duration.seconds() > 0) draw_time_texts.push(`${duration.seconds()}秒`);
      this.myPpyl.draw_time_texts = draw_time_texts.join('');
    },

    // 自动参团
    toggleAutoPP(e) {
      this.autoPP = e.detail.value;
    },
    validAutoPp() {
      if(this.userInfo.c_vip_level != 1) {
        uni.showModal({
          title: '提示',
          content: '亲，开通CVIP可以智能托管，快去开通吧~',
          showCancel: false,
          success: res => {}
        })
      }
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
      uni.redirectTo({
        url: `/pages/product-detail/product-detail?sn=${this.ppyl.goods.goods_sn}`
      })
    },
    updateRecommandTabIndex(e) {
      let val = e.currentTarget.dataset.val;
      this.recommandTabIndex = val;
    },

    
    
    goToProduct(join = false) {
      // 带好信息去课程详情
      if(join) {
        let ppyl = JSON.parse(JSON.stringify(this.ppyl));
        if(this.userInfo.c_vip_level == 1) ppyl.autoPpyl = this.autoPP;
        uni.setStorageSync('ppyl', ppyl);
      }
      uni.redirectTo({
        url: `/pages/product-detail/product-detail?sn=${this.ppyl.goods.goods_sn}`
      })
    },
    toIndex() {
      uni.switchTab({
        url: `/pages/index/index`
      })
    },
    backToPrev() {
      uni.navigateBack();
    }
  }
  
}
</script>
<style lang="scss" scoped>
  @import 'ppyl-team.scss';
</style>