<template>
  <view>
    <block v-if="!pageDataLoading">
      <view class="bone-box">
        <image class="bone-img" src="/static/images/bone.png" mode="widthFix"></image>
      </view>
    </block>
    <block v-else>
      <view class="uni-common-pb-withbtn">
        <view class="swiper-wrapper">
          <swiper @transition="changIndex" class="swiper-box"
            :autoplay="!product.intro_video || product.intro_video === ''" circular @change="updateSwiperIndex">
            <swiper-item v-if="product.intro_video && product.intro_video !== ''">
              <!-- 视频 -->
              <view class="swiper-item">
                <video @touchstart="touchStart(product.intro_video)" @touchend="touchEnd" v-show="showVideo"
                  id="intro-video" class="swiper-video" :src="product.intro_video" show-center-play-btn show-play-btn
                  controls ref="VideoContext"></video>
                <view v-if="!showVideo" style="width: 100%;height: 100%;background-color: black;opacity: 0.6;"></view>
              </view>
            </swiper-item>
            <swiper-item v-for="(swiper, index) in product.goodsImages" :key="index" @tap="showGoodsImages(index)">
              <view class="swiper-item">
                <image class="swiper-img" :src="swiper.image_url" mode="widthFix" webp></image>
              </view>
            </swiper-item>
          </swiper>
          <view v-if="product.bannerLen && product.bannerLen > 0" class="swiper-index">
            <text class="swiper-index-active">{{ swiperIndex + 1 }}</text>/{{ product.bannerLen }}
          </view>
        </view>

        <block v-if="!sku.is_ppyl">
          <!-- 非拼拼，旧有商城样式 -->
          <view class="normal-val-box">
            <image class="normal-val-bg" src="/static/images/bg/bg_product_price.png"></image>
            <view class="normal-val-info">
              <view class="normal-val">
                <view v-if="isCrowdActivitySign" class="normal-val-sign crowd-activity-sign">积分</view>
                <view v-else class="normal-val-sign">￥</view>
                <view v-if="sku.is_pt && (aType == 2 || (aType != 1 && !sku.isPtLimit))" class="normal-val-text">
                  {{ sku.pt_original_price || '——' }}</view>
                <view v-else class="normal-val-text">{{ sku.member_price || '——' }}</view>
              </view>
              <view v-if="sku.pt_original_price != sku.market_price" class="normal-val normal-val-unactive">
                <template v-if="isCrowdActivitySign">
                  <text class="crowd-activity-sign">积分</text>{{ sku.market_price || "——" }}
                </template>
                <template v-else>￥{{ sku.market_price || "——" }}</template>
              </view>
            </view>
            <block>
              <view v-if="sku.is_pt && (aType == 2 || (aType != 1 && !sku.isPtLimit))" class="normal-base-info">
                <view>{{ sku.pt_activity_info.group_number }}人团</view>
              </view>

              <view v-else-if="sku.activity_info && sku.activity_info.limit_type == 1 && sku.timeout"
                class="limit-type-timeouts">
                <text>距结束</text>
                <text class="limit-type-timeout">{{ sku.timeout[0] }}</text>
                <text>天</text>
                <text class="limit-type-timeout">{{ sku.timeout[1] }}</text>
                <text>:</text>
                <text class="limit-type-timeout">{{ sku.timeout[2] }}</text>
                <text>:</text>
                <text class="limit-type-timeout highlight">{{ sku.timeout[3] }}</text>
              </view>
            </block>
          </view>
        </block>

        <block v-else>
          <!-- 拼拼 -->
          <view class="normal-val-box normal-ppyl-box">
            <image class="normal-val-bg" src="/static/images/bg/bg_ppyl_product_price.png"></image>
            <view class="normal-val-info">
              <view class="normal-val">
                <view class="normal-val-sign">￥</view>
                <view class="normal-val-text">{{ sku.ppyl_sale_price || '——' }}</view>
              </view>
              <view v-if="sku.ppyl_sale_price != sku.market_price" class="normal-val normal-val-unactive">
                ￥{{ sku.market_price || '——' }}
              </view>
            </view>
            <view v-if="sku.ppyl_activity_info.activity.style_type == 2" class="normal-ppyl-groupnumber">
              <view>{{ sku.ppyl_activity_info.activity.group_number }}人团</view>
            </view>
          </view>
        </block>

        <view class="product-name-info">
          <view class="product-base-info">
            <view class="product-base-price-infos">
              <view class="product-detail-name ellipsis-2">
                <image class="sku-tag-icon" v-if="product.tag_icon" :src="product.tag_icon" mode="heightFix"></image>
                {{ product.title || '——' }}
              </view>

              <view v-if="sku.is_ppyl" class="product-myppyl-infos">
                <view class="product-myppyl-info">
                  <text class="product-myppyl-time">已累计抢中 {{ sku.ppylCount || 0 }} 次</text>
                </view>
                <view v-if="sku.ppyl_reward_price" class="product-myppyl-info">
                  <text>拼团获广告奖不低于{{
                    sku.ppyl_reward_price || "0"
                  }}元</text>
                </view>
              </view>
            </view>
            <view class="product-ctrls-info">
              <view v-if="!sku.is_ppyl" class="product-share-copy-title" @tap="copyProductTitle">
                <view>复制标题</view>
                <image class="product-share-copy-title-icon" src="/static/images/product_copy_title.png"></image>
              </view>
              <view class="product-share-info" @tap="tryPoster">
                <view>分享</view>
                <image class="product-share-icon" src="/static/images/share.png"></image>
              </view>
            </view>
          </view>
        </view>
        <!-- 可领优惠券简介 -->
        <view v-if="validCoupons && validCoupons.length > 0" class="goods-coupons-infos">
          <view class="goods-coupons-list">
            <view v-for="(item, index) in validCoupons" class="goods-coupons-item" :key="index">
              <view class="goods-coupons-name">{{ item.t_name }}</view>
              <view class="goods-coupons-vals">{{ item.couponValContent }}</view>
            </view>
          </view>
          <view class="goods-coupon-ctrl" @tap="showCoupons = true">
            <view>领券</view>
            <image class="goods-coupon-arrow" src="/static/images/more_white.png"></image>
          </view>
        </view>


        <block v-if="product.status == 1">
          <view v-if="ppylTeams && ppylTeams.count > 0" class="collage-teams">
            <view class="collage-teams-total">
              <view class="collage-line"></view>
              <view class="collage-info">
                <view v-if="!ppylTeams.list || !ppylTeams.list.length || ppylTeams.list.length == 0"
                  class="collage-info-avatars">
                  <image class="collage-product-avatar-default" src="/static/images/joiner.png" mode="widthFix"></image>
                </view>
                <view v-else class="collage-info-avatars">
                  <image class="collage-info-avatar" :src="ppylTeams.list[0].user[0].avatarUrl"></image>
                  <image v-if="ppylTeams.list[0].user.length > 1" class="collage-info-avatar"
                    :src="ppylTeams.list[0].user[1].avatarUrl"></image>
                  <image v-else-if="ppylTeams.list.length > 1" class="collage-info-avatar"
                    :src="ppylTeams.list[1].user[0].avatarUrl"></image>
                </view>
                <view class="collage-info-number">等已拼团</view>
              </view>
              <view class="collage-line"></view>
            </view>
            <!-- <view v-for="(item, index) in ppylTeams.list" class="collage-team" :key="item.activity_sn" @tap="goToPpylDetail(index)">
              <image class="collage-creator-avatar" :src="item.user[0] ? item.user[0].avatarUrl : ''"></image>
              <view class="collage-creator-name">{{item.user[0] ? item.user[0].userName : ''}}</view>
              <view class="collage-team-info">
                <view class="collage-team-status">{{item.group_number}}人团，还差{{item.need}}人成团</view>
                <view class="collage-team-timeout">剩余 {{item.timeout[0] > 0 ? (item.timeout[0] + '天') : ''}} {{item.timeout[1]}}:{{item.timeout[2]}}</view>
              </view>
              <view class="collage-team-ctrl">去参团</view>
            </view> -->
          </view>
          <view v-else-if="collageTeams && collageTeams.count > 0" class="collage-teams">
            <view class="collage-teams-total">
              <view class="collage-line"></view>
              <view class="collage-info">
                <view class="collage-info-avatars">
                  <image class="collage-product-avatar-default" src="/static/images/joiner.png" mode="widthFix"></image>
                </view>
                <view class="collage-info-number">等已拼团</view>
              </view>
              <view class="collage-line"></view>
            </view>
            <view v-for="(item, index) in collageTeams.list" class="collage-team" :key="item.activity_sn"
              @tap="goToCollageDetail(index)">
              <image class="collage-creator-avatar" :src="item.user[0] ? item.user[0].avatarUrl : ''"></image>
              <view class="collage-creator-name">{{ item.user[0] ? item.user[0].userName : '' }}</view>
              <view class="collage-team-info">
                <view class="collage-team-status">{{ item.group_number }}人团，还差{{ item.need }}人成团</view>
                <view class="collage-team-timeout">剩余 {{ item.timeout[0] > 0 ? (item.timeout[0] + '天') : '' }}
                  {{ item.timeout[1] }}:{{ item.timeout[2] }}</view>
              </view>
              <view class="collage-team-ctrl">去参团</view>
            </view>
          </view>

        </block>

        <!-- 拼团开团参团限制 -->
        <view v-if="sku.is_pt && (aType == 2 || (aType != 1 && !sku.isPtLimit))" class="order-infos">
          <view class="order-info property-info">
            <view class="order-info-label">开团身份要求</view>
            <view class="order-info-label-field">{{ userTypeTexts[sku.pt_activity_info.start_user_type] }}</view>
          </view>
          <view class="order-info">
            <view class="order-info-label">参团身份要求</view>
            <view class="order-info-label-field">
              {{ userTypeTexts[sku.pt_activity_info.join_user_type] }}
            </view>
          </view>
        </view>

        <!-- 拼拼开团参团限制 -->
        <view v-if="sku.is_ppyl" class="order-infos">
          <view class="order-info property-info">
            <view class="order-info-label">开团身份要求</view>
            <view class="order-info-label-field">{{ userTypeTexts[sku.ppyl_activity_info.activity.start_user_type] }}
            </view>
          </view>
          <view class="order-info">
            <view class="order-info-label">参团身份要求</view>
            <view class="order-info-label-field">
              {{ userTypeTexts[sku.ppyl_activity_info.activity.join_user_type] }}
            </view>
          </view>
        </view>

        <view class="order-infos">
          <block>
            <view v-if="!ppyl" class="order-info property-info"
              @tap="showSkuCtrl(sku.is_pt && !sku.isPtLimit ? 'collage' : 'buy')">
              <view class="order-info-label">选择</view>
              <view v-if="product.path" class="order-info-label-field">{{ product.path }} ×{{ sku.select_num }}</view>
              <view v-if="!product.path" class="order-info-label-field">请选择规格数量</view>
              <image class="order-info-arrow" src="/static/images/more.png"></image>
            </view>
            <!-- 拼拼参团不然点开 -->
            <view v-else class="order-info property-info">
              <view class="order-info-label">选择</view>
              <view v-if="product.path" class="order-info-label-field">{{ product.path }} ×{{ sku.select_num }}</view>
            </view>
          </block>
          <block v-if="product.status == 1">
            <!-- 有效商品才会显示运费板块 -->
            <view class="order-info">
              <view class="order-info-label">运费</view>
              <view class="order-info-label-field">
                {{ sku.free_shipping == 1 ? '免费' : (sku.fare || '——') }}
              </view>
            </view>
            <view class="order-info" @tap="goToAddresses">
              <view class="order-info-label">配送至</view>
              <view v-if="address" class="order-info-label-field">{{ address.province }} {{ address.city }}</view>
              <view v-if="!address" class="order-info-label-field">请选择配送地址</view>
              <image class="order-info-arrow" src="/static/images/more.png"></image>
            </view>
          </block>
        </view>


        <!-- 口碑评论 -->
        <view v-if="reputationLen > 0" class="reputations">
          <view class="reputations-info">
            <view class="reputations-title">用户口碑<block v-if="reputationLen > 0">（{{ reputationLen }}）</block>
            </view>
            <view v-if="reputationLen > 0" class="reputations-arrow-item" @tap="goToReputation">
              <view class="reputations-arrow-text">查看更多</view>
              <image class="reputations-arrow" src="/static/images/more_lighten.png"></image>
            </view>
          </view>
          <view v-if="reputationLen > 0" class="reputation">
            <image class="reputation-avatar" :src="reputation.user_avatarUrl"></image>
            <view class="reputation-infos">
              <view class="reputation-name">{{ reputation.user_name }}</view>
              <view class="reputation-user-tag">{{ reputation.user_tag }}</view>
              <view class="reputation-content">
                <rich-text class="reputation-rich-content" :nodes="reputation.content"></rich-text>
              </view>
              <view class="reputation-images">
                <view v-for="(item, index) in reputation.images" class="reputation-image-box" :key="item.id">
                  <image class="reputation-image" :src="item.image_url" mode="aspectFill" webp lazy-load
                    @tap="showReputationImg(index)"></image>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="reputation-nodata">
            暂无相关口碑
          </view>
          <view :class="{ 'reputation-ctrls': true, 'reputation-nodata-ctrls': reputationLen == 0 }">
            <view v-if="product.user && product.user.reputation_user" class="reputation-ctrl" @tap="goToAddReputation">
              上传口碑</view>
          </view>

        </view>

        <!-- 产品详情 -->
        <view class="detail">
          <view v-if="product.goods_videos && product.goods_videos.length > 0" class="product-videos">
            <video @touchstart="touchStart(item.video)" @touchend="touchEnd" v-for="(item, index) in product.goods_videos"
              class="product-video" :src="item.video" show-center-play-btn show-play-btn controls :key="index"></video>
            <view v-if="!showVideo" style="
                width: 100%;
                height: 100%;
                background-color: black;
                opacity: 0.6;
              "></view>
          </view>
          <view v-if="product.params && product.params.length > 0" class="product-params">
            <view v-for="(item, index) in product.params" class="product-param" :key="index">
              <view class="product-param-title">{{ item.title }}</view>
              <view class="product-param-subgroups">
                <view v-for="(subgroup, subgroupIndex) in item.subgroups" class="product-param-subgroup"
                  :key="subgroupIndex">
                  <view class="product-param-subgroup-name">{{ subgroup.name }}</view>
                  <view class="product-param-subgroup-info">{{ subgroup.info }}</view>
                </view>
              </view>
            </view>
          </view>
          <mp-html :content="product.desc" :lazy-load="true" />
        </view>

        <view style="height: 80rpx"></view>


        <!-- 底部按钮 -->
        <view v-if="initSuccess" class="product-detail-btns">
          <block v-if="userInfo.uid">
            <!-- 购物车 -->
            <view class="bottom-column-btn" @tap="toIndex">
              <image class="bottom-column-btn-icon" src="/static/images/product_detail/index.png"></image>
              <view class="bottom-column-btn-text">首页</view>
            </view>
            <!-- 拼拼商品、寄售商品不允许加购物车 -->
            <view v-if="!ppyl && !sku.is_ppyl && !sku.is_crowd_funding" class="bottom-column-btn" @tap="goToShopcar">
              <image class="bottom-column-btn-icon" src="/static/images/product_detail/shopcar.png"></image>
              <view class="bottom-column-btn-text">购物车</view>
              <view v-if="shopcar.length > 0" class="bottom-column-corner">{{ shopcar.length > 99 ? '···' :
                shopcar.length }}</view>
            </view>
            <!-- 占位用 -->
            <view v-else class="bottom-column-btn"></view>

            <!-- 购买按钮组 -->
            <view class="product-detail-bottom-btns">
              <!-- 商品status： 1正常，2下架 -->
              <block v-if="product.status == 1">
                <block v-if="!product.noStock">
                  <!-- 非参团 -->
                  <block v-if="!collage && !ppyl">
                    <!-- 非拼团、寄售商品、专区商品 -->
                    <block v-if="!sku.is_pt && !sku.is_ppyl && !sku.is_crowd_funding">
                      <!-- 有效活动期内 -->
                      <block v-if="!sku.isLimit">
                        <view v-if="sku.order_type !== 3 && sku.attach_type == -1 && !sku.exist_exchange"
                          class="product-detail-btn" @tap="showSkuCtrl('shopcar')">
                          <view class="bottom-btn-text medium">加入购物车</view>
                        </view>
                        <view v-if="sku.order_type !== 3 || (sku.order_type === 3 && !sku.is_limit)"
                          class="product-detail-btn primary" @tap="showSkuCtrl('buy')">
                          <view class="bottom-btn-text medium">立即购买</view>
                        </view>
                        <view v-if="sku.order_type === 3 && sku.is_limit" class="product-detail-btn btn-disbled"
                          @tap="notAllowJoinProduct">
                          <view v-if="sku.is_limit == 'noLink'" class="bottom-btn-text medium">无上级或无分享人</view>
                          <view v-else class="bottom-btn-text medium">不符合活动要求</view>
                        </view>
                      </block>
                      <!-- 活动还没开始或者已失效 -->
                      <block v-else>
                        <view class="product-detail-btn btn-disbled" @tap="limitBuy">
                          <view v-if="sku.limitActivityType == 'nostart'" class="bottom-btn-text medium">
                            {{ sku.start_time }}开抢</view>
                          <view v-else class="bottom-btn-text medium">活动已结束</view>
                        </view>
                      </block>
                    </block>
                    <!-- 寄售商品 -->
                    <block v-else-if="sku.is_crowd_funding">
                      <!-- 有效活动期内 -->
                      <block v-if="!sku.isCrowdLimit">
                        <view class="product-detail-btn primary" @tap="showSkuCtrl('buy')">
                          <view class="bottom-btn-text medium">立即购买</view>
                        </view>
                      </block>
                      <!-- 活动还没开始或者已失效 -->
                      <block v-else>
                        <view class="product-detail-btn btn-disbled" @tap="limitCrowd">
                          <view v-if="sku.limitCrowdType == 'nostart'" class="bottom-btn-text medium">
                            {{ sku.crowd_start_time }}开抢</view>
                          <view v-else-if="sku.limitCrowdType == 'expire'" class="bottom-btn-text medium">限购时间已过</view>
                          <view v-else class="bottom-btn-text medium">不在有效时间内</view>
                        </view>
                      </block>

                    </block>

                    <!-- 集品严选商品 -->
                    <block v-else-if="sku.is_ppyl">
                      <block v-if="!sku.isPpylLimit">
                        <!-- <view class="product-detail-btn" @tap="selectPpylType('startPpyl')">
                          <view class="bottom-btn-text">一键开团</view>
                        </view> -->
                        <view class="product-detail-btn primary" @tap="selectPpylType('joinPpyl')">
                          <view class="bottom-btn-text">我要参团</view>
                        </view>
                      </block>
                      <!-- 拼团未开始或者已失效 -->
                      <view v-else class="product-detail-btn btn-disbled" @tap="limitPpyl">
                        <view v-if="sku.limitPpylType == 'nostart'" class="bottom-btn-text medium">
                          {{ sku.ppyl_start_time }}可开团</view>
                        <view v-else class="bottom-btn-text medium">拼团已失效</view>
                      </view>
                    </block>

                    <!-- 拼团商品 -->
                    <block v-else-if="sku.is_pt">
                      <!-- 不是拼团入口，且活动未开始 -->
                      <view v-if="(aType == 1 || (aType != 2 && sku.isPtLimit)) && sku.isLimit"
                        class="product-detail-btn btn-disbled" @tap="limitBuy">
                        <view v-if="sku.limitActivityType == 'nostart'" class="bottom-btn-text medium">
                          {{ sku.start_time }}开抢</view>
                        <view v-else class="bottom-btn-text medium">活动已结束</view>
                      </view>
                      <!-- 商品允许非活动价购买 -->
                      <block v-if="(aType == 1 || (aType != 2 && sku.isPtLimit)) && !sku.isLimit">
                        <view v-if="sku.order_type !== 3 && sku.attach_type == -1 && !sku.exist_exchange"
                          class="product-detail-btn" @tap="showSkuCtrl('shopcar')">
                          <view class="bottom-btn-text medium">加入购物车</view>
                        </view>
                        <view v-if="sku.order_type !== 3 || (sku.order_type === 3 && !sku.is_limit)"
                          class="product-detail-btn primary" @tap="showSkuCtrl('buy')">
                          <view class="bottom-btn-text medium">立即购买</view>
                        </view>
                        <view v-if="sku.order_type === 3 && sku.is_limit" class="product-detail-btn btn-disbled"
                          @tap="notAllowJoinProduct">
                          <view v-if="sku.is_limit == 'noLink'" class="bottom-btn-text medium">无上级或无分享人</view>
                          <view v-else class="bottom-btn-text medium">不符合活动要求</view>
                        </view>
                      </block>
                      <view v-if="(aType != 1 && !sku.isPtLimit) && !sku.isLimit && !sku.is_limit"
                        class="product-detail-btn" @tap="showSkuCtrl('buy')">
                        <view class="bottom-btn-val">￥{{ sku.member_price || '0.00' }}</view>
                        <view class="bottom-btn-text">单独购买</view>
                      </view>
                      <view v-if="aType != 1 && !sku.isPtLimit" class="product-detail-btn primary"
                        @tap="showSkuCtrl('collage')">
                        <view v-if="!product.user || !product.user.vip_level" class="bottom-btn-val">
                          ￥{{ sku.pt_original_price || '0.00' }}</view>
                        <view v-else class="bottom-btn-val">￥{{ sku.sale_price || '0.00' }}</view>
                        <view class="bottom-btn-text">发起拼团</view>
                      </view>
                      <!-- 拼团未开始或者已失效 -->
                      <view v-if="aType == 2 && sku.isPtLimit" class="product-detail-btn btn-disbled" @tap="limitPt">
                        <view v-if="sku.limitPtType == 'nostart'" class="bottom-btn-text medium">{{ sku.pt_start_time
                        }}可开团
                        </view>
                        <view v-else class="bottom-btn-text medium">拼团已失效</view>
                      </view>
                    </block>
                  </block>

                  <!-- 参团 -->
                  <block v-else>
                    <block v-if="sku.is_ppyl">
                      <block v-if="!sku.isPpylLimit">
                        <view class="product-detail-btn primary" @tap="joinPpylTeam">
                          <view class="bottom-btn-val">￥{{ sku.ppyl_original_price || '0.00' }}</view>
                          <view class="bottom-btn-text">立即参团</view>
                        </view>
                      </block>
                      <!-- 参团商品已过期 -->
                      <block v-else>
                        <view class="product-detail-btn btn-disbled" @tap="limitPpyl">
                          <view class="bottom-btn-text medium">拼团已失效</view>
                        </view>
                      </block>
                    </block>
                    <block v-else>
                      <block v-if="!sku.isPtLimit">
                        <view class="product-detail-btn primary" @tap="joinCollageTeams('collage')">
                          <view v-if="!product.user || !product.user.vip_level" class="bottom-btn-val">
                            ￥{{ sku.pt_original_price || '0.00' }}</view>
                          <view v-else class="bottom-btn-val">￥{{ sku.sale_price || '0.00' }}</view>
                          <view class="bottom-btn-text">立即参团</view>
                        </view>
                      </block>
                      <!-- 参团商品已过期 -->
                      <block v-else>
                        <view class="product-detail-btn btn-disbled" @tap="limitPt">
                          <view class="bottom-btn-text medium">拼团已失效</view>
                        </view>
                      </block>
                    </block>
                  </block>

                </block>

                <block v-else>
                  <view class="product-detail-btn btn-disbled">
                    <view class="bottom-btn-text medium">已售罄</view>
                  </view>
                </block>

              </block>
              <!-- 商品已失效下架 -->
              <block v-else>
                <view class="product-detail-btn btn-disbled" @tap="spuExpire">
                  <view class="bottom-btn-text medium">商品已下架</view>
                </view>
              </block>
            </view>
          </block>

          <!-- 未授权 -->
          <block v-if="!userInfo.uid">
            <view class="product-detail-bottom-btns">
              <view class="product-detail-btn primary" @tap="showSkuCtrl('shopcar')">
                <view class="bottom-btn-text medium">授权后可购买</view>
              </view>
            </view>
          </block>

        </view>

        <view v-show="showSku" class="sku-popup-box">
          <view class="popup-mask" @tap="hideSku"></view>
          <view v-if="sku" class="sku-popup-content">
            <view class="sku-info">
              <view class="sku-img-box">
                <image class="sku-img" :src="sku.image" mode="widthFix" webp @tap="showSkuDetailImage(sku.image)"></image>
              </view>
              <view class="sku-info-content">
                <!-- <view class="sku-title">{{sku.title}}</view> -->
                <view class="sku-title">　</view>
                <block v-if="!sku.is_ppyl">
                  <!-- 非集品严选，允许单独购买 -->
                  <!-- 非拼团或购物车的情况下，展示sale_price就可以了 -->
                  <view v-if="!sku.is_pt || showSkuType != 'collage'" class="sku-vals">
                    <!-- 赠送集品券/集品豆/健康豆专区，不显示￥ -->
                    <view class="sku-val-item sku-val-sale-item">
                      <view class="sku-val"><text v-if="isCrowdActivitySign"
                          class="crowd-activity-sign">积分</text><template v-else>￥</template><text class="val-family">{{
                            sku.sale_price || '0.00' }}</text></view>
                    </view>
                    <view class="sku-val-item sku-val-item-unactive">
                      <!-- <view class="sku-val-name">原价</view> -->
                      <view class="sku-val"><text v-if="isCrowdActivitySign"
                          class="crowd-activity-sign">积分</text><template v-else>￥</template><text class="val-family">{{
                            sku.market_price || '0.00' }}</text></view>
                    </view>
                  </view>
                  <view v-if="sku.is_pt && showSkuType == 'collage'" class="sku-vals">
                    <view class="sku-val-item sku-val-sale-item">
                      <view class="sku-val-name">拼团价</view>
                      <view class="sku-val">￥{{ sku.pt_sale_price || '0.00' }}</view>
                    </view>
                    <view class="sku-val-item sku-val-item-unactive">
                      <view class="sku-val">￥{{ sku.market_price || '0.00' }}</view>
                    </view>
                  </view>
                </block>
                <block v-else>
                  <!-- 拼拼没有单独购买 -->
                  <view class="sku-vals">
                    <view class="sku-val-item sku-val-sale-item">
                      <view class="sku-val-name">拼团价</view>
                      <view class="sku-val">￥{{ sku.ppyl_sale_price || '0.00' }}</view>
                    </view>
                    <view class="sku-val-item sku-val-item-unactive">
                      <view class="sku-val">￥{{ sku.market_price || '0.00' }}</view>
                    </view>
                  </view>
                </block>
                <!-- <view v-if="isCrowdActivitySign && sku.gift_number && sku.gift_number > 0" class="sku-selected">
                  赠送{{ giftTypeDict[sku.gift_type] }}: sku.gift_number
                </view> -->
                <view class="sku-selected">
                  <text>已选：</text>
                  <text class="sku-selected-attr">{{ sku.path }}</text>
                </view>
              </view>
              <!-- 关闭sku操作弹窗按钮 -->
              <view class="sku-close" @tap="hideSku">×</view>
            </view>
            <view class="sku-list">
              <view v-for="(skuItem, skuKey) in skuAttrs" class="sku-list-item" :key="skuKey">
                <view class="sku-title">{{ skuKey }}</view>
                <view class="sku-attr-list">
                  <view v-for="(attr, attrIndex) in skuItem" :class="{
                    'sku-attr-item': true,
                    'selected': skuAttrSelected.attr[skuKey] == attr,
                    'disabled': skuAllowSelected[skuKey].indexOf(attr) < 0
                  }" :key="attrIndex" @tap="updateAttr(skuKey, attr, skuAllowSelected[skuKey].indexOf(attr) >= 0)">
                    {{ attr }}</view>
                </view>
              </view>


              <view class="sku-number">
                <view class="sku-number-title">数量</view>
                <view v-if="!sku.is_ppyl && (showSkuType != 'collage' || !sku.is_pt)" class="sku-number-ctrls">
                  <view class="sku-number-ctrl" @tap="deleteSkuSelectNum">-</view>
                  <view class="sku-number-ctrl" @tap="tryShowEditNum">{{ sku.select_num }}</view>
                  <view class="sku-number-ctrl" @tap="addSkuSelectNum">+</view>
                </view>
                <view v-else class="sku-number-ctrls">
                  ×{{ sku.select_num }}
                </view>
              </view>

            </view>
            <view v-if="sku.is_ppyl" class="ppyl-auto-box">
              <view class="pply-auto-title">开启自动拼团</view>
              <view class="pply-auto-tips">CVIP专属</view>

              <view class="pply-auto-trigger-box">
                <switch class="pply-auto-trigger" :disabled="userInfo.c_vip_level != 1" :checked="autoPP"
                  @change="toggleAutoPP" @tap="validAutoPp" />
              </view>
            </view>

            <view class="confirm-btn-box">
              <block v-if="product.status == 1">

                <block v-if="!product.noStock">
                  <block v-if="!sku.is_pt && !sku.is_ppyl && !sku.is_crowd_funding">
                    <!-- 商品的库存大于0，可以下单购买 -->
                    <block v-if="sku.stock > 0">
                      <block v-if="!sku.isLimit">
                        <!-- 非团长礼包且不需要提供身份证明可以加购物车 -->
                        <view v-if="showSkuType == 'shopcar' && sku.order_type !== 3 && sku.attach_type == -1"
                          class="bottom-btn" @tap="confirmSkuInfo">
                          确定
                        </view>

                        <!-- 非团长礼包，有效的话就可以购买 -->
                        <view
                          v-if="showSkuType == 'buy' && (sku.order_type !== 3 || (sku.order_type === 3 && !sku.is_limit))"
                          class="bottom-btn" @tap="confirmSkuInfo">
                          下单
                        </view>
                        <!-- 团长礼包需要检查是不是需要有顶上人，符不符合上级要求 -->
                        <view v-if="sku.order_type === 3 && sku.is_limit" class="bottom-btn btn-disbled"
                          @tap="notAllowJoinProduct">
                          <block v-if="sku.is_limit == 'noLink'">无上级或无分享人</block>
                          <block v-else>不符合活动要求</block>
                        </view>
                        <!-- 这里是参团板块的sku有其他sku兄弟不参与拼团，允许直接购买 -->
                        <block v-if="showSkuType == 'collage'">
                          <view v-if="sku.order_type !== 3 || (sku.order_type === 3 && !sku.is_limit)" class="bottom-btn"
                            @tap="confirmSkuInfo('buy')">
                            非拼团商品，直接下单
                          </view>
                        </block>
                      </block>
                      <block v-else>
                        <view v-if="aType != 2" class="bottom-btn btn-disbled" @tap="limitBuy">
                          <block v-if="sku.limitActivityType == 'nostart'">{{ sku.start_time }}开始活动</block>
                          <block v-else>非活动时间</block>
                        </view>
                      </block>
                    </block>
                    <!-- 库存小于0，售罄了 -->
                    <block v-else>
                      <view class="bottom-btn btn-disbled">
                        该商品已售罄
                      </view>
                    </block>
                  </block>

                  <!-- 寄售商品 -->
                  <block v-else-if="sku.is_crowd_funding">
                    <!-- 商品的库存大于0，可以下单购买 -->
                    <block v-if="sku.stock > 0">
                      <block v-if="!sku.isCrowdLimit">
                        <!-- 正常状态 -->
                        <view class="bottom-btn" @tap="confirmSkuInfo">
                          下单
                        </view>
                      </block>
                      <block v-else>
                        <view class="bottom-btn btn-disbled" @tap="limitCrowd">
                          <block v-if="sku.limitCrowdType == 'nostart'">{{ sku.crowd_start_time }}开抢</block>
                          <block v-if="sku.limitCrowdType == 'expire'">限购时间已过</block>
                          <block v-else>不在有效时间内</block>
                        </view>
                      </block>

                    </block>
                    <!-- 库存小于0，售罄了 -->
                    <block v-else>
                      <view class="bottom-btn btn-disbled">
                        该商品已售罄
                      </view>
                    </block>
                  </block>

                  <!-- 拼拼商品 -->
                  <block v-else-if="sku.is_ppyl">
                    <!-- 商品的库存大于0，可以下单购买 -->
                    <block v-if="sku.stock > 0">
                      <block v-if="!sku.isPpylLimit">
                        <!-- 非参团可以直接发起拼团 -->
                        <view v-if="ppylCtrl == 'startPpyl'" class="bottom-btn" @tap="confirmSkuInfo">
                          马上开团
                        </view>
                        <view v-if="ppylCtrl == 'joinPpyl'" class="bottom-btn" @tap="confirmSkuInfo">
                          一键参团
                        </view>
                      </block>
                      <block v-else>
                        <view class="bottom-btn btn-disbled" @tap="limitPpyl">
                          <block v-if="sku.limitPpylType == 'nostart'">{{ sku.ppyl_start_time }}开拼</block>
                          <block v-else>非拼团时间</block>
                        </view>
                      </block>

                    </block>
                    <!-- 库存小于0，售罄了 -->
                    <block v-else>
                      <view class="bottom-btn btn-disbled">
                        该商品已售罄
                      </view>
                    </block>
                  </block>
                  <!-- 拼团商品 -->
                  <block v-else>
                    <!-- 商品的库存大于0，可以下单购买 -->
                    <block v-if="sku.stock > 0">
                      <block v-if="showSkuType == 'collage'">
                        <block v-if="!sku.isPtLimit">
                          <!-- 非参团可以直接发起拼团 -->
                          <view class="bottom-btn" @tap="confirmSkuInfo">
                            发起拼团
                          </view>
                        </block>
                        <block v-else>
                          <view class="bottom-btn btn-disbled" @tap="limitPt">
                            <block v-if="sku.limitPtType == 'nostart'">{{ sku.pt_start_time }}开拼</block>
                            <block v-else>非拼团时间</block>
                          </view>
                        </block>
                      </block>
                      <block v-else>
                        <block v-if="!sku.isLimit">
                          <view v-if="showSkuType == 'shopcar' && sku.order_type !== 3 && sku.attach_type == -1"
                            class="bottom-btn" @tap="confirmSkuInfo('shopcar')">
                            确定
                          </view>

                          <view
                            v-if="showSkuType == 'buy' && aType != 1 && sku.order_type !== 3 && sku.attach_type == -1 && !sku.exist_exchange"
                            class="bottom-btn border" @tap="confirmSkuInfo('shopcar')">
                            加入购物车
                          </view>
                          <!-- 单独购买 -->
                          <view
                            v-if="showSkuType == 'buy' && (sku.order_type !== 3 || (sku.order_type === 3 && !sku.is_limit))"
                            class="bottom-btn" @tap="confirmSkuInfo">
                            单独购买
                          </view>
                          <!-- 团长礼包需要检查是不是需要有顶上人，符不符合上级要求 -->
                          <view v-if="showSkuType == 'buy' && sku.order_type === 3 && sku.is_limit"
                            class="bottom-btn btn-disbled" @tap="notAllowJoinProduct">
                            <block v-if="sku.is_limit == 'noLink'">无上级或无分享人</block>
                            <block v-else>不符合活动要求</block>
                          </view>
                        </block>
                        <block v-else>
                          <view class="bottom-btn btn-disbled" @tap="limitBuy">
                            <block v-if="sku.limitActivityType == 'nostart'">{{ sku.start_time }}开始活动</block>
                            <block v-else>非活动时间</block>
                          </view>
                        </block>
                      </block>

                    </block>
                    <!-- 库存小于0，售罄了 -->
                    <block v-else>
                      <view class="bottom-btn btn-disbled">
                        该商品已售罄
                      </view>
                    </block>

                  </block>

                </block>
                <block v-else>
                  <view class="bottom-btn btn-disbled">
                    已售罄
                  </view>
                </block>

              </block>
              <block v-else>
                <view class="bottom-btn btn-disbled" @tap="spuExpire">
                  商品已下架
                </view>

              </block>


            </view>
          </view>
        </view>


        <!-- 优惠券 -->
        <view v-show="showCoupons" class="discount-popup">
          <view class="popup-mask" @tap="hideCoupons"></view>
          <view class="discounts">
            <view class="popup-title">优惠券</view>
            <view class="popup-close-icon" @tap="hideCoupons">×</view>
            <view class="discounts-content">
              <!-- take_auth 1可领 2不可领 -->
              <label v-for="(item, index) in coupons" :class="{ 'discount': true, 'disabled': item.take_auth != 1 }"
                :key="item.code" :data-index="index">
                <view class="discount-content">
                  <!-- 区分打折和定额 -->
                  <view v-if="item.type != 4" class="conpon-price-box">
                    <view class="coupon-price">
                      <text class="coupon-symbol">￥</text>
                      <text class="coupon-value">{{ item.used_amount }}</text>
                    </view>
                    <view v-if="item.with_amount > 0" class="coupon-price-limit-box">
                      满<text class="coupon-price-limit">{{ item.with_amount }}</text>可用
                    </view>
                  </view>
                  <view v-if="item.type == 4" class="conpon-price-box">
                    <view class="coupon-price">
                      <text class="coupon-value">{{ item.with_discount }}</text>
                      <text class="coupon-symbol">折</text>
                    </view>
                    <view class="coupon-discount-limit">
                      最高抵{{ item.used_amount || 0 }}
                    </view>
                    <view v-if="item.with_amount > 0" class="coupon-price-limit-box">
                      满<text class="coupon-price-limit">{{ item.with_amount }}</text>可用
                    </view>
                  </view>

                  <view class="coupon-info">
                    <view :class="{ 'coupon-name': true, 'coupon-name-with-tag': item.used == 10 }">
                      <view v-if="item.used == 10" class="coupon-tag-all">全品类</view>
                      {{ item.name }}
                    </view>
                    <view class="coupon-extra-info">
                      <view class="coupon-expire-time">{{ item.display_time }}</view>
                      <view class="coupon-get-btn" @tap="receiveCoupon(index)">点击领取</view>
                    </view>
                  </view>
                </view>

              </label>

            </view>
          </view>
        </view>

        <view v-if="handingSelectNumberVisible" class="edit-num-popup">
          <view class="edit-num-popup-mask"></view>
          <view class="edit-num-popup-content">
            <view class="edit-num-popup-title">填写数量</view>
            <view class="edit-num-input-box">
              <input class="edit-num-input" type="number" maxlength="6" placeholder="请输入" :value="handingSelectNumber"
                @input="updateHandingSelectNumber" @confirm="confirmHandingSelectNumber" />
            </view>
            <!-- <view class="edit-num-input-tips">剩余库存：{{sku.stock || 0}}</view> -->
            <view class="edit-num-popup-ctrls">
              <view class="edit-num-popup-ctrl" @tap="handingSelectNumberVisible = false">取消</view>
              <view class="edit-num-popup-ctrl primary" @tap="confirmHandingSelectNumber">确定</view>
            </view>
          </view>
        </view>

        <view class="poster-box">
          <canvas id="poster" canvas-id="poster" class="poster-canvas" type="2d"
            style="width: 750px; height: 1200px;"></canvas>
          <canvas id="poster-ios" canvas-id="poster-ios" class="poster-canvas"
            style="width: 750px; height: 1200px;"></canvas>
        </view>

        <view v-if="showPoster" class="poster-result-box">
          <view class="poster-result-mask"></view>
          <view class="poster-result-content">
            <view class="poster-img-box" :class="{ 'poster-img-box-sm': isShort }">
              <image class="poster-result-close" src="/static/images/product_poster_close.png" @tap="showPoster = false">
              </image>
              <image v-if="poster" class="poster-img" :src="poster" mode="widthFix"></image>
            </view>
            <view v-if="isMp" class="poster-ctrls">
              <button class="poster-ctrl" open-type="share">
                <image class="poster-ctrl-icon" src="/static/images/poster_wechat.png"></image>
                <view>微信</view>
              </button>
              <view class="poster-ctrl" @tap="saveImage">
                <image class="poster-ctrl-icon" src="/static/images/poster_download.png"></image>
                <view>保存图片</view>
              </view>
            </view>
          </view>
        </view>

        <view class="share-thumb-box">
          <canvas canvas-id="shareThumb" class="share-thumb-canvas" style="width: 750px; height: 600px;"></canvas>
        </view>


      </view>

      <gauss-blur ref="blur"></gauss-blur>

    </block>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyComponent"></privacy-popup>
    <!-- #endif -->
  </view>
