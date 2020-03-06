//index.js
//获取应用实例
const app = getApp()
const request = require('../../../utils/request.js');
let util = require('../../../utils/util.js');
let touchDotX = 0;//X按下时坐标
let touchDotY = 0;//y按下时坐标
let interval;//计时器
let time = 0;//从按下到松开共多少时间*100

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    BlogName: app.globalData.BlogName,
    HaloUser: app.globalData.HaloUser,
    HaloPassword: app.globalData.HaloPassword,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: {},
    cardIdex: 1,
    randomNum: 0,
    animationTime: 1,
    moreFlag: false,
    pages: 0,
    cardCur: 0,
    TabCur: 0,
    scrollLeft: 0,
    Role: '游客',
    roleFlag: false,
    colourList: [{
      colour: 'bg-red'
    }, {
      colour: 'bg-orange'
    }, {
      colour: 'bg-yellow'
    }, {
      colour: 'bg-olive'
    }, {
      colour: 'bg-green'
    }, {
      colour: 'bg-cyan'
    }, {
      colour: 'bg-blue'
    }, {
      colour: 'bg-purple'
    }, {
      colour: 'bg-mauve'
    }, {
      colour: 'bg-pink'
    }, {
      colour: 'bg-lightBlue'
    }],
    
    enablePullDownRefresh: true
  },
  /**
   * 监听屏幕滚动 判断上下滚动
   */
  onPageScroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    if (app.globalData.userInfo != null) {
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
          hasUserInfo: true,
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
    var that = this;
    // 是游客还是其他
  },
  onLoad: function () {

    let _this = this;
    app.login().then(function (res) {
      var urlAdminLogin = app.globalData.url + '/wx/login';
      var data;

      var token = res.data.data
      var urlPostList = app.globalData.url + '/wx/loadAllArticle'
      var paramBanner = {}//limit: 5 
      // @todo 文章Banner网络请求API数据
      request.requestGetApi(urlPostList, token, paramBanner, this, _this.successBanner, _this.failBanner);
      var params = {};
      // @todo 文章列表网络请求API数据
      request.requestGetApi(urlPostList, token, params, this, _this.successPostList, _this.failPostList);
    })
        // @todo 获取后台token网络请求API数据
        // request.requestPostApi(urlAdminLogin, token, {}, this, this.successAdminLogin, this.failAdminLogin);
  },
  getUserInfo: function (e) {
    var that = this;
    // 拒绝获取个人资料时候
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      that.setData({
        hasUserInfo: false,
        Role: '游客',
        roleFlag: false,// 不知道
      })
    } else {
      app.globalData.userInfo = e.detail.userInfo;
      that.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      })
      //userInfo存储到storage
      wx.setStorage({
        key: 'userInfo',
        data: e.detail.userInfo,
        success: function (result) {
          console.log(result, 'userInfo写入缓存')
        }
      })
      var that = this;
      // 发送给后台服务器
      that.login(e.detail.userInfo)
    }
  },
  // 保存用户信息和更新token
  login(userInfo) {
    wx.login({
      success: (res) => {
        userInfo['code'] = res.code// 添加code
        var token = app.globalData.token; // 用app()的token
        var params = userInfo;
        var urlLink = app.globalData.url + '/wx/login';
        wx.showLoading({
          title: '努力加载中...',
        })
        request.requestPostApi(urlLink, token, params, this, this.successAdminLogin, this.failAdminLogin)
      }

    })
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
    var token = app.globalData.token
    var params = {};
    var urlLink = app.globalData.url + '/wx';
    request.requestPostApi(urlLink, token, params, this, this.checkSuccess, this.checkFail)

  },
  DotStyle(e) {
    this.setData({
      DotStyle: e.detail.value
    })
  },
  // cardSwiper 轮播图
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  // towerSwiper
  // 初始化towerSwiper
  towerSwiper(name) {
    let list = this.data[name];
    for (let i = 0; i < list.length; i++) {
      list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
      list[i].mLeft = i - parseInt(list.length / 2)
    }
    this.setData({
      swiperList: list
    })
  },
  // towerSwiper触摸开始
  towerStart(e) {
    this.setData({
      towerStart: e.touches[0].pageX
    })
  },
  // towerSwiper计算方向
  towerMove(e) {
    this.setData({
      direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
    })
  },
  // towerSwiper计算滚动
  towerEnd(e) {
    let direction = this.data.direction;
    let list = this.data.swiperList;
    if (direction == 'right') {
      let mLeft = list[0].mLeft;
      let zIndex = list[0].zIndex;
      for (let i = 1; i < list.length; i++) {
        list[i - 1].mLeft = list[i].mLeft
        list[i - 1].zIndex = list[i].zIndex
      }
      list[list.length - 1].mLeft = mLeft;
      list[list.length - 1].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    } else {
      let mLeft = list[list.length - 1].mLeft;
      let zIndex = list[list.length - 1].zIndex;
      for (let i = list.length - 1; i > 0; i--) {
        list[i].mLeft = list[i - 1].mLeft
        list[i].zIndex = list[i - 1].zIndex
      }
      list[0].mLeft = mLeft;
      list[0].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    }
  },
  showModal(e) {
    console.log(e);
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  tabSelect(e) {

    this.randomNum();
    this.setData({
      postList: [],
    });
    var urlPostList = app.globalData.url + '/api/content/posts';
    var token = app.globalData.token;
    console.warn(e.currentTarget.dataset.id);
    var params = {
      page: e.currentTarget.dataset.id,
      size: 10,
      sort: 'createTime,desc',
    };


    //@todo 文章内容网络请求API数据
    request.requestGetApi(urlPostList, token, params, this, this.successPostList, this.failPostList);

    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    });
  },
  //炫图模式
  switchSex: function (e) {
    // console.warn(e.detail.value);
    app.globalData.skin = e.detail.value
    console.log(app.globalData.skin,'炫图模式')
    this.setData({
      skin: e.detail.value
    });
  },
  // 首页背景图 触摸开始事件
  touchStart: function (e) {
    console.warn(e);
    touchDotX = e.touches[0].pageX; // 获取触摸时的原点
    touchDotY = e.touches[0].pageY;
    // 使用js计时器记录时间    
    interval = setInterval(function () {
      // console.log(time)
      time++;
    }, 100);

  },
  // 触摸结束事件
  touchEnd: function (e) {
    let touchMoveX = e.changedTouches[0].pageX;
    let touchMoveY = e.changedTouches[0].pageY;
    let tmX = touchMoveX - touchDotX;
    let tmY = touchMoveY - touchDotY;
    if (time < 20) {
      let absX = Math.abs(tmX);
      let absY = Math.abs(tmY);
      if (absX > 2 * absY) {
        if (tmX < 0) {
          this.setData({
            modalName: null
          })
        } else {
          this.setData({
            modalName: "viewModal"
          })
        }
      }
      if (absY > absX * 2 && tmY < 0) {
        console.log("上滑动=====")
      }
    }
    clearInterval(interval); // 清除setInterval(官方)
    time = 0;
  },
  // 关闭抽屉
  shutDownDrawer: function (e) {
    this.setData({
      modalName: null
    })
  },
  //冒泡事件
  maopao: function (e) {
    console.log("冒泡...")
  },
  // 展示卡片
  showMask: function (e) {
    this.selectComponent("#authorCardId").showMask();
    this.shutDownDrawer();
  },

  //获取随机数
  randomNum: function () {
    var num = Math.floor(Math.random() * 10);
    this.setData({
      randomNum: num
    });
  },

  /**
   * 加载更多
   */
  loadMore: function () {

  },



  /**
   * 文章Banner请求--接口调用成功处理
   */
  successBanner: function (res, selfObj) {
    var that = this;
    var list = res.data;
    for (let i = 0; i < list.length; ++i) {
      list[i].img = list[i].img.replace(/\\/g, '/')
      // console.log(list[i].img,'把\变成/')
    }
    that.setData({
      bannerPost: list,
    });
  },
  /**
   * 文章Banner请求--接口调用失败处理
   */
  failBanner: function (res, selfObj) {
    console.error('failBanner', res)
  },


  /**
   * 文章列表请求--接口调用成功处理
   */
  successPostList: function (res, selfObj) {
    var that = this;

    var list = res.data;
    for (let i = 0; i < list.length; ++i) {
      list[i].img = list[i].img.replace(/\\/g, '/')
      // list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
    }
    if (res.data != "") {
      that.setData({
        postList: res.data,
        moreFlag: false,
        // pages: res.data.pages,
      });
    } else {
      that.setData({
        postList: res.data,
        moreFlag: true,
        // pages: res.data.pages,
      });
    }

  },
  /**
   * 文章列表请求--接口调用失败处理
   */
  failPostList: function (res, selfObj) {
    console.error('failPostList', res)
  },

  /**
   * 后台登入请求--接口调用成功处理
   */
  successAdminLogin: function (res, selfObj) {
    app.globalData.token = res.data;// 更新token
    wx.setStorage({
      key: 'token',
      data: res.data,
      success: function (result) {
        console.log(result, 'token写入缓存')
        wx.hideLoading()
      }
    })
    console.warn("获取个人信息成功，更新全局token")
    wx.hideLoading()
  },
  /**
   * 后台登入请求--接口调用失败处理
   */
  failAdminLogin: function (res, selfObj) {
    console.error('failAdminLogin', res)
  },


  /**
   * 搜索文章模块
   */
  Search: function (e) {
    var content = e.detail.value.replace(/\s+/g, '');
    // console.log(content);
    var that = this;
    that.setData({
      SearchContent: content,
    });
  },
  SearchSubmit: function (e) {
    // console.warn(this.data.SearchContent);

    var that = this;
    that.setData({
      postList: null,
    });

    var urlPostList = app.globalData.url + '/api/content/posts/search?sort=createTime%2Cdesc&keyword=' + this.data.SearchContent;
    var token = app.globalData.token;
    var params = {};


    //@todo 搜索文章网络请求API数据
    request.requestPostApi(urlPostList, token, params, this, this.successSearch, this.failSearch);
  },
  successSearch: function (res, selfObj) {
    var that = this;
    // console.warn(res.data.content);
    var list = res.data.content;
    for (let i = 0; i < list.length; ++i) {
      list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
    }
    if (res.data.content != "") {
      that.setData({
        postList: res.data.content,
        moreFlag: false,
        pages: res.data.pages,
      });
    } else {
      that.setData({
        postList: res.data.content,
        moreFlag: true,
        pages: res.data.pages,
      });
    }
  },
  failSearch: function (res, selfObj) {
    console.error('failSearch', res)
  },

  /**
  * 用户点击右上角分享
  */
  // onShareAppMessage: function () {
  //   return {
      // title: this.data.jinrishici,
      // path: app.globalData.url+'/pages/basics/index/index',
      // imageUrl: 'https://image.aquan.run/poster.jpg',
      // imageUrl: 'https://image.aquan.run/poster.jpg',
  //   }
  // },
})

