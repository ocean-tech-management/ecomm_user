/*
 *  APP集成插件
 * */
(function () {
    /**
     * default_callback_name H5请求APP后,APP调用页面的方法名,该方法名不应放置任何闭包或者对象内,必须windows.callback_name  可见
     * @type {{default_callback_name: string}}
     * @private
     */
    var ___options = {
        debug: false,//是否开启调式模式。调试模式下面，错误时会有提示框提示，
        default_callback_name: 'receive_app_data',
    };

    //内部使用的工具函数
    var ___unitl = {
        /**
         * 将JSON格式的字符串解析成JSON对象
         * @param data
         * @returns {*}
         */
        json_string2json(data) {//json字符串转json
            try {
                if ((typeof data ) == 'object') {
                    return data;
                } else {
                    return JSON.parse(data)
                }
            } catch (error) {
                return data;
            }

        },


        /**
         * 检查是否是APP
         */
        check_is_app: function () {
            return true; // 硬性返回true，2023/3/31经测试，applab在超A端返回null
            var applabel = this.get_cookie('applab');
            //APP里面会带上指定参数
            if (applabel && applabel != '' && applabel != undefined && applabel != 'undefined') {
                return true;
            } else {
                return false;
            }

            // if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { //判断iPhone|iPad|iPod|iOS
            //     return true;
            // } else if (/(Android)/i.test(navigator.userAgent)) {  //判断Android
            //     return true;
            // }
            // return false;
        },
        /**
         * 读取cookies
         * @param name
         * @returns {null}
         */
        get_cookie(name)
        {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

            if (arr = document.cookie.match(reg))

                return unescape(arr[2]);
            else
                return null;
        },

        /**
         * 将JSON对象转换成JSON字符串
         * @param data
         * @returns string
         */
        json2string(data) {//json字符串转json
            try {
                if ((typeof data ) == 'object') {
                    return JSON.stringify(data);
                } else {
                    return data;
                }
            } catch (error) {
                return data;
            }
        },
        //开启调式模式时，用于提示错误信息
        toast(str){
            var divObj = document.createElement("div");
            divObj.innerHTML = '<div style="position: fixed;z-index: 2000;left: 0;right:0;top: 0;color: #FFF;background: rgba(249, 2, 2, 0.8);padding: 10px 15px;font-size: 15px;display: flex;justify-content: center;align-items: center;"> <img style="width:30px;margin-right:10px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADgElEQVR4Xu2b23XUMBCGZyoAOiAVQCqAVACpAFIBUAFJBUAFQAUhFRAqIFRAOgAqGM6/x/bxen2Z0czIm7PRSx4i6/JZ+jSytEwHnvjA+0/3AO5HwAoEROQ5Eb0hIvxFuiaiC2a+qd2c6lNARD4Q0duJjp4x85eaEKoCEJFzInq/0MGqEKoBEJGnRPRT8Xb/EtExM98q8rqz1ASAzgOCJl0z84kmozdPFQAigjmPuW9Jp8z8zfJASd50ACLyuBn6D40NxBTAVMCUSEs1AFwS0cvCHmBphDjTUiqAZr3/7mz9UaYQswH8JiJMAU9KFWIaAOWarwWTJsQUAA7xTQFJE2IWAK34rpoev1AMhU/MPBVCKx4fzxIOwCC+bliLyGsi+qzoBZbF0A1TBgCV+Ji5q1tEECP8UQAIF2IoAIv4+gDQcRERBQBkCd0shQGwis8BAJEhYoOQCDESgFZ8mxftAIDHw4QYAsAgvm6UOwGgnBAhRgFQia8/xwMAhAjRDcAivmAAIUJ0AbCKLwGAW4heACbxJQBwC7EYQIn4kgC4hOgBYBZfIoBiIRYBKBVfIoBiIZoBeMSXDKBIiCUA8ImrPdJShu+72QLigLG6zRGiCYCI4OMmzO9OSQDMQlQDaLasONzwfuOL2AvMvQCTEC0ANOd66pGROAJMQlQBaMSHZS8sJQNQC1ELIER8yavA8OWohLgIIFJ8lQGguhNmxuWLyTQLIFp8KwC4YeZjD4BQ8a0AAFW+Y+aPUxAmR0CG+AaN6M78sqZZU9+sEOcAhItvAABn/+19IBx4uKPLmaH+lZlx9rCTRgEkv5GwpdRY0KgQdwBkis/Y4Ojso0IcA5AmvugeFZS3I8QtABXEV9Dm0Ed2hDgEkC2+fm8uiKhdnvD3VWhXpwvbEmL/gDJsq6vsyKP2eMtwh1BZ9GK2TogbAGuIL3kztESgE2ILoLr4VgbQRYjcvH1sda33+JYoz/6/8H6Aq87Bw7fMfAQAJbc4IxpSckMkot5+GWcAgO3is+iSFeVhSWqvwkLAVUdg074rAMDVlDUqVzBKz/IDALRXU9Jbs0IFvwAAt66erFD5PlS5mQLaK2r70ODoNpy2ccAhjoJNSNwPhREMYUl8EI15z8r7R0Tn7Wey4WYIqwG+zGh/2rJnfVtsDkLgrV+hLH4WXyzyjme4B3DHX6C7+Qc/Av4DMZyf3kw3f8UAAAAASUVORK5CYII=" alt="">Error Message ：' + str + '</div>';
            var first = document.body.firstChild;//得到页面的第一个元素
            document.body.insertBefore(divObj, first);//在得到的第一个元素之前插入
            setTimeout(function () {
                document.body.removeChild(divObj)
            }, 2000);
            console.log(str);
        }
    };
    //API方法封装
    var ___plugin_api = {
        /**
         * 修改配置
         * @param configs
         */
        config(configs){
            for (var name in configs) {
                ___options[name] = configs[name]
            }
            return this;
        },
        check_is_super_app() {
          return ___unitl.check_is_app();
        },
        //H5与APP通信的方法
        request_app({}) {
            var age = arguments[0];
            if (___unitl.check_is_app()) {
                if (___options.debug) {
                    ___unitl.toast('通知APP成功');
                }
                if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { //判断iPhone|iPad|iPod|iOS
                    window.webkit.messageHandlers.wsy.postMessage(JSON.stringify(age));
                } else if (/(Android)/i.test(navigator.userAgent)) {  //判断Android
                    window.easyder_app.test(JSON.stringify(age))
                }
            } else {
                if (___options.debug) {
                    ___unitl.toast('通知APP成功');
                }
            }
        },
        //统一接收APP调用H5的指令
        receive_app_data: function (callback, data) {
            data = ___unitl.json2string(data);
            try {
                eval(callback + '( ' + data + ')');
            } catch (error) {
                if (___options.debug) {
                    ___unitl.toast('callback：' + callback + ' is not function');
                } else {
                    console.log('callback：' + callback + ' is not function')
                }
            }
        },
        /**
         * 调起APP授权登录动作
         * @param callback_name string APP获取授权信息后调用页面的方法名称,
         * 调用授权时
         */
        get_auth: function (callback_name, platform_num) {
            this.request_app({
                event: 'getAuthCode',
                callback: ___options.default_callback_name,
                value: {
                    platform_num: platform_num,
                    callback_name: callback_name
                }
            })
        },
        /**
         * 分享按钮配置
         */
        set_share(config){
            var options = {
                //weixin微信，weixin_pyq朋友圈，favorite收藏，qq，qzoneQQ 空间，copy_link复制链接，refresh刷新，complaint投诉，about_platform关于平台号，只在平台号
                btns: ['weixin', 'weixin_pyq', 'qq', 'qzone', 'favorite', 'copy_link', 'refresh', 'complaint', 'about_platform'],//所有可用按钮
                title: '',//分享标题
                description: '',//分享简介
                album: '',//分享图片
                url: '',//分享链接
                type: '',//类型,固定值，资讯用news,平台号文章用info,视频用video,第三方页面用h5,平台号用platform,个人主页用user
                is_collection: 0,//显示收藏按钮的时候。用来标识是用户是否已经收藏过该内容。如果没有。则默认0即未收藏状态

                platform_num: '',//平台号，投诉平台/查看关于平台号时，需要提供平台号
                platform_name: '',//平台名称，投诉平台时，需要提供平台号
                platform_image: '',//平台图片，投诉平台时，需要提供平台号

                user_id: '',//用户ID
                id: '0',//当前内容ID，平台号 / 新闻ID / 平台号 / 用户ID /

                // show_btns: ['weixin', 'weixin_pyq', 'copy_link', 'refresh', 'complaint', 'about_platform'],//需要显示的按钮。当前配置的默认按钮
                show_btns: ['weixin', 'weixin_pyq', 'qq', 'qzone', 'copy_link', 'refresh', 'complaint', 'about_platform'],//需要显示的按钮。当前配置的默认按钮
                weixin_callback: '',
                weixin_pyq_callback: '',
                qq_callback: '',
                qzone_callback: '',
            };
            //合并配置参数
            for (var name in config) {
                options[name] = config[name]
            }

            //将参数传给APP
            if (___unitl.check_is_app()) {
                this.request_app({
                    event: 'setShare',
                    callback: 'receive_app_data',
                    value: options
                });
                if (___options.debug) {
                    ___unitl.toast('通知APP成功')
                }
            } else {
                if (___options.debug) {
                    ___unitl.toast('不是APP')
                } else {
                    console.log('不是APP。')
                }
            }

        },
        //隐藏分享按钮
        hide_share(){
            this.request_app({
                event: 'hideShare',
                callback: '',
                value: {}
            })
        },

        //调起APP弹出登录界面
        app_to_login(){
            this.request_app({
                event: 'toLogin',
                callback: '',
                value: {}
            })
        },

        //保存单张图片
        save_image(img_link){
            this.request_app({
                event: 'saveImage',
                callback: '',
                value: {
                    img_url: img_link,
                }
            })
        },
        //保存单张图片
        save_image_list(img_link_list){
            try {
                if (!Array.isArray(img_link_list)) {
                    if (___options.debug) {
                        ___unitl.toast('参数格式错误')
                    }
                    return false;
                }
                img_link_list = JSON.stringify(img_link_list)
            } catch (error) {
                if (___options.debug) {
                    ___unitl.toast('参数格式错误')
                }
                return false;
            }
            this.request_app({
                event: 'saveImage',
                callback: '',
                value: {
                    img_list_url: img_link_list
                }
            })
        },


        /**
         * 获取APP scheme IOS付款时用。
         * @param callback_name
         * APP调用 AppSdk.receive_app_data('callback_name',{"scheme":"......"})
         */
        get_scheme: function (callback_name) {
            this.request_app({
                event: 'getScheme',
                callback: ___options.default_callback_name,
                value: {
                    callback_name: callback_name
                }
            })
        },
    };


    //定义插件名称
    window.AppSdk = ___plugin_api;
})(window);