</template>
<script>
import moment from 'moment';
import config from '@/config';
import h5Copy from '@/common/junyi-h5-copy.js';
import mpHtml from '@/components/mp-html/mp-html';
import gaussBlur from '@/components/gauss-blur/gauss-blur.vue';

export default {
  components: {
    mpHtml,
    gaussBlur
  },
  data() {
    return {
      pageDataLoading: false,  //是否是已经请求到关键信息了

      sn: null,
      aType: null,
      aId: null,
      fromJoin: false,

      autoPP: false,


      swiperIndex: 0,
      product: {},
      shopcar: [],
      reputation: {},
      reputationLen: 0,

      coupons: [],
      validCoupons: [],
      showCoupons: false,

      address: null,  //地址，现在启用邮费模板，需要以地址做支撑
      backFromAddresses: false,

      showSku: false,
      showSkuType: 'buy',

      detailImgs: [], //富文本版本下的全部图片地址

      collage: null,  //参团信息
      collageTeams: null, //当前在拼团的团队列表

      ppyl: null, //参加厂盟口信息
      ppylCtrl: 'joinPpyl',
      ppylTeams: null,  //当前在厂盟口的团队列表
      isCrowdActivitySign: false, // 是否从福利页面进入的福利订单

      userInfo: uni.getStorageSync('userInfo'),
      link_uid: uni.getStorageSync('link_uid'),
      userTypeTexts: {
        [1]: '全部成员',
        [2]: '新用户',
        [3]: '老用户'
      },
      statusTexts: {
        [1]: '正常',
        [2]: '已下架'
      },
      // 赠送数量字典
      giftTypeDict: {
        [1]: config.written.integralName,
        [2]: '健康豆',
        [3]: config.written.crowdBalanceName
      },

      shareThumb: '', //分享用图

      qrCode: null, //二维码
      productImg: null,
      blurImgBg: null,
      shareRadiusLeft: null,
      shareRadiusRight: null,
      canvas: null,
      poster: null, //海报图
      showPoster: false,
      couldSave: false, //是否可以保存
      isMp: false,
      isShort: false, //是否是长屏幕
      platform: 'ios',


      limitActivitySkus: [], //当前参与活动的sku（活动指入口活动）
      // limitActivityType: 'nostart', //当前活动过期还是未开始
      initSuccess: false,

      sku: {},  //当前匹配到的的sku
      skuItems: [], //sku项，用来遍历sku可能属性路径
      skuAttrs: {}, //sku的属性键值对 {sku属性名: sku属性值}
      skuResults: [], //属性对应sku的相关结果
      skuPerhapsPath: {}, //所有可用sku的的可能属性路径
      skuConnect: '，', //sku属性连接符，v3，不是逗号，用来拼接sku属性组合
      skuAttrSelected: [], //选中的sku信息，用来渲染页面sku属性高亮与否
      skuAttrValSelected: [], //选中的sku信息，用来判断处理相关选中与否的逻辑
      skuAllowSelected: [],  //允许选择的属性项，用来渲染页面sku属性可选与否

      handingSelectNumber: 0,
      handingSelectNumberVisible: false,

      readyNavigate: false,

      coldDownInterval: null, //倒计时

      showVideo: true,
      timer:''
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();

    if(!this.userInfo.uid) {
      shareInfo = {
        title: `美丽生活，点击开启`,
        desc:  `厂盟口`,
        // imageUrl: '/static/images/share.jpg',
        path: `/pages/index/index`
      }
      return shareInfo;
    } else {
      shareInfo.title = this.sku.title || '美丽生活，点击开启';
      shareInfo.desc = this.sku.title || '美丽生活，点击开启';
      shareInfo.imageUrl = this.shareThumb;
    }


    // 普通人能推普通人
    // if(this.sku.order_type == 3 && !this.userInfo.vip_level) {
    //   shareInfo = {
    //     title: `美丽生活，点击开启`,
    //     desc:  `厂盟口`,
    //     path: `/pages/index/index`
    //   }
    //   uni.showModal({
    //     title: '提示',
    //     content: '分享无效。您的身份不是VIP或其他代理人身份，他人将无法通过您分享出来的消息进入该礼包商品详情并与你创建关联关系。请注意',
    //     showCancel: false
    //   })
    // } else {
    //   if(!this.product || (this.product.isJoin && !uni.getStorageSync('userInfo').vip_level)) {
    //     shareInfo = {
    //       path: `/pages/index/index?link_uid=${uni.getStorageSync('userInfo').uid}`
    //     }
    //   } else {
    //     shareInfo.imageUrl = this.sku.image;
    //   }
    //   shareInfo.title = this.sku.title || '美丽生活，点击开启';
    //   shareInfo.desc = this.sku.title || '美丽生活，点击开启';
    //   shareInfo.imageUrl = this.shareThumb;
    // }
    return shareInfo;
  },
  onNavigationBarButtonTap(e) {
    let shareInfo = this.$getShareInfo();
    let path = this.$href
    if (!this.userInfo.uid) {
      path += `/pages/index/index`
    } else {
      path += shareInfo.path
    }
    console.log('path', path);
    uni.share({
      provider: "weixin",
      scene: "WXSceneSession",
      type: 0,
      href: path,
      success: function (res) {
        console.log("success:" + JSON.stringify(res));
      },
      fail: function (err) {
        console.log("fail:" + JSON.stringify(err));
      }
    });
  },
  onLoad(options){
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

    // 记录用户足迹
    let step = {
      entrance_type: uni.getStorageSync('scene') || '',
      type: 2,
      main_type: 1,
      enter_time: new Date().getTime(),
      goods_sn: options.sn
    }
    if(uni.getStorageSync('link_uid')) {
      step.entrance_link_user = uni.getStorageSync('link_uid');
    }
    this.$saveStep(step);


    this.isShort = uni.getStorageSync('systemInfo') ? uni.getStorageSync('systemInfo').isShort : false;
    // #ifdef MP-WEIXIN
    // 只有微信小程序分开手机系统渲染，因为有bug
    this.platform = uni.getStorageSync('systemInfo') ? uni.getStorageSync('systemInfo').platform : 'ios';
    // #endif
    // #ifndef MP-WEIXIN
    // 不是微信的都按ios方案处理，webgl方案
    this.platform = 'ios';
    // #endif

    if(uni.getStorageSync('collage')) {
      // 是参团
      this.collage = uni.getStorageSync('collage');
      uni.removeStorageSync('collage'); //一次性，进来后参团信息失效
    }
    if(uni.getStorageSync('ppyl')) {
      // 是参团
      this.ppyl = uni.getStorageSync('ppyl');
      if(this.ppyl.autoPpyl) this.autoPP = this.ppyl.autoPpyl;
      uni.removeStorageSync('ppyl'); //一次性，进来后参拼拼信息失效
    }

    // 将处理函数放进异步，防止onload两次
    setTimeout(() => {
      // #ifdef H5
      let isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
      if(!isiOS) {
        if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
          this.$jwx.initJssdk(data => {
            this.$jwx.hideMenu();
          })
        }
      }
      // #endif
      this.sn = options.sn;
      this.aType = options.aType || null;
      this.aId = options.aId || null;
      this.fromJoin = options.fromJoin || false;
      // 现在需要先拿到地址再去请求了
      if(this.userInfo.uid) {
        this.getAddress(() => {
          this.getData();
        })
      } else {
        this.getData();
      }
      this.getReputation();
    }, 20);
    this.getUserTypes();

    // 是否是小程序环境
    // #ifdef MP
    this.isMp = true;
    // #endif
  },
  onShow() {
    // 进来这个页面就清理掉就有的预订单缓存
    uni.removeStorageSync('preOrder');
    this.getShopcar();

    let userInfo = uni.getStorageSync('userInfo');
    if(userInfo.change) {
      this.getData();
      userInfo.change = false;
      uni.setStorageSync('userInfo', userInfo);
    }
    if(this.backFromAddresses) {
      this.backFromAddresses = false;
      setTimeout(() => {
        if(uni.getStorageSync('address')) {
          this.address = uni.getStorageSync('address');
          uni.removeStorageSync('address');
        }
        if(!this.address) {
          return uni.showModal({
            title: '提示',
            content: '您暂未添加收货地址，因不同地区可能存在不同的运费情况，需要您填写完地址再进行购买操作哦',
            confirmText: '前往填写',
            success: res => {
              if(res.confirm) {
                uni.setStorageSync('FromProductAsk', true);
                this.backFromAddresses = true;
                uni.navigateTo({
                  url: '/pages/addresses/addresses?type=select'
                })
              }
            }
          })
        }
        this.getData();
      }, 10)
    }

    if(this.sku.activity_info && this.sku.activity_info.limit_type == 1) {
      this.tryColdDown();
    }
  },
  onUnload() {
    if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
  },
  methods: {
    changIndex(){
      clearTimeout(this.timer)
    },
    touchStart(url) {
      this.timer = setTimeout(() => {
        // 长按触发的逻辑
        uni.showModal({
          title: '温馨提示',
          content: '是否下载视频',
          showCancel: true,
          success: ({ confirm, cancel }) => {
            if(confirm){
              this.videoLongTap(url)
            }
          }
        })
      }, 1200); // 自定义的触发时间，单位为毫秒
    },
    touchEnd() {
      clearTimeout(this.timer);
    },
    swiperItemChange(){
      clearTimeout(this.timer);
    },
    videoLongTap(url) {
      this.showVideo = false;
      // #ifdef MP-WEIXIN
      this.download(url);
      // #endif

      // H5
      // #ifdef H5
      // 判断当前是什么环境的浏览器
      // 这是在微信环境中
      if (this.$jwx && this.$jwx.isWechat()) {
        uni.showModal({
          title: "温馨提示",
          content:
            "当前客户端环境不支持下载视频，请复制视频链接在浏览器中预览下载",
          showCancel: true,
          confirmText: "复制地址",
          success: ({ confirm, cancel }) => {
            if (confirm) {
              this.showVideo = true;
              let title = url;
              // #ifdef H5
              let content = title; // 复制内容，必须字符串，数字需要转换为字符串
              const result = h5Copy(content);
              if (result === true) {
                uni.showToast({
                  title: "复制视频地址成功",
                });
              } else {
                uni.showToast({
                  title: "复制失败",
                  icon: "none",
                });
              }
              //  #endif
              // #ifndef H5
              uni.setClipboardData({
                data: title,
                success: (res) => {
                  uni.showToast({
                    title: "复制视频地址成功",
                  });
                },
                fail: (err) => {
                  uni.showToast({
                    title: "复制失败",
                    icon: "none",
                  });
                },
              });
              // #endif
            }
            if (cancel) {
              this.showVideo = true;
            }
          },
        });
      } else {
        // 这是在普通浏览器环境中
        uni.showModal({
          title: "温馨提示",
          content: "是否下载视频",
          showCancel: true,
          success: ({ confirm, cancel }) => {
            if (confirm) {
              this.showVideo = true;
              uni.downloadFile({
                url: url, //仅为示例，并非真实的资源
                success: (res) => {
                  console.log(res);
                  if (res.statusCode === 200) {
                    uni.showToast({
                      title: '下载成功',
                      icon: 'success',
                      mask: true
                    })
                    var oA = document.createElement("a");
                    oA.download = this.product.title; // 设置下载的文件名，默认是'下载'
                    oA.href = res.tempFilePath; //临时路径再保存到本地
                    document.body.appendChild(oA);
                    oA.click();
                    oA.remove(); // 下载之后把创建的元素删除
                  }
                },
              });
            }
            if (cancel) {
              this.showVideo = true;
            }
          },
        });
      }
      // #endif
    },
    async download(url) {
      await uni.showLoading({
        title: "下载中",
      });
      // 1.将远程文件下载到小程序的内存中,tempFilePath
      const result1 = await uni.downloadFile({ url });
      const { tempFilePath } = result1[1];
      // 2.将小程序内存中的临时文件下载到本地上
      const result2 = await uni.saveVideoToPhotosAlbum({
        // uni.saveVideoToPhotosAlbum()
        filePath: tempFilePath,
      });
      // 3.提示用户下载成功
      uni.hideLoading();
      await uni.showToast({
        title: "下载成功",
      });
      this.showVideo=true;
    },
    getAddress(handler) {
      if(!this.userInfo.uid) return;
      // 如果本次小程序周期内缓存触发器已经触发，存有相关缓存，那么就不请求对应接口数据而直接使用缓存数据
      let storageTrigger = uni.getStorageSync('storageTrigger');
      let addresses = uni.getStorageSync('addresses');
      if(storageTrigger && storageTrigger.address && addresses && addresses.length > 0) {
        for(let i = 0; i < addresses.length; i++) {
          if(addresses[i].is_default == 1) this.address = addresses[i];
        }
        if(!this.address) this.address = addresses[0];
        if(handler && typeof handler == 'function') handler();
        return;
      }

      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$sget('/address/list', params, res => {
        let addresses = res.data;

        uni.setStorageSync('addresses', addresses);
        // 更新缓存触发器
        let currentStorageTrigger = uni.getStorageSync('storageTrigger'); //重新获取缓存触发器，避免其他接口进行操作时缓存数据相互覆盖
        currentStorageTrigger.address = true;
        uni.setStorageSync('storageTrigger', currentStorageTrigger);

        for(let i = 0; i < addresses.length; i++) {
          if(addresses[i].is_default == 1) this.address = addresses[i];
        }
        if(!this.address) this.address = addresses[0];
        if(handler && typeof handler == 'function') handler();
      })
    },
    getData: function() {
      let params = {
        uid: uni.getStorageSync('userInfo') && uni.getStorageSync('userInfo').uid ? uni.getStorageSync('userInfo').uid : null,
        goods_sn: this.sn
      }
      if(this.address) params.city = this.address.city_code;
      if(this.aType) params.activity_type = this.aType;
      if(this.aId) params.activity_id = this.aId;
      if(this.aType) params.getReadyInfo = 1;

      this.$sget('/goods/info', params, res => {

        this.product = res.data;
        if(this.product.user && this.product.user.link_superior_user) this.link_uid = this.product.user.link_superior_user;

        // 特别处理该页的分享初始化
        // #ifdef H5
        if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
          let url = window.location.origin;
          let link = encodeURIComponent(`/pages/product-detail/product-detail?sn=${this.sn}`)
          this.$jwx.initShare({
            title: `${this.product.title}`,
            desc: this.product.desc,
            link: `${url}?redirect=${link}`,
            params: true
          });
        }
        // #endif

        if(!this.product || this.product.length == 0) {
          setTimeout(() => {
            uni.showToast({
              title: '商品过期不存在',
              icon: 'none',
              mask: true
            })
          }, 50)

          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
          return;
        }

        let bannerLen = 0;
        if(this.product.goodsImages && this.product.goodsImages.length > 0) bannerLen += this.product.goodsImages.length;
        if(this.product.intro_video && this.product.intro_video != '') bannerLen += 1;
        this.product.bannerLen = bannerLen;


        if(this.product.params) this.product.params = JSON.parse(this.product.params) || [];

        if(this.userInfo.uid) this.getGoodsCoupons();

        let isCrowdActivitySign = false // 赠送集品券/集品豆/健康豆专区
        if(this.product.shopSku) {
          for(let i = 0; i < this.product.shopSku.length; i++) {
            this.product.shopSku[i].attr = this.product.shopSku[i].specs;
            if(this.product.shopSku[i].activity_info && this.product.shopSku[i].activity_info.a_type == 2) {
              // 团长大礼包
              this.product.isJoin = true;
            }
            if (this.product.shopSku[i].crowd_activity_sign) {
              // 商品详情不能直接使用gift_type来判断是否福利订单，存在一个商品，及时福利商品也是普通商品，这里无法判断，要用crowd_activity_sign
              isCrowdActivitySign = true // -1-不赠送 1-集品豆 2-健康豆 3-集品券
            }
            if (this.product.shopSku[i].activity_info && [7].includes(Number(this.product.shopSku[i].activity_info.allow_pay_type))) {
              // 集品豆专区
              isCrowdActivitySign = true;
            }
          }
        }
        this.isCrowdActivitySign = isCrowdActivitySign

        this.pageDataLoading = true;

        this.calcSkuItems();
        this.calcSkuAllPath();
        this.updateSkuSelected();
        this.sku = JSON.parse(JSON.stringify(this.skuResults[0]));
        this.initSuccess = true;

        if(!this.sku.is_ppyl) {
          if(this.product.status == 1) {
            if(this.sku.pt_activity_sign && !this.collage) {
              this.getCollageList();
            } else if(this.sku.activity_info && this.sku.activity_info.limit_type == 1) {
              if(!this.sku.limitActivityType) {
                this.coldDowning();
                this.tryColdDown();
              }
            }
          }
        } else {
          // 拼拼与其他活动、拼团互斥
          if(this.product.status == 1 && this.sku.ppyl_activity_sign && !this.ppyl) this.getPpylList();
        }

        //拿一下sku的信息做信息展示用
        this.product.sale_price = this.sku.sale_price;
        this.product.member_price = this.sku.member_price;
        this.product.market_price = this.sku.market_price;
        this.product.path = this.sku.path;

        // 对详情信息进行替换、筛选操作
        let desc = this.product.desc;
        if(desc && desc !== '') {
          let imgReg = /<img.*?(?:>|\/>)/gi;
          let srcReg = /src=['"]?([^'"]*)['"]?/i;
          let imgs = desc.match(imgReg), detailImgs = [];
          if(!imgs) return;
          for (let i = 0; i < imgs.length; i++) {
            let src = imgs[i].match(srcReg);
            detailImgs.push(src[1]);
          }
          this.detailImgs = detailImgs;
          this.product.desc = this.product.desc.replace(/(<img[\s\S]+?)/ig, '<img style="display: block; margin: 0; padding: 0; width:100%; font-size: 0;"');  //正则给图片加样式
        }


        this.tryCreateShareThumb();

      }, err => {
        console.log(err);
      })
    },

    getShopcar() {
      if(!this.userInfo.uid) return;
      // 如果本次小程序周期内缓存触发器已经触发，存有相关缓存，那么就不请求对应接口数据而直接使用缓存数据
      let storageTrigger = uni.getStorageSync('storageTrigger');
      let shopcar = uni.getStorageSync('shopcar');
      if(storageTrigger && storageTrigger.shopcar) {
        this.shopcar = shopcar || [];
        return;
      }

      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$sget('/shopCart/list', params, res => {
        this.shopcar = res.data || [];

        uni.setStorageSync('shopcar', this.shopcar);
        // 更新缓存触发器
        let currentStorageTrigger = uni.getStorageSync('storageTrigger'); //重新获取缓存触发器，避免其他接口进行操作时缓存数据相互覆盖
        currentStorageTrigger.shopcar = true;
        uni.setStorageSync('storageTrigger', currentStorageTrigger);
      })
    },
    getGoodsCoupons() {
      let params = {
        goods_sn: this.product.goods_sn,
        category_code: this.product.category_code,
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$sget('/coupon/goods', params, res => {
        let coupons = res.data;
        let sortCoupons = [[], []]; //第一个数组作为可领券，第二个数组不可领

        for(let i = 0; i < coupons.length; i++) {
          let item = coupons[i];
          let display_time = moment(item.end_time).diff(new Date(), 'days');
          if(display_time > 7) {
            coupons[i].display_time = `过期：${moment(item.end_time).format('YYYY.MM.DD HH:mm')}`
          } else if(display_time >= 1) {
            coupons[i].display_time = `${display_time}天后过期`
          } else {
            coupons[i].display_time = `${ moment(item.end_time).diff(new Date(), 'hours')}小时后过期`
          }
          coupons[i].valid_start_time_sample = moment(item.valid_start_time).format('YYYY.MM.DD');
          coupons[i].valid_end_time_sample = moment(item.valid_end_time).format('YYYY.MM.DD');
          coupons[i].valid_start_time = moment(item.valid_start_time).format('YYYY.MM.DD HH:mm');
          coupons[i].valid_end_time = moment(item.valid_end_time).format('YYYY.MM.DD HH:mm');

          if(item.type == 4) {
            coupons[i].with_discount = parseFloat(item.with_discount) * 1000 / 100 || 10;
            coupons[i].used_amount = parseFloat(item.used_amount) || 0;
            coupons[i].couponValContent = `${item.with_discount}折`;
          } else if(item.type != 4) {
            coupons[i].used_amount = parseFloat(item.used_amount) || 0;
            coupons[i].couponValContent = `￥${parseFloat(item.used_amount)}`;
          }
          if(coupons[i].take_auth == 1) {
            this.validCoupons.push(coupons[i]);
            sortCoupons[0].push(coupons[i]);
          } else {
            sortCoupons[1].push(coupons[i]);
          }
        }
        let confirmCoupons = [];
        confirmCoupons.push(...sortCoupons[0]);
        confirmCoupons.push(...sortCoupons[1]);
        this.coupons = confirmCoupons;
      })
    },
    getReputation() {
      let params = {
        page: 1,
        goods_sn: this.sn
      }
      this.$sget('/goods/reputation', params, res => {
        let data = res.data.list || [];
        if(data && data.length > 0) {
          this.reputationLen = res.data.total || 0;
          this.reputation = data[0];

          this.reputation.content = this.reputation.content.replace(/\n/g,"<br/>");
        }
      })

    },
    getCollageList() {
      let params = {
        activity_code: this.sku.pt_activity_sign,
        goods_sn: this.product.goods_sn
      }
      this.$sget('/pt/goodsPtList', params, res => {
        let collageTeams = res.data;
        for(let i = 0; i < collageTeams.list.length; i++) {
          collageTeams.list[i].need = collageTeams.list[i].group_number - collageTeams.list[i].user.length;
          if(collageTeams.list[i].activity_status == 1) {
            let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
            let timeSpan = moment(collageTeams.list[i].end_time).diff(moment(date), 'seconds');
            let duration = moment.duration(timeSpan, 'seconds');
            if( timeSpan < 0) {
              collageTeams.list[i].activity_status = 3;  //检查是不是超时了，超时改状态避免后台定时任务有时候有问题
            } else {
              collageTeams.list[i].timeout = [
                duration.days(),
                duration.hours() < 10 ? ('0' + duration.hours()) : duration.hours(),
                duration.minutes() < 10 ? ('0' + duration.minutes()) : duration.minutes()
              ];
            }
          }
        }
        this.collageTeams = collageTeams;
      })
    },
    getPpylList() {
      let params = {
        activity_code: this.sku.ppyl_activity_sign,
        area_code: this.sku.ppyl_activity_info.area.area_code,
        goods_sn: this.product.goods_sn
      }
      this.$sget('/ppyl/goodsPpylList', params, res => {
        let ppylTeams = res.data;
        this.sku.ppylCount = ppylTeams.count || 0;
        for(let i = 0; i < ppylTeams.list.length; i++) {
          ppylTeams.list[i].need = ppylTeams.list[i].group_number - ppylTeams.list[i].user.length;
          if(ppylTeams.list[i].activity_status == 1) {
            let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
            let timeSpan = moment(ppylTeams.list[i].end_time).diff(moment(date), 'seconds');
            let duration = moment.duration(timeSpan, 'seconds');
            if( timeSpan < 0) {
              ppylTeams.list[i].activity_status = 3;  //检查是不是超时了，超时改状态避免后台定时任务有时候有问题
            } else {
              ppylTeams.list[i].timeout = [
                duration.days(),
                duration.hours() < 10 ? ('0' + duration.hours()) : duration.hours(),
                duration.minutes() < 10 ? ('0' + duration.minutes()) : duration.minutes()
              ];
            }
          }
        }
        this.ppylTeams = ppylTeams;
      })
    },
    getUserTypes() {
      // 如果本次小程序周期内缓存触发器已经触发，存有相关缓存，那么就不请求对应接口数据而直接使用缓存数据
      let storageTrigger = uni.getStorageSync('storageTrigger');
      let userTypes = uni.getStorageSync('userTypes');
      if(storageTrigger && storageTrigger.userType && userTypes && userTypes.length > 0) {
        let userTypeTexts = {};
        for(let i = 0; i < userTypes.length; i++) {
          userTypeTexts[userTypes[i].u_type] = userTypes[i].u_name;
        }
        this.userTypeTexts = userTypeTexts;
        return;
      }

      this.$sget('/home/userTypeList', null, res => {
        let userTypes = res.data;

        uni.setStorageSync('userTypes', userTypes); //缓存角色身份数据
        // 更新缓存触发器
        let currentStorageTrigger = uni.getStorageSync('storageTrigger'); //重新获取缓存触发器，避免其他接口进行操作时缓存数据相互覆盖
        currentStorageTrigger.userType = true;
        uni.setStorageSync('storageTrigger', currentStorageTrigger);

        let userTypeTexts = {};
        for(let i = 0; i < userTypes.length; i++) {
          userTypeTexts[userTypes[i].u_type] = userTypes[i].u_name;
        }
        this.userTypeTexts = userTypeTexts;

      })
    },

    tryColdDown() {
      if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
      this.coldDownInterval = setTimeout(() => {
        this.coldDowning();
        this.tryColdDown();
      }, 1000)
    },
    coldDowning() {
      let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
      let sku = this.sku;
      if(sku.limitActivityType == 'expire' && this.coldDownInterval) {
        clearTimeout(this.coldDownInterval);  //过期不倒计时
      }
      let timeSpan = 0;
      timeSpan = moment(sku.end_time).diff(moment(date), 'seconds');
      let duration = moment.duration(timeSpan, 'seconds');
      if(duration <= 0) {
        this.sku.timeout = null;
        this.sku.isLimit = true;
        this.sku.limitActivityType = 'expire';
        clearTimeout(this.coldDownInterval);  //过期不倒计时
        return;
      }
      let timeout = [];
      timeout.push(duration.days() >= 10 ? duration.days() : `0${duration.days()}`);
      timeout.push(duration.hours() >= 10 ? duration.hours() : `0${duration.hours()}`);
      timeout.push(duration.minutes() >= 10 ? duration.minutes() : `0${duration.minutes()}`);
      timeout.push(duration.seconds() >= 10 ? duration.seconds() : `0${duration.seconds()}`);
      this.sku.timeout = timeout;
    },

    copyProductTitle() {
      let title = this.product.title;
      // #ifdef H5
      let content = title; // 复制内容，必须字符串，数字需要转换为字符串
      const result = h5Copy(content);
      if (result === true) {
        uni.showToast({
          title:'复制标题成功',
        })
      } else {
        uni.showToast({
          title:'复制失败',
          icon:'none'
        })
      }
      //  #endif
      // #ifndef H5
      uni.setClipboardData({
        data: title,
        success: res => {
          uni.showToast({
            title:'复制标题成功',
          })
        },
        fail: err => {
          uni.showToast({
          title:'复制失败',
          icon:'none'
        })
        }
      })
      // #endif
    },

    previewImages() {
      if(!this.detailImgs || this.detailImgs.length == 0) return;
      uni.previewImage({
        urls: this.detailImgs,
        fail: err => {
          console.log(err);
        }
      });
    },
    showSkuDetailImage(img) {
      let imgs = [];
      for(let i = 0; i < this.product.shopSku.length; i++) {
        if(!imgs.includes(this.product.shopSku[i].image)) imgs.push(this.product.shopSku[i].image);
      }
      uni.previewImage({
        urls: imgs,
        current: img,
        fail: err => {
          console.log(err);
        }
      });
    },
    showReputationImg(index) {
      let urls = [];
      for(let i = 0; i < this.reputation.images.length; i++) {
        urls.push(this.reputation.images[i].image_url);
      }
      uni.previewImage({
        urls: urls,
        current: this.reputation.images[index].image_url,
        fail: err => {
          console.log(err);
        }
      });
    },


    notAllowJoinProduct() {
      return uni.showToast({
        title: '未符合购买条件',
        mask: true,
        icon: 'none'
      })
    },

    selectPpylType(type) {
      this.ppylCtrl = type;
      this.sku.select_num = 1;
      this.showSkuCtrl('buy');
    },

    showSkuCtrl(showSkuType) {

      this.validTourist(() => {
        // 缓存打开来源： 购物车或者直接购买
        this.showSkuType = showSkuType || 'buy';
        if(this.showSkuType == 'collage') {
          this.sku.select_num = 1;  //如果是走拼团或拼拼，重置选中数量。因为拼团数量只能为1
        }
        this.showSku = true;
      }, () => {
        uni.setStorageSync('authOriginPage', {
          type: 'navigateTo',
          page: `/pages/product-detail/product-detail?sn=${this.sn}`,
        });
      })
    },
    hideSku() {
      // 关闭弹窗
      this.showSku = false;
      if(!this.sku.is_ppyl) {
        if(this.sku.pt_activity_sign && !this.collage) {
          this.getCollageList();
        } else {
          this.collageTeams = null;
        }
      } else {
        // 拼拼。 拼拼与其他活动、拼团互斥
        if(this.sku.ppyl_activity_sign && !this.ppyl) {
          this.getPpylList();
        } else {
          this.ppylTeams = null;
        }
      }
    },


    receiveCoupon(index) {
      let code = this.coupons[index].code;
      let params = {
        code: code,
        uid: uni.getStorageSync('userInfo').uid,
        take_number: 1
      }
      this.$post('/coupon/receive', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '领取成功',
            mask: true,
            duration: 1000
          })
          setTimeout(() => {
            this.coupons[index].take_auth = 2;  //直接就不让领了算啦
          }, 1200)
        }, this.$toastDelay)

      })
    },
    hideCoupons() {
      this.showCoupons = false;
    },

    // sku相关操作开始
    calcSkuItems() {
      let skus = this.product.shopSku;
      let skuAttrs = {};
      let skuItems = [];
      let skuResults = [];
      let stock = 0;  //spu总sku库存数
      for(let i = 0; i < skus.length; i++) {
        skus[i].attr = JSON.parse(skus[i].attr);  //将存储起来的属性格式化

        // 计算每个属性的键与值群，用来渲染规格列表
        let skuKey = Object.keys(skus[i].attr);
        let skuVal = Object.values(skus[i].attr);
        for(let j = 0; j < skuKey.length; j++) {
          if(!skuAttrs[skuKey[j]]) {
            // 属性键还不存在，新建一个键
            skuAttrs[skuKey[j]] = [];
            skuAttrs[skuKey[j]].push(skuVal[j]);
          } else {
            // 键已存在，判断值存在与否，若未存在，加入对应键值对中
            if(!skuAttrs[skuKey[j]].includes(skuVal[j])) skuAttrs[skuKey[j]].push(skuVal[j]);
          }
        }

        // 计算sku结果列表，包含规格与对应id与其他信息
        let result = JSON.parse(JSON.stringify(skus[i].attr));
        result.sku_sn = skus[i].sku_sn;
        result.title = skus[i].title;
        result.image = skus[i].image;
        result.path = skuVal.join(this.skuConnect);
        result.sale_price = skus[i].sale_price;
        result.member_price = skus[i].member_price;
        result.market_price = skus[i].market_price;
        result.stock = skus[i].stock;
        result.free_shipping = skus[i].free_shipping;
        result.fare = skus[i].fare;
        result.attach_type = skus[i].attach_type;
        result.select_num = 1;

        stock += result.stock;  //统计sku的总库存

        result.exist_exchange = skus[i].exist_exchange || false;  //是不是参与了赠送健康豆


        // 在此处兼容商品是否参加活动
        result.exist_activity = skus[i].exist_activity;
        result.activity_info = skus[i].activity_info;
        // 兼容拼团
        result.is_pt = skus[i].pt_activity_info ? skus[i].pt_activity_info.activity_code : null;
        if(result.is_pt) {
          result.pt_sale_price = skus[i].pt_sale_price;
          result.pt_original_price = skus[i].pt_original_price || skus[i].pt_sale_price;
          result.pt_activity_sign = skus[i].pt_activity_sign;
          result.pt_activity_info = skus[i].pt_activity_info;
        }
        // 兼容拼拼
        result.is_ppyl = null;
        if(skus[i].ppyl_activity_info && skus[i].ppyl_activity_info.activity) {
          result.is_ppyl = skus[i].ppyl_activity_info.activity.activity_code;
        }
        if(result.is_ppyl) {
          result.ppyl_sale_price = skus[i].ppyl_sale_price;
          result.ppyl_reward_price = skus[i].ppyl_reward_price;
          result.ppyl_original_price = skus[i].ppyl_original_price || skus[i].ppyl_sale_price;
          result.ppyl_activity_sign = skus[i].ppyl_activity_sign;
          result.ppyl_activity_info = skus[i].ppyl_activity_info;
        }

        // 兼容寄售
        result.is_crowd_funding = null;
        if(skus[i].crowd_activity_info && skus[i].crowd_activity_info.activity_code) {
          result.is_crowd_funding = skus[i].crowd_activity_info.activity_code;
        }
        if(result.is_crowd_funding) {
          result.crowd_activity_sign = skus[i].crowd_activity_sign;
          result.crowd_round_number = skus[i].crowd_round_number;
          result.crowd_period_number = skus[i].crowd_period_number;
          result.crowd_activity_info = skus[i].crowd_activity_info;
        }



        // 如果存在活动，
        if(result.exist_activity) {

          // 检查是不是团长礼包
          if(skus[i].activity_info.a_type == 2) {
            result.order_type = 3; //团长升级单
            let vip_level = skus[i].activity_info.vip_level || 0;
            if(uni.getStorageSync('userInfo').vip_level && (uni.getStorageSync('userInfo').vip_level < vip_level || vip_level == 0)) {
              result.is_limit = 'noAllow';
            } else if (uni.getStorageSync('userInfo').vip_level === 0 && vip_level > 0) {
              let link_uid = uni.getStorageSync('userInfo').link_superior_user;
              if(!link_uid) link_uid = uni.getStorageSync('link_uid');
              if(!link_uid) {
                result.is_limit = 'noLink';
              }
            }
          }
        }

        if(skus[i].show_vdc) result.show_vdc = skus[i].show_vdc;

        if(skus[i].activity_info && skus[i].activity_info.id) {
          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          let startDate = moment(skus[i].start_time).format('YYYY-MM-DD HH:mm:ss');
          let endDate = moment(skus[i].end_time).format('YYYY-MM-DD HH:mm:ss');
          if(moment(startDate).diff(moment(date)) > 0) {
            result.isLimit = true;
            result.start_time = moment(skus[i].start_time).format('MM月DD号HH:mm');
            result.start_time_val = skus[i].start_time;
            result.limitActivityType = 'nostart';
          } else if(moment(date).diff(moment(endDate)) > 0) {
            result.isLimit = true;
            result.limitActivityType = 'expire';
          } else {
            // 有效期中
            result.start_time = skus[i].start_time;
            result.end_time = skus[i].end_time;
          }
        }


        if(skus[i].pt_activity_info && skus[i].pt_activity_info.activity_code) {
          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          let startDate = moment(skus[i].pt_start_time).format('YYYY-MM-DD HH:mm:ss');
          let endDate = moment(skus[i].pt_end_time).format('YYYY-MM-DD HH:mm:ss');
          if(moment(startDate).diff(moment(date)) > 0) {
            result.isPtLimit = true;
            result.pt_start_time = moment(skus[i].pt_start_time).format('MM月DD号HH:mm');
            result.limitPtType = 'nostart';
          } else if(moment(date).diff(moment(endDate)) > 0) {
            result.isPtLimit = true;
            result.limitPtType = 'expire';
          }
        }

        if(skus[i].ppyl_activity_info && skus[i].ppyl_activity_info.area && skus[i].ppyl_activity_info.area.area_code ) {
          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          let startDate = moment(skus[i].ppyl_start_time).format('YYYY-MM-DD HH:mm:ss');
          let endDate = moment(skus[i].ppyl_end_time).format('YYYY-MM-DD HH:mm:ss');
          if(moment(startDate).diff(moment(date)) > 0) {
            result.isPpylLimit = true;
            result.ppyl_start_time = moment(skus[i].ppyl_start_time).format('MM月DD号HH:mm');
            result.limitPpylType = 'nostart';
          } else if(moment(date).diff(moment(endDate)) > 0) {
            result.isPpylLimit = true;
            result.limitPpylType = 'expire';
          }
        }

        if(skus[i].crowd_activity_info && skus[i].crowd_activity_info.activity_code) {
          if(skus[i].can_buy) {
            let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
            let startDate = moment(skus[i].crowd_start_time).format('YYYY-MM-DD HH:mm:ss');
            let endDate = moment(skus[i].crowd_end_time).format('YYYY-MM-DD HH:mm:ss');
            if(!skus[i].have_advance_buy && moment(startDate).diff(moment(date)) > 0) {
              result.isCrowdLimit = true;
              result.crowd_start_time = moment(skus[i].crowd_start_time).format('MM月DD号HH:mm');
              result.limitCrowdType = 'nostart';
            } else if(moment(date).diff(moment(endDate)) > 0) {
              result.isCrowdLimit = true;
              result.limitCrowdType = 'expire';
            }
          } else {
            result.isCrowdLimit = true;
            result.limitCrowdType = 'couldNotBuy';
          }

        }

        // 多一步判断，如果是参团或厂盟口，选择性只显示相关商品
        if(
          (this.collage && this.collage.activity_sn) ||
          (this.ppyl && this.ppyl.activity_sn)
        ) {
          let isAim = false;
          // 参团或厂盟口
          if(this.collage) {
            if(result.sku_sn == this.collage.goods.sku_sn) isAim = true;
          } else if(this.ppyl) {
            if(result.sku_sn == this.ppyl.goods.sku_sn) isAim = true;
          }

          if(isAim) {
            // 只显示参团的那个商品
            skuResults.push(result);
            // 计算sku的有效path
            skuItems.push({
              path: skuVal.join(this.skuConnect),
              sku: skus[i].sku_sn
            });
            break;
          }
        } else {
          // 非参团
          skuResults.push(result);
          // 计算sku的有效path
          skuItems.push({
            path: skuVal.join(this.skuConnect),
            sku: skus[i].sku_sn
          });
        }
      }


      this.skuAttrs = skuAttrs;
      this.skuItems = skuItems;
      this.skuResults = skuResults;

      if(stock == 0) this.product.noStock = true;

      // 设置初始sku选中值
      this.skuAttrSelected = {
        sku_sn: this.product.shopSku[0].sku_sn,
        attr: this.product.shopSku[0].attr
      }
      this.skuAttrValSelected = Object.values(this.skuAttrSelected.attr);
    },
    calcSkuAllPath(arr) {
      let skuPath = [];
      let originSkus = [];
      // 遍历出所有可能存在的path
      for(let i = 0; i < this.skuItems.length; i++) {
        let currentSkuItem = this.skuItems[i];
        let currentSkuPath = currentSkuItem.path;
        var skuVal = currentSkuPath.split(this.skuConnect);
        // 计算该sku项能有多少个幂积（可能路径）
        let allResult = this.calcSkuPath(skuVal);
        for(let j = 0; j < allResult.length; j++) {
          let result = allResult[j];
          let resultKey = allResult[j].join(this.skuConnect);
          // 如果幂积键已存在，则直接将对应sku加入到幂积值中
          if(this.skuPerhapsPath[resultKey]) {
            this.skuPerhapsPath[resultKey].skus.push(currentSkuItem.sku)
          } else {
            // 不存在，创建对应键
            this.skuPerhapsPath[resultKey] = {
              skus: [currentSkuItem.sku]
            }
          }
        }
      }
    },
    // 计算sku的幂积，参考https://www.cnblogs.com/soul-wonder/p/9732921.html
    calcSkuPath(arr) {

      let skuPath = [[]];
      for (let i=0; i < arr.length; i++) {
          for (let j = 0, len = skuPath.length; j < len; j++) {
              skuPath.push(skuPath[j].concat(arr[i]));
          }
      }
      return skuPath;
    },
    // 切换属性
    updateAttr(key, val, isAllow) {
      let isActive = this.skuAttrSelected.attr[key] == val;   //是否当前已经是选中项
      let skuAttrSelectedLast = JSON.parse(JSON.stringify(this.skuAttrSelected));
      let skuAttrValSelectedLast = JSON.parse(JSON.stringify(this.skuAttrValSelected));

      // 如果是选中项，那么不做任何处理。如果不是选中项，那么切换sku属性组合
      if (!isActive) {
          this.skuAttrSelected.attr[key] == val;
          this.skuAttrValSelected = Object.values(this.skuAttrSelected.attr);

          this.handleUpdate(key, val, skuAttrSelectedLast);
          // this.updateSkuSelected()
      }
    },
    handleUpdate(key, val, lastData) {
      let skuAttrSelected = this.skuAttrSelected;
      skuAttrSelected.sku_sn = null;
      let keys = Object.keys(this.skuAttrSelected.attr);
      for(let i = 0; i < keys.length; i++) {
        if(keys[i] != key) {
          skuAttrSelected.attr[keys[i]] = '';
        } else {
          skuAttrSelected.attr[keys[i]] = val;
        }
      }
      // 去掉其他的选择，更新整个sku选中项
      this.skuAttrSelected = skuAttrSelected;
      this.skuAttrValSelected = Object.values(this.skuAttrSelected.attr);
      this.updateSkuSelected();

      /**
       * 恢复原来已选属性
       * 遍历所有非当前属性行
       *   1. 与 lastData(skuAttrSelectedLast) 对比
       *   2. 如果要恢复的属性存在（非 disable）且 和当前*未高亮行*已选择属性的*可组合*），高亮原来已选择的属性且更新
       *   3. 否则什么也不做
       */
      for (var i = 0; i < keys.length; i++) {
        var currentKey = keys[i]
        if (currentKey == key) continue;  //对于操作的那项不做任何处理

        // 如果上一次选中的属性在允许选中列表中，将上一次选项值赋值给当前属性
        if(this.skuAllowSelected[currentKey].indexOf(lastData.attr[currentKey]) >= 0) {
          this.skuAttrSelected.attr[currentKey] = lastData.attr[currentKey];
          this.skuAttrValSelected = Object.values(this.skuAttrSelected.attr);
          this.updateSkuSelected();
        }
      }

      if(!this.skuAttrValSelected.includes('')) this.confirmSku();
    },
    // 更新选中的信息
    updateSkuSelected() {
      let keys = Object.keys(this.skuAttrs);
      let skuAllowSelected = {};
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let data = this.skuAttrs[key];
        let validSelected = this.skuAttrValSelected.slice();
        skuAllowSelected[key] = [];
        for (let j = 0; j < data.length; j++) {
            let attr = data[j];

            // 被选中的值对应的属性默认是允许被选中的
            if (this.skuAttrValSelected[i] == attr) {
              skuAllowSelected[key].push(attr);
              continue;
            }
            // 未被选中的值需要做判断
            validSelected[i] = attr;

            let currValidPath = this.trimSpliter(validSelected.join(this.skuConnect), this.skuConnect);
            // 检查path是否在全部可能path中
            if (this.skuPerhapsPath[currValidPath]) {
            // console.log(currValidPath)
              skuAllowSelected[key].push(attr); //在path中，允许选中
            }
        }
      }
      this.skuAllowSelected = skuAllowSelected;
    },
    trimSpliter(str, spliter) {
      // 用来分割、拼接选中各个sku属性值——>path
      // ⊙abc⊙ => abc
      // ⊙a⊙⊙b⊙c⊙ => a⊙b⊙c
      var reLeft        = new RegExp('^' + spliter + '+', 'g');
      var reRight       = new RegExp(spliter + '+$', 'g');
      var reSpliter = new RegExp(spliter + '+', 'g');
      return str.replace(reLeft, '')
          .replace(reRight, '')
          .replace(reSpliter, spliter)
    },
    // 当所有的attr都有选中值的时候，检查到底是哪个sku被选中了
    confirmSku() {
      let path = this.skuAttrValSelected.join(this.skuConnect);
      for(let i = 0; i < this.skuResults.length; i++) {
        if(this.skuResults[i].path == path) {
          let sku = this.skuResults[i];
          this.sku = JSON.parse(JSON.stringify(sku));
          this.handleSkuConfirm();
        }
      }
      //拿一下sku的信息做信息展示用
      this.product.sale_price = this.sku.sale_price;
      this.product.member_price = this.sku.member_price;
      this.product.market_price = this.sku.market_price;
      this.product.path = this.sku.path;
    },
    /**
     * 切换sku时要做的部分操作
     */
    handleSkuConfirm() {
      if(this.sku.activity_info && this.sku.activity_info.limit_type == 1) {
        if(this.sku.limitActivityType == 'expire') {
          this.sku.timeout = null;
          // 限时活动，加上倒计时
          return clearTimeout(this.coldDownInterval)
        } else if(!this.sku.limitActivityType) {
          this.coldDowning();
          this.tryColdDown();
        }
      } else {
        if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
      }
    },


    addSkuSelectNum() {
      if(this.sku.select_num >= this.sku.stock) {
        return uni.showToast({
          title: '超过商品库存',
          mask: true,
          icon: 'none'
        })
      }
      this.sku.select_num += 1;
    },
    deleteSkuSelectNum() {
      if(this.sku.select_num == 1) {
        return uni.showToast({
          title: '最少得选购一件哦',
          mask: true,
          icon: 'none'
        })
      }
      this.sku.select_num -= 1;
    },
    tryShowEditNum() {
      // 手动输入下单数量
      this.handingSelectNumber = this.sku.select_num;
      this.handingSelectNumberVisible = true;
    },
    updateHandingSelectNumber(e) {
      // 确认输入多少
      this.handingSelectNumber = e.detail.value;
    },
    confirmHandingSelectNumber() {
      let handingSelectNumber = parseInt(this.handingSelectNumber);
      if(!(/^([1-9][0-9]*)$/.test(handingSelectNumber))) {
        return uni.showToast({
          title: '请输入大于0的有效整数',
          icon: 'none',
          mask: true
        })
      } else if(handingSelectNumber > this.sku.stock) {
        return uni.showToast({
          title: '数量超过库存了',
          icon: 'none',
          mask: true
        })
      }
      this.sku.select_num = handingSelectNumber;
      this.handingSelectNumberVisible = false;
    },
    // sku相关操作结束


    limitBuy() {
      if(this.sku.limitActivityType === 'nostart') {
        return uni.showToast({
          title: '活动未开始',
          mask: true,
          icon: 'none'
        })
      } else {
        return uni.showToast({
          title: '活动已失效',
          mask: true,
          icon: 'none'
        })
      }
    },
    limitCrowd() {
      if(this.sku.limitCrowdType === 'nostart') {
        return uni.showToast({
          title: '本期寄售未开始',
          mask: true,
          icon: 'none'
        })
      } else if(this.sku.limitCrowdType === 'expire') {
        return uni.showToast({
          title: '限购时间已过',
          mask: true,
          icon: 'none'
        })
      } else {
        return uni.showToast({
          title: '不在有效时间内，请您稍后参与下一轮',
          mask: true,
          icon: 'none'
        })
      }
    },
    limitPt() {
      if(this.sku.limitPtType === 'nostart') {
        return uni.showToast({
          title: '拼团未开始',
          mask: true,
          icon: 'none'
        })
      } else {
        return uni.showToast({
          title: '拼团已失效',
          mask: true,
          icon: 'none'
        })
      }
    },
    limitPpyl() {
      if(this.sku.limitPpylType === 'nostart') {
        return uni.showToast({
          title: '拼团未开始',
          mask: true,
          icon: 'none'
        })
      } else {
        return uni.showToast({
          title: '拼团已失效',
          mask: true,
          icon: 'none'
        })
      }
    },
    spuExpire() {
      uni.showToast({
        title: '商品已失效',
        mask: true,
        icon: 'none'
      })
    },

    // 确认选中sku的相关信息，根据打开sku弹窗的方式，确定加入购物车或者跳转到支付订单页面
    confirmSkuInfo(changeType) {

      if(this.sku.select_num > this.sku.stock) return uni.showModal({
        title: '提示',
        content: '该商品库存不足',
        showCancel: false
      })
      if(changeType && typeof changeType == 'string') this.showSkuType = changeType;
      if(this.showSkuType == 'shopcar') {
        this.addShopcar();
      } else {
        this.goToOrder();
      }
      this.showSku = false;
    },

    addShopcar() {
      // 加入购物车
      if(!uni.getStorageSync('userInfo').phone) {
        uni.showModal({
          title: '提示',
          content: '您还未绑定手机号码，请绑定号码后再添加购物车哦',
          confirmText: '前往填写',
          success: res => {
            if(res.confirm) {
              uni.setStorageSync('fromVipRule', true);
              uni.navigateTo({
                url: '/pages/setting/setting'
              })
            }
          }
        });
        return;
      }
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        goods_sn: this.product.goods_sn,
        sku_sn: this.sku.sku_sn,
        number: this.sku.select_num
      }
      if(this.sku.exist_activity) {
        if(this.sku.start_time_val) {
          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          let limitDate = moment(this.sku.start_time_val).format('YYYY-MM-DD HH:mm:ss');
          if(moment(limitDate).diff(moment(date)) > 0) {
            return uni.showToast({
              title: '商品暂未开售',
              mask: true,
              icon: 'none'
            })
          }
        }
        params.activity_sign = this.sku.activity_info.id;
      } else {
        params.activity_sign = null;
      }
      this.$post('/shopCart/create', params, res => {
        // 更新缓存触发器
        let currentStorageTrigger = uni.getStorageSync('storageTrigger'); //重新获取缓存触发器，避免其他接口进行操作时缓存数据相互覆盖
        currentStorageTrigger.shopcar = false;
        uni.setStorageSync('storageTrigger', currentStorageTrigger);

        // 记录加购
        let step = {
          entrance_type: uni.getStorageSync('scene') || '',
          type: 3,
          main_type: 1,
          enter_time: new Date().getTime(),
          goods_sn: this.sn
        }
        if(uni.getStorageSync('link_uid')) {
          step.entrance_link_user = uni.getStorageSync('link_uid');
        }
        this.$saveStep(step);

        setTimeout(() => {
          uni.showToast({
            title: '加入购物车成功',
            mask: true,
            duration: 1000
          })
          setTimeout(() => {
            this.getShopcar();
          }, 1800)
        }, 180)
      });

    },

    // 参团
    joinCollageTeams(type) {
      if(!uni.getStorageSync('userInfo').phone) {
        uni.showModal({
          title: '提示',
          content: '您还未绑定手机号码，请绑定号码后购买商品哦',
          confirmText: '前往填写',
          success: res => {
            if(res.confirm) {
              uni.setStorageSync('fromVipRule', true);
              uni.navigateTo({
                url: '/pages/setting/setting'
              })
            }
          }
        });
        return;
      }

      let params = {
        goods: [
          {
            activity_id: this.collage.activity_code,
            activity_sn: this.collage.activity_sn,
            goods_sn: this.collage.goods.goods_sn,
            sku_sn: this.collage.goods.sku_sn,
            number: 1 //只能是1
          }
        ],
        order_type: 2,
        uid: uni.getStorageSync('userInfo').uid,
        pt_join_type: 2,  //1开团2拼团
        // pay_type: 2,  //1余额2现金
        uc_code: [],
        integral: 0,
        usedIntegralDis: 2,
        usedCouponDis: 1,
        readyType: 1    //1商品详情页触发，2预订单使用
      };

      if(this.address) {
        params.city = this.address.city_code;
        params.province = this.address.province_code;
        params.area = this.address.area_code;
        // 拼接地址，保税仓可能要用到
        params.shipping_address_detail = {
          Province: this.address.province,
          City: this.address.city,
          Area: this.address.area,
          ProvinceId: this.address.province_code,
          CityId: this.address.city_code,
          AreaId: this.address.area_code,
          address: this.address.address,
        }
      }

      if(this.sku.attach_type && this.sku.attach_type !== -1) params.attach_type = this.sku.attach_type; //特殊要求

      let validParams = {
        activity_code: this.collage.activity_code,
        activity_sn: this.collage.activity_sn,
        uid: uni.getStorageSync('userInfo').uid,
        goods_sn: this.collage.goods.goods_sn,
        sku_sn: this.collage.goods.sku_sn,
        number: 1
      }
      this.$spost('/pt/joinCheck', validParams, res => {
        this.readyAndProOrder(params)
      });

    },

    // 参与拼拼
    joinPpylTeam() {
      if(!uni.getStorageSync('userInfo').phone) {
        uni.showModal({
          title: '提示',
          content: '您还未绑定手机号码，请绑定号码后购买商品哦',
          confirmText: '前往填写',
          success: res => {
            if(res.confirm) {
              uni.setStorageSync('fromVipRule', true);
              uni.navigateTo({
                url: '/pages/setting/setting'
              })
            }
          }
        });
        return;
      }
      let params = {
        goods: [
          {
            activity_id: this.ppyl.area_code,
            activity_sn: this.ppyl.activity_sn,
            goods_sn: this.ppyl.goods.goods_sn,
            sku_sn: this.ppyl.goods.sku_sn,
            number: 1 //只能是1
          }
        ],
        order_type: 4,
        uid: uni.getStorageSync('userInfo').uid,
        ppyl_join_type: 2,  //1开团2拼团
        // pay_type: 2,  //1余额2现金
        uc_code: [],
        integral: 0,
        usedIntegralDis: 2,
        usedCouponDis: 2,
        readyType: 1    //1商品详情页触发，2预订单使用
      };

      if(this.address) {
        params.city = this.address.city_code;
        params.province = this.address.province_code;
        params.area = this.address.area_code;
        // 拼接地址，保税仓可能要用到
        params.shipping_address_detail = {
          Province: this.address.province,
          City: this.address.city,
          Area: this.address.area,
          ProvinceId: this.address.province_code,
          CityId: this.address.city_code,
          AreaId: this.address.area_code,
          address: this.address.address,
        }
      }

      if(this.sku.attach_type && this.sku.attach_type !== -1) params.attach_type = this.sku.attach_type; //特殊要求

      params.autoPpyl = this.autoPP;

      let validParams = {
        area_code: this.ppyl.area_code,
        activity_sn: this.ppyl.activity_sn,
        uid: uni.getStorageSync('userInfo').uid,
        goods_sn: this.ppyl.goods.goods_sn,
        sku_sn: this.ppyl.goods.sku_sn,
        number: 1,
        autoPpyl: this.autoPP
      }
      this.$spost('/ppyl/joinCheck', validParams, res => {
        this.readyAndProOrder(params)
      });
    },


    goToOrder() {
      // 生成预订单，去支付页面
      if(!uni.getStorageSync('userInfo').phone) {
        uni.showModal({
          title: '提示',
          content: '您还未绑定手机号码，请绑定号码后购买商品哦',
          confirmText: '前往填写',
          success: res => {
            if(res.confirm) {
              uni.setStorageSync('fromVipRule', true);
              uni.navigateTo({
                url: '/pages/setting/setting'
              })
            }
          }
        });
        return;
      }
      let params = {
        goods: [
          {
            goods_sn: this.product.goods_sn,
            sku_sn: this.sku.sku_sn,
            number: this.sku.select_num
          }
        ],
        order_type: 1,
        uid: uni.getStorageSync('userInfo').uid,
        // pay_type: 2,  //1余额2现金5集品券
        uc_code: [],
        integral: 0,
        usedIntegralDis: 2,
        usedCouponDis: 1,
        readyType: 1    //1商品详情页触发，2预订单使用
      }

      if(this.address) {
        params.city = this.address.city_code;
        params.province = this.address.province_code;
        params.area = this.address.area_code;
        // 拼接地址，保税仓可能要用到
        params.shipping_address_detail = {
          Province: this.address.province,
          City: this.address.city,
          Area: this.address.area,
          ProvinceId: this.address.province_code,
          CityId: this.address.city_code,
          AreaId: this.address.area_code,
          address: this.address.address,
        }
      }

      params.goods[0].activity_id = this.sku.activity_info ? this.sku.activity_info.id : null;

      if(this.sku.exist_activity) {
        if(this.sku.start_time_val) {
          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          let limitDate = moment(this.sku.start_time_val).format('YYYY-MM-DD HH:mm:ss');
          if(moment(limitDate).diff(moment(date)) > 0) {
            return uni.showToast({
              title: '商品暂未开售',
              mask: true,
              icon: 'none'
            })
          }
        }
        if(this.sku.activity_info.a_type == 2) params.order_type = 3; //团长升级单
      }

      if(this.sku.attach_type && this.sku.attach_type !== -1) params.attach_type = this.sku.attach_type; //特殊要求


      if(uni.getStorageSync('link_uid')) params.order_link_user = uni.getStorageSync('link_uid');

      if(params.order_type == 3) {
        // if(uni.getStorageSync('userInfo').vip_level) {
        //   return uni.showModal({
        //     title: '提示',
        //     content: '您已经是激活团长身份，无法再次购买团长大礼包商品哦',
        //     mask: true
        //   })
        // }
        // if(!uni.getStorageSync('link_uid')) {
        //   return uni.showModal({
        //     title: '提示',
        //     content: '该商品需从团长分享的链接进来方可购买，请重新从正确的地方进入',
        //     mask: true
        //   })

        // }
      }

      // 检查是不是开团单
      if(this.showSkuType == 'collage' && this.sku.is_pt) {
        params.order_type = 2;
        params.goods[0].activity_id = this.sku.pt_activity_sign || null;
        params.pt_join_type = 1; //1开团2参团
        // 拼团单走检查
        let validParams = {
          activity_code: this.sku.pt_activity_info.activity_code,
          uid: uni.getStorageSync('userInfo').uid,
          goods_sn: this.product.goods_sn,
          sku_sn: this.sku.sku_sn,
          number: 1
        }
        this.$spost('/pt/startCheck', validParams, res => {
          this.readyAndProOrder(params)
        });
      } else if(this.sku.is_ppyl) {
        params.order_type = 4;
        params.goods[0].activity_id = this.sku.ppyl_activity_info.area.area_code || null;
        params.ppyl_join_type = this.ppylCtrl == 'startPpyl'? 1 : 2; //1开团2参团

        params.autoPpyl = this.autoPP;
        if(params.ppyl_join_type == 1) {
          // 拼拼走检查
          let validParams = {
            area_code: this.sku.ppyl_activity_info.area.area_code,
            uid: uni.getStorageSync('userInfo').uid,
            goods_sn: this.product.goods_sn,
            sku_sn: this.sku.sku_sn,
            number: 1
          }

          this.$spost('/ppyl/startCheck', validParams, res => {
            this.readyAndProOrder(params)
          });
        } else {
          this.readyAndProOrder(params)
        }

      } else if(this.sku.is_crowd_funding) {
        params.order_type = 6;
        if(this.userInfo && this.userInfo.crowd_balance >= this.sku.select_num * this.sku.sale_price) {
          params.pay_type = 5;  //集品券余额大于众筹订单金额默认使用集品券支付
        }
        params.goods[0].activity_id = this.sku.crowd_activity_sign || null;
        params.goods[0].round_number = this.sku.crowd_round_number || null;
        params.goods[0].period_number = this.sku.crowd_period_number || null;

        this.readyAndProOrder(params);

      } else {
        // 不是拼团正常走预订单
        this.readyAndProOrder(params);
      }

    },

    readyAndProOrder(params) {
      // 预订单，去预订单页面
      if(this.readyNavigate) return;
      this.readyNavigate = true;
      this.$spost('/order/ready', params, res => {
        let preOrder = res.data;
        let time = new Date().getTime();  //模拟一个id，用来做后续预订单页面的检索
        preOrder.id = time;
        uni.setStorageSync('preOrder', preOrder);
        uni.navigateTo({
          url: `/pages/pre-order/pre-order?id=${time}`
        })
        this.readyNavigate = false;
      }, err => {
        this.readyNavigate = false;
      });
    },

    replaceProduct(e) {
      let sn = e.currentTarget.dataset.sn;
      uni.redirectTo({
        url: `/pages/product-detail/product-detail?sn=${sn}`
      })
    },

    updateSwiperIndex(e) {
      this.swiperIndex = e.detail.current;
      if(this.product.intro_video && this.product.intro_video !== '' && this.swiperIndex != 0) {
        let introContext = uni.createVideoContext('intro-video');
        introContext.stop();
      }
    },

    showGoodsImages(index) {
      let urls = [];
      for(let i = 0; i < this.product.goodsImages.length; i++) {
        if(!urls.includes(this.product.goodsImages[i].image_url)) urls.push(this.product.goodsImages[i].image_url);
      }
      uni.previewImage({
        urls: urls,
        current: this.product.goodsImages[index].image_url,
        fail: err => {
          console.log(err);
        }
      })
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


    // 海报
    tryPoster() {
      if(!this.userInfo.uid) return uni.showToast({
        title: '您无法分享哦',
        icon: 'none',
        mask: true
      })
      // 普通人能推普通人
      // if(this.sku.order_type == 3 && !this.userInfo.vip_level) {
      //   return uni.showModal({
      //     title: '提示',
      //     content: '该商品为礼包商品，你不是VIP或者其他代理人身份，分享无效。如有推荐他人需求请分享其他商品。',
      //     showCancel: false
      //   })
      // }
      config.getPrivacy(() => {
        uni.showLoading({title: '生成专属图中'});
        const query = uni.createSelectorQuery()
        query.select('#poster')
        .fields({
              id: true,
              node: true,
              size: true
        })
        .exec(res => {
          if(this.platform != 'ios') {
            // 不是ios走canvas 2d
            this.canvas = res[0].node;
            // 如果获取不到就是有问题
            if(!this.canvas) {
              uni.hideLoading();
              setTimeout(() => {
                uni.showToast({
                  title: '生成失败请重试',
                  mask: true,
                  icon: 'none'
                })
              })
            }
            this.canvas.width = 750;
            this.canvas.height = 1200;
          }

          Promise.all([
            this.getSkuInfo(),
            this.getQrcode(),
            this.getShareRadiusLeft(),
            this.getShareRadiusRight()
          ]).then(() => {
            return this.startRenderPoster();
          }).then(() => {
            console.log('success');
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
        })


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
      }, this)
    },

    getSkuInfo() {
      let promise = new Promise( (resolve, reject) => {
        if(this.platform == 'ios') {
          uni.getImageInfo({
            src: this.sku.image,
            success: image => {
              this.productImg = image.path;
              this.$refs.blur.blur(image.path, 3, 375, 375).then(res => {
                this.blurImgBg = res;
                resolve();
              }).catch(err => {
                console.log(err);
                reject(err);
              });
            },
            fail: err => {
              uni.showToast({
                title: '获取产品图失败',
                icon: 'none'
              })
              reject(err);
            }
          });
        } else {
          const img = this.canvas.createImage();//创建img对象
          img.onload = res => {
            this.productImg = img;
            this.$refs.blur.blur(img, 3, 375, 375).then(res => {
              const blurImg = this.canvas.createImage();
              blurImg.onload = (res) => {
                this.blurImgBg = blurImg;
                resolve();
              }
              blurImg.onerror = (err, text) => {
                reject(err);
              };
              blurImg.src = res;
            }).catch(err => {
              reject(err);
            });
          }
          img.onerror = err => {
            uni.showToast({
              title: '获取产品图失败',
              icon: 'none'
            })
            reject(err);
          }
          img.src = this.sku.image;
        }

      })
      return promise;
    },

    // #ifndef H5 || APP-PLUS
    getQrcode() {
      let promise = new Promise( (resolve, reject) => {
        if(this.qrCode) return resolve();  //有就不再获取了
        // 获取二维码
        let content = this.product.goods_sn;
        if(uni.getStorageSync('userInfo').uid) content += `&${uni.getStorageSync('userInfo').uid}`;
        let params = {
          page: 'pages/index/index',
          content: content,
          width: '233px',
          auto_color: false
        }
        if(this.aId) {
          params.dynamic_params = {
            aType: this.aType,
            aId: this.aId
          }
          params.delimiter = '&';
        }
        this.$post('/home/wxCode', params, res => {
          if(this.platform == 'ios') {
            // ios
            uni.getImageInfo({
              src: res.data,
              success: image => {
                this.qrCode = image.path;
                resolve();
              },
              fail: err => {
                uni.showToast({
                  title: '获取二维码失败',
                  icon: 'none'
                })
                reject();
              }
            });
          } else {
            // 如果不是ios
            const img = this.canvas.createImage();//创建img对象
            img.onload = () => {
              this.qrCode = img;
              resolve();
            }
            img.onerror = err => {
              uni.showToast({
                title: '获取二维码失败',
                icon: 'none'
              })
              reject();
            }
            img.src = res.data;
          }


        }, err => {
          console.log(err);
          reject();
        })
      })
      return promise;
    },
    // #endif

    // #ifdef H5 || APP-PLUS
    getQrcode() {
      let promise = new Promise( (resolve, reject) => {
        if(this.qrCode) return resolve();  //有就不再获取了
        // 获取二维码
        if (uni.getStorageSync('accessKey') == this.$accessKey['APP-PLUS']) {
          const pathname = '/pages/product-detail/product-detail'
          let search = `?sn=${this.sn}`
          if (this.aType) search += `&aType=${this.aType}`
          if (this.aId) search += `&aId=${this.aId}`
          if (this.fromJoin) search += `&fromJoin=${this.fromJoin}`

          var pageInfo = encodeURIComponent(pathname + search);
          var content = `${this.$href}?redirect=${pageInfo}`;
        } else {
          let pageInfo = encodeURIComponent(window.location.pathname + window.location.search);
          let content = `${window.location.origin}?redirect=${pageInfo}`;
        }
        if(uni.getStorageSync('userInfo').uid) content += `&link_uid=${uni.getStorageSync('userInfo').uid}`;
        let params = {
          content: content
        }
        this.$post('/home/QrCode', params, res => {
          if(this.platform == 'ios') {
            // ios
            uni.getImageInfo({
              src: res.data,
              success: image => {
                this.qrCode = image.path;
                resolve();
              },
              fail: err => {
                uni.showToast({
                  title: '获取二维码失败',
                  icon: 'none'
                })
                reject();
              }
            });
          } else {
            // 如果不是ios
            const img = this.canvas.createImage();//创建img对象
            img.onload = () => {
              this.qrCode = img;
              resolve();
            }
            img.onerror = err => {
              uni.showToast({
                title: '获取二维码失败',
                icon: 'none'
              })
              reject();
            }
            img.src = res.data;
          }


        }, err => {
          console.log(err);
          reject();
        })
      })
      return promise;
    },
    // #endif

    getShareRadiusLeft() {
      let promise = new Promise( (resolve, reject) => {
        if(this.platform == 'ios') {
          this.shareRadiusLeft = '/static/images/poster/share_radius_left.png';
          resolve();
        } else {
          if(this.shareRadiusLeft) return resolve();  //有就不再获取了
          const img = this.canvas.createImage();//创建img对象
          img.onload = () => {
            this.shareRadiusLeft = img;
            resolve();
          }
          img.onerror = err => {
            uni.showToast({
              title: '获取素材失败',
              icon: 'none'
            })
            reject();
          }
          img.src = '/static/images/poster/share_radius_left.png';
        }
      })
      return promise;
    },
    getShareRadiusRight() {
      let promise = new Promise( (resolve, reject) => {
        if(this.platform == 'ios') {
          this.shareRadiusRight = '/static/images/poster/share_radius_right.png';
          resolve();
        } else {
          if(this.shareRadiusRight) return resolve();  //有就不再获取了
          const img = this.canvas.createImage();//创建img对象
          img.onload = () => {
            this.shareRadiusRight = img;
            resolve();
          }
          img.onerror = err => {
            uni.showToast({
              title: '获取素材失败',
              icon: 'none'
            })
            reject();
          }
          img.src = '/static/images/poster/share_radius_right.png';
        }
      })
      return promise;
    },

    startRenderPoster() {
      if(this.platform == 'ios') {
        return this.startRenderPosterIOS();
      } else {
        return this.startRenderPosterNoIOS();
      }

    },

    startRenderPosterIOS() {
      let that = this;
      return new Promise( (resolve, reject) => {
        let ctx = uni.createCanvasContext('poster-ios');
        ctx.setFillStyle('#ffffff');
        ctx.fillRect(0, 0, 750, 1200);
        ctx.save();

        ctx.drawImage(this.productImg, 0, 0, 750, 750);   //渲染产品图

        // 画标题，超过换行，两行截断
        let productTitles = this.product.title, productTitle = '';
        let currentRowWidth = 0;  //当前行宽度
        let currentIndex = 0, currentRow = 1;  // 当前行的当前字索引， 当前行
        let initTop = 786;
        for (let j = 0; j < productTitles.length; j++) {
          ctx.font = 'normal normal 500 36px/1.4 "PingFangSC"';
          ctx.setTextBaseline('top');
          ctx.setFillStyle('#000');

          let currentWord = productTitles[j];
          let currentWordWidth = ctx.measureText(currentWord).width;
          currentRowWidth += currentWordWidth;
          // 每行只能有690px宽度
          if(currentRowWidth > 690 || j == productTitles.length - 1) {

            let endIndex = j;
            if(currentIndex == endIndex || j == productTitles.length - 1) {
              // j + 1 是因为substring不包括j，必须往上进位
              endIndex = j + 1;
            }
            let itemString = productTitles.substring(currentIndex, endIndex);
            if(currentRow == 2) {
              // 在这场景，只允许最多两行。
              if(endIndex < productTitles.length - 1) itemString = itemString.substring(0, itemString.length - 1) + '...';
            }

            // 文字位置计算公式： 起始点位置 + 1.4倍行高 * 字号大小 * 当前行索引
            ctx.fillText(itemString, 36, initTop + 1.4 * 40 * (currentRow - 1));


            // 重置当前行宽的初始值为第一个字的宽度
            currentRowWidth = currentWordWidth;
            currentIndex = endIndex;
            if(currentRow >= 2 || endIndex >= productTitles.length) {
              // 2行跳出
              break;
            } else {
              currentRow += 1;
            }
          }
        }

        ctx.font = 'normal normal 500 49px/1.4 "PingFangSC"';
        ctx.setTextBaseline('top');
        ctx.setFillStyle('#000');
        ctx.fillText(`￥${this.sku.member_price || '0.00'}`, 36, 927);
        ctx.restore();

        // 划线价
        ctx.font = 'normal normal 500 30px/1.4 "PingFangSC"';
        ctx.setTextBaseline('top');
        ctx.setFillStyle('#999');
        ctx.fillText(`￥${this.sku.market_price || '0.00'}`, 44, 1002);

        let marketPriceWidth = ctx.measureText(`￥${this.sku.market_price || '0.00'}`).width;
        ctx.fillRect(44, 1002 + 30 / 2, marketPriceWidth, 1);
        ctx.restore();

        ctx.drawImage(this.qrCode, 500, 902, 215, 215);  //二维码
        ctx.restore();

        // 分享说明
        ctx.font = 'normal normal 500 27px/1.4 "PingFangSC"';
        ctx.setTextBaseline('top');
        ctx.setTextAlign('center');
        ctx.setFillStyle('#999');
        ctx.fillText(`微信扫或长按识别`, 500 + 215 / 2, 1126 + 5);
        ctx.restore();

        // 分享人信息
        ctx.font = 'normal normal 500 27px/1.4 "PingFangSC"';
        ctx.setTextBaseline('top');
        ctx.setTextAlign('left');
        // 检查用户昵称长度，太长...
        let shareOriginName = this.userInfo.name || '游客', shareName = '';
        let shareNameWidth = 0;  //当前行宽度
        for (let j = 0; j < shareOriginName.length; j++) {
          let currentWord = shareOriginName[j];
          shareNameWidth = ctx.measureText(currentWord).width;
          shareNameWidth += shareNameWidth;
          // 最长200px
          if(shareNameWidth > 200 || j == shareOriginName.length - 1) {

            let endIndex = j + 1;
            shareName = shareOriginName.substring(0, endIndex);
            if(endIndex < shareOriginName.length - 1) shareName = shareOriginName.substring(0, shareOriginName.length - 1) + '...';
            break;
          }
        }

        let shareText = `${shareName} 向您推荐`;
        shareNameWidth = ctx.measureText(shareText).width;

        ctx.drawImage(this.shareRadiusLeft, 36, 1110, 26, 50);
        ctx.restore();
        ctx.setFillStyle('#ececec');
        ctx.fillRect(36 + 26, 1110, shareNameWidth + 4, 50);
        ctx.restore();
        ctx.drawImage(this.shareRadiusRight, 36 + 26 + shareNameWidth + 4, 1110, 26, 50);
        ctx.restore();
        ctx.setFillStyle('#000');
        ctx.fillText(shareText, 36 + 26 + 4 / 2, 1110 + 12);



        ctx.draw(false, () => {
          uni.canvasToTempFilePath({
            canvasId: 'poster-ios',
            fileType: 'jpg',
            success: res => {
              let poster = res.tempFilePath;
              this.poster = poster;
              this.showPoster = true;
              resolve();
            },
            fail: err => {
              console.log(err);
              setTimeout(() => {
                uni.showToast({
                  title: '网络问题请重试',
                  mask: true,
                  icon: 'none'
                })
              }, 200)
              reject();
            }
          })
        })
      })
    },
    startRenderPosterNoIOS() {
      return new Promise( (resolve, reject) => {
        // 不是ios
        const query = uni.createSelectorQuery()
        query.select('#poster')
        .fields({
              id: true,
              node: true,
              size: true
        })
        .exec(res => {
          const ctx = this.canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 750, 1200);
          ctx.save();

          ctx.drawImage(this.productImg, 0, 0, 750, 750);   //渲染产品图


          // 画标题，超过换行，两行截断
          let productTitles = this.product.title, productTitle = '';
          let currentRowWidth = 0;  //当前行宽度
          let currentIndex = 0, currentRow = 1;  // 当前行的当前字索引， 当前行
          let initTop = 786;
          for (let j = 0; j < productTitles.length; j++) {
            ctx.font = 'normal normal 500 36px/1.4 "PingFangSC"';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000';

            let currentWord = productTitles[j];
            let currentWordWidth = ctx.measureText(currentWord).width;
            currentRowWidth += currentWordWidth;
            // 每行只能有690px宽度
            if(currentRowWidth > 690 || j == productTitles.length - 1) {

              let endIndex = j;
              if(currentIndex == endIndex || j == productTitles.length - 1) {
                // j + 1 是因为substring不包括j，必须往上进位
                endIndex = j + 1;
              }
              let itemString = productTitles.substring(currentIndex, endIndex);
              if(currentRow == 2) {
                // 在这场景，只允许最多两行。
                if(endIndex < productTitles.length - 1) itemString = itemString.substring(0, itemString.length - 1) + '...';
              }

              // 文字位置计算公式： 起始点位置 + 1.4倍行高 * 字号大小 * 当前行索引
              ctx.fillText(itemString, 36, initTop + 1.4 * 32 * (currentRow - 1));


              // 重置当前行宽的初始值为第一个字的宽度
              currentRowWidth = currentWordWidth;
              currentIndex = endIndex;
              if(currentRow >= 2 || endIndex >= productTitles.length) {
                // 2行跳出
                break;
              } else {
                currentRow += 1;
              }
            }
          }


          // 画价格
          ctx.font = 'normal normal 500 49px/1.4 "PingFangSC"';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#000';
          ctx.fillText(`￥${this.sku.member_price || '0.00'}`, 36, 927);
          ctx.restore();

          // 划线价
          ctx.font = 'normal normal 500 30px/1.4 "PingFangSC"';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#999';
          ctx.fillText(`￥${this.sku.market_price || '0.00'}`, 44, 1002);

          let marketPriceWidth = ctx.measureText(`￥${this.sku.market_price || '0.00'}`).width;
          ctx.fillRect(44, 1002 + 30 / 2, marketPriceWidth, 1);
          ctx.restore();
  ;
  ;
          ctx.drawImage(this.qrCode, 500, 902, 215, 215);   //渲染二维码，画小6px
          ctx.restore();

          // 分享说明
          ctx.font = 'normal normal 500 27px/1.4 "PingFangSC"';
          ctx.textBaseline = 'top';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#999';
          ctx.fillText(`微信扫或长按识别`, 500 + 215 / 2, 1126 + 5);  //稍微撑开点，因为二维码没有空白填充
          ctx.restore();

          // 分享人信息
          ctx.font = 'normal normal 500 27px/1.4 "PingFangSC"';
          ctx.textBaseline = 'top';
          ctx.textAlign = 'left';
          // 检查用户昵称长度，太长...
          let shareOriginName = this.userInfo.name || '游客', shareName = '';
          let shareNameWidth = 0;  //当前行宽度
          for (let j = 0; j < shareOriginName.length; j++) {
            let currentWord = shareOriginName[j];
            shareNameWidth = ctx.measureText(currentWord).width;
            shareNameWidth += shareNameWidth;
            // 最长200px
            if(shareNameWidth > 200 || j == shareOriginName.length - 1) {

              let endIndex = j + 1;
              shareName = shareOriginName.substring(0, endIndex);
              if(endIndex < shareOriginName.length - 1) shareName = shareOriginName.substring(0, shareOriginName.length - 1) + '...';
              break;
            }
          }

          let shareText = `${shareName} 向您推荐`;
          shareNameWidth = ctx.measureText(shareText).width;

          ctx.drawImage(this.shareRadiusLeft, 36, 1110, 26, 50);
          ctx.restore();
          ctx.fillStyle = '#ececec';
          ctx.fillRect(36 + 26, 1110, shareNameWidth + 4, 50);
          ctx.restore();
          ctx.drawImage(this.shareRadiusRight, 36 + 26 + shareNameWidth + 4, 1110, 26, 50);
          ctx.restore();
          // 画分享人信息
          ctx.fillStyle = '#000';
          ctx.fillText(shareText, 36 + 26 + 4 / 2, 1110 + 12);


          uni.canvasToTempFilePath({
            canvas: this.canvas,
            fileType: 'jpg',
            success: res => {

              let poster = res.tempFilePath;
              this.poster = poster;
              this.showPoster = true;
              resolve();
            },
            fail: err => {
              console.log(err);
              setTimeout(() => {
                uni.showToast({
                  title: '网络问题请重试',
                  mask: true,
                  icon: 'none'
                })
              }, 200)
              reject();
            }
          })

        });
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
        filePath: that.poster,
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

    tryCreateShareThumb() {
      // 因异步，先获取当前sku的图片
      uni.getImageInfo({
        src: this.skuResults[0].image,
        success: image => {
          let shareThumb = image.path;
          this.startRenderShareThumb(shareThumb);

        },
        fail: err => {
          this.shareThumb = this.skuResults[0].image
        }
      });
    },


    startRenderShareThumb(shareThumb) {
      let ctx = uni.createCanvasContext('shareThumb');

      ctx.font = 'normal 28px/1.4 "PingFangSC"';
      ctx.save();

      ctx.clearRect(0, 0, 750, 600);
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(0, 0, 750, 600);

      ctx.restore();

      ctx.drawImage(shareThumb, 0, 0, 750, 750);   //渲染产品图

      ctx.restore();


      ctx.setFillStyle('#000000');
      ctx.setGlobalAlpha(0.5);
      ctx.fillRect(0, 500, 750, 100);
      ctx.restore();

      ctx.setGlobalAlpha(1);
      ctx.setTextAlign('left');
      ctx.setFillStyle('#fff');
      ctx.setFontSize(46);
      ctx.setTextBaseline('middle');
      ctx.fillText(`￥`, 10, 555);
      let offsetLeft = ctx.measureText('￥').width || 0;
      ctx.restore();

      ctx.setTextAlign('left');
      ctx.setFillStyle('#fff');
      ctx.setFontSize(61);
      ctx.setTextBaseline('middle');
      ctx.fillText(`${this.skuResults[0].member_price || '0.00'}`, 10 + offsetLeft, 550);
      offsetLeft += ctx.measureText(this.skuResults[0].member_price || '0.00').width || 0;
      ctx.restore();

      ctx.setGlobalAlpha(0.6);
      ctx.setTextAlign('left');
      ctx.setFillStyle('#fff');
      ctx.setFontSize(43);
      ctx.setTextBaseline('middle');
      ctx.fillText(`￥${this.skuResults[0].market_price || '0.00'}`, 10 + offsetLeft + 10, 555);
      let lineWidth = ctx.measureText(`￥${this.skuResults[0].market_price || '0.00'}`).width || 0;
      ctx.restore();


      ctx.setFillStyle('#fff');
      ctx.setGlobalAlpha(0.6);
      ctx.fillRect(10 + offsetLeft + 10 + 5, 558, lineWidth, 3);
      ctx.restore();


      ctx.setFillStyle('#c80a2a');
      ctx.setGlobalAlpha(1);
      ctx.fillRect(504, 510, 236, 80);
      ctx.restore();

      ctx.setGlobalAlpha(1);
      ctx.setTextAlign('center');
      ctx.setFillStyle('#fff');
      ctx.setFontSize(46);
      ctx.setTextBaseline('middle');
      ctx.fillText('立即抢购', 622, 550);
      ctx.restore();


      ctx.draw(false, () => {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvasId: 'shareThumb',
            fileType: 'jpg',
            success: res => {
              let result = res.tempFilePath;
              this.shareThumb = result;
            },
            fail: err => {
              console.log(err);
              this.shareThumb = this.skuResults[0].image;
            }
          })
        }, 200)
      });
    },

    toIndex() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    goToCollageDetail(index) {
      let code = this.collageTeams.list[index].activity_code;
      let sn = this.collageTeams.list[index].activity_sn;
      if(this.fromJoin) {
        uni.redirectTo({
          url: `/market-pages/pages/collage/collage-detail/collage-detail?sn=${sn}&code=${code}`
        })
      } else {
        uni.navigateTo({
          url: `/market-pages/pages/collage/collage-detail/collage-detail?sn=${sn}&code=${code}`
        })
      }
    },
    goToPpylDetail(index) {
      let code = this.ppylTeams.list[index].area_code;
      let sn = this.ppylTeams.list[index].activity_sn;
      if(this.fromJoin) {
        uni.redirectTo({
          url: `/market-pages/pages/ppyl/ppyl-team/ppyl-team?sn=${sn}&code=${code}`
        })
      } else {
        uni.navigateTo({
          url: `/market-pages/pages/ppyl/ppyl-team/ppyl-team?sn=${sn}&code=${code}`
        })
      }
    },
    goToShopcar() {
      uni.switchTab({
        url: `/pages/shopcar/shopcar`
      })
    },
    goToAddresses() {

      this.validTourist(() => {
        this.backFromAddresses = true;
        uni.navigateTo({
          url: '/pages/addresses/addresses?type=select'
        })
      }, () => {
        uni.setStorageSync('authOriginPage', {
          type: 'navigateTo',
          page: `/pages/product-detail/product-detail?sn=${this.sn}`,
        });
      })
    },
    goToReputation() {
      this.validTourist(() => {
        uni.navigateTo({
          url: `/market-pages/pages/reputation/product-reputations/product-reputations?sn=${this.sn}`
        })
      }, () => {
        uni.setStorageSync('authOriginPage', {
          type: 'navigateTo',
          page: `/pages/product-detail/product-detail?sn=${this.sn}`,
        });
      })
    },
    goToAddReputation() {
      this.validTourist(() => {
        uni.navigateTo({
          url: `/market-pages/pages/reputation/reputation-add/reputation-add?sn=${this.sn}`
        })
      }, () => {
        uni.setStorageSync('authOriginPage', {
          type: 'navigateTo',
          page: `/pages/product-detail/product-detail?sn=${this.sn}`,
        });
      })
    },
    // 验证游客身份，阻止进入下一级页面
    validTourist(callback, preHanlder) {
      config.getPrivacy(() => {
        let userInfo = uni.getStorageSync('userInfo');
        if(!userInfo || userInfo.need_auth) {
          // #ifndef H5
          uni.showModal({
            title: '提示',
            content: `为了更好的为您提供服务，${this.$name}需要您的身份信息授权。`,
            confirmText: '前往授权',
            success: res => {
              if(res.confirm) {
                if(preHanlder && typeof preHanlder == 'function') preHanlder();
                uni.reLaunch({
                  url: '/pages/auth/auth'
                })
              }
            }
          })
          // #endif
          // #ifdef H5
          if(preHanlder && typeof preHanlder == 'function') preHanlder();
          window.location = '/';
          // #endif
        } else {
          if(callback && typeof callback == 'function') callback();
        }
      }, this)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'product-detail.scss';
</style>