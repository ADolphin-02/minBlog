//index.js
//获取应用实例
const app = getApp()
const TOKEN = "token"
const request = require('../../../utils/request.js');

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    motto: 'Hi 开发者！',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    // 登陆成功后才能生成token
    if(this.data.hasUserInfo == true){
      console.log('从缓存中找')
      // 1. 从缓存中取出token  2. 判断是否去出token
      const that = this
      const token = wx.getStorage({
        key: TOKEN,
        success(res) {
          that.check_token(res.data)
        },
        fail(res) {
          that.login()
        }
      })
    }
    
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.login(e.detail.userInfo);
  },
  login(userInfo){
    wx.login({
      success:  (res) => {
        userInfo['code'] = res.code// 添加code
        var token = app.globalData.token;
        var params = userInfo;
        var urlLink = app.globalData.url +'/wx/login';
        wx.showLoading({
          title: '努力加载中...',
        })
        request.requestPostApi(urlLink, token, params ,this, this.successSearch, this.failSearch)
      }

    })
  },
  
  // 校验token
  check_token(token){
    console.log("缓存中有")
    var params = { };
    var urlLink = app.globalData.url + '/wx';
    request.requestPostApi(urlLink, token, params, this, this.checkSuccess, this.checkFail)
  },
  // 写入缓存
  successSearch(res) {
    // 1. 取出token
    const token = res.data
    // 2. 存储在全局变量中
    app.globalData.token = token
    // 3. 存储到storage
    wx.setStorage({
      key: TOKEN,
      data: token,
      success: function (result) {
        console.log(result, '写入缓存')
        wx.hideLoading()
      }
    })
  },
  failSearch(res) {
    console.log("error")
  },

  checkSuccess(res){
    console.log(res)
    if(res.status == 500){
      wx.showModal({
        title: '提示',
        content: res.message || '网络错误！',
        showCancel: false
      })
    }
  },
  checkFail(res){
    console.log(res)
  },
  start() {
     wx.navigateTo({
       url: '/pages/basics/index/index'
    })

  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
    var token = app.globalData.token
      var params = {};
      var urlLink = app.globalData.url + '/wx';
      request.requestPostApi(urlLink, token, params, this, this.checkSuccess, this.checkFail)
  }
  
})
