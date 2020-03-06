//app.js
const request = require('./utils/request.js');
const requestHandler = require('./utils/promise.js');

App({
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 判断何时执行登陆事件（更新登陆信息）
    // this.determineWhetherToRelogin();
    // 获取用户信息s
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              // if (this.userInfoReadyCallback) {
              //   this.userInfoReadyCallback(res)
              // }
            }
          })
        }
      }
    })
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        console.log(e)
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },
  login: function () {
    let that = this;
    return new Promise(function (resolve, reject) {
      wx.showLoading({
        title: '努力加载中...',
      })
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res.code) {
            // console.log('获取用户登录凭证：' + code);
            // ------ 发送凭证 ------
            /*
            * 通过code获取登录session
            */
            wx.request({
              url: that.globalData.url + '/wx/login',
              data: { code: res.code},
              method: 'post',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: function (res) {
                console.log(res)
                if (res.statusCode == 200) {
                  // 注意这里
                  resolve(res);
                  that.successAdminLogin(res.data.data)
                } else {
                  console.log(res.errMsg)
                }
              },
            })
          } else {
            console.log('获取用户登录失败：' + res.errMsg);
          }
        }
      })
    })
  },
   
  /**
   * 后台登入请求--接口调用成功处理
   */
  successAdminLogin: function (res, selfObj) {
    var that = this;
    // 1. 取出token
    const token = res
    // 2.存储在全局变量中
    this.globalData.token = token;
    // 3.存储到storage
    wx.setStorage({
      key: 'token',
      data: token,
      
      success: function (result) {
        console.log(result, 'app().js,token全局和缓存都有')
        wx.hideLoading()
      }
    })
  },
  /**
   * 后台登入请求--接口调用失败处理
   */
  failAdminLogin: function (res, selfObj) {
    console.error('failAdminLogin', res)
  },
  globalData: {//全局变量
    userInfo: null,
    skin: null, // 炫图模式
    roleFlag: false,
    url: "http://127.0.0.1:8089",//http://localhost:8090
    BlogName: "一只海豚",
    token: "",// 在app加载时候获取，缓存也有
    highlightStyle: "dracula", //代码高亮样式，可用值default,darcula,dracula,tomorrow
  }
})