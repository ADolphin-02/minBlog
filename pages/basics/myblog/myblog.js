var app = getApp()
const request = require('../../../utils/request.js');
let util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    isFocus:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var openId = app.globalData.openId
    var token = app.globalData.token
    var url = app.globalData.url+'/wx/wxLoadArticleByOid/'+openId
    request.requestGetApi(url,token,'',this,this.successArticle,this.failArticle)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //删除弹窗
  showModal(e) {
    this.setData({
      modalName: 'RadioModal', // 显示弹窗
      articleId:e.currentTarget.dataset.id, // 弹窗id
      picture:e.currentTarget.dataset.picture, // 预览图
      message: e.currentTarget.dataset.message // 公开或私密
    })
  },
  hideModal(e) {
    this.setData({
      articleId: 0, 
      modalName: null,
      message:null
    })
  },
  deleteArticle(e){
    var that = this
    wx.showModal({
      title: '提示',
      content: '你确定要删除此文章吗?',
      success (res) {
        if (res.confirm) {
          var url = app.globalData.url+'/wx/deleteArticleById'; 
          var urlPic = app.globalData.url+'/wx/removePicture'; 
          var token = app.globalData.token;
          var parm = {articleId:that.data.articleId}
          var oldPicture = {oldPicture:that.data.picture}
          // @do 文章和评论一起删除
          request.requestGetApi(url,token,parm,that,function(res){
            that.hideModal()
            var openId = app.globalData.openId
            var ArticleUrl = app.globalData.url+'/wx/wxLoadArticleByOid/'+openId
            request.requestGetApi(ArticleUrl,token,'',that,that.successArticle,that.failArticle)
          },
          function(res){
            console.log('删除失败 ')
          })
          // @do 删除预览图
          request.requestGetApi(urlPic,token,oldPicture,that,function(res){
            that.hideModal()
          },
          function(res){
            console.log('删除失败 ')
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
   
  },
  // 修改文章公开或私密
  messageArticle(e){
    console.warn(this.data.articleId)
  },
  // tab
  tabSelect(e) {
    var url = e.currentTarget.dataset.url
    this.randomNum();
    this.setData({
      postList: [],
    });
    var urlPostList = app.globalData.url + url;
    var token = app.globalData.token;
    console.warn(e.currentTarget.dataset.id);
    var params = {};

    //@todo 文章内容网络请求API数据
    request.requestGetApi(urlPostList, token, params, this, this.successPostList, this.failPostList);

    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    });
  },
  focus(e){
    // console.log(e.currentTarget.dataset)
    var articleId = e.currentTarget.dataset.id
    this.setData({
      isFocus:true,
      articleId: articleId// 为了显示选中效果
    })
    wx.navigateTo({
      url: '../article/article?articleId='+articleId,
    })
  },
  successArticle(res, selfObj){
    var list = res.data
    for (let i = 0; i < list.length; ++i) {
      list[i].img = list[i].img.replace(/\\/g, '/')
      list[i].createTime = util.customFormatTime(list[i].createTime, 'M-D/h:m');
      }
    for (let i = 0; i < list.length; ++i) {
      list[i].time = list[i].createTime.replace(/.+\//g,'')
      list[i].day = list[i].createTime.replace(/\/.+/g,'')
      }
    this.setData({
      articleList: list
    })
  },
  failArticle(res, selfObj){
    console.error('failArticle', res)
  }
})