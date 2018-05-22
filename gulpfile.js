/* universal (全体に適用する gulp plugin loadプラグイン対象をコメントアウト)
 ---------------------------------------------------------- */
var gulp   = require('gulp'); //gulp
var client = require('cheerio-httpcli');
var json2xls = require('json2xls');
var fs = require('fs-extra');


/* ----------------------------------------------------------
 function
 ---------------------------------------------------------- */
/* json2csv
 -----------------------------------------------------------*/
function json2csv(json) {
    var header = Object.keys(json[0]).join(',') + "\n";
    var body = json.map(function(d){
        return Object.keys(d).map(function(key) {
            return d[key];
        }).join(',');
    }).join("\n");
    return header + body;
}

/* dir の作成
 -----------------------------------------------------------*/
var outputDir = function (path) {
    if(Array.isArray(path)){
        path.forEach(function (v,i,a) {
            fs.mkdirsSync(path[i]);
        });
    }else{
        fs.mkdirsSync(path);
    }
};

/* ----------------------------------------------------------
 task
 ---------------------------------------------------------- */
/* scraping
 -----------------------------------------------------------*/
gulp.task('scraping', function() {

    // settings
    // -------------------------------- //
    //検索セレクタのルート body内を検索
    var searchRoot = 'body';
    //検索セレクタ
    var searchSelector = [
        'h1', // element
        'h2',
        '.author', // class
    ].join(',');

    //エクセルの出力先を設定
    var exportPath = './dest/scraping_data/';

    //検索URL設定
    var urlDomain = 'http://www.monosus.co.jp';
    var urlList = [
        '/posts/2017/12/200014.html', //ものさす記事をスクレイピング
        '/posts/2018/01/110949.html',
        '/posts/2018/02/023722.html'
    ];

    // 処理
    // -------------------------------- //

    //出力ディレクトリ作成
    outputDir(exportPath);
    // スクレイピング処理
    urlList.forEach(function (value) {
        client.fetch(urlDomain + value, {}, function (err, $, res) {
            if(err){
                console.log(urlDomain + value + ' のエラー');
            }else{
                console.log(urlDomain + value + ' を取得開始');
                var pageData = [];

                //対象のセレクタの処理ループ
                $(searchRoot).find(searchSelector).find('').remove();
                $(searchRoot).find(searchSelector).each(function (index) {
                    //セル情報を作成
                    var data = {
                      tag: $(this).prop('tagName'),
                      class: $(this).attr('class'),
                      text: $(this).text(),
                      src: $(this).attr('src'),
                      innerHtml: $(this).html()
                    };
                    //
                    pageData.push(data);
                });

                //書き出し
                var xls = json2xls(pageData);
                fs.writeFileSync(exportPath+value.replace(/^\//,'').replace(/\//g,'_')+'.xlsx', xls, 'binary');
            }
        });
    });
});