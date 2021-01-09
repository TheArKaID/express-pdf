var express = require('express');
var path = require('path');

app = express();
app.use(require('../index.js'));
app.get('/test/1', function(req, res){
    res.pdf(path.resolve(__dirname, './fixture/test.pdf'));
});

app.get('/test/2', function(req, res){
    res.pdfFromHTML({
        filename: 'file.pdf',
        html: path.resolve(__dirname, './fixture/test.html')
    });
});

app.get('/test/4', function(req, res){
    res.pdfFromHTML({
        filename: 'generated.pdf',
        htmlContent: '<html><body>ASDF</body></html>',
    });
});

app.get('/test/8', function(req, res){
    res.htmlToFile({
      filename: 'generated.pdf',
      htmlContent: '<html><body>ASDF</body></html>',
      filePath: './storage/pdf'
    })
});

var server = app.listen(8888);

exports.closeServer = function(){
    server.close();
};
