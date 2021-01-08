var express = require('express'),
         fs = require('fs'),
       path = require('path'),
      clean = require('var-clean').clean,
        pdf = require('html-pdf'),
    Promise = require('es6-promise').Promise;

function notFound(res){
    res.sendStatus(404);
    res.end();
}
function internalError(res){
    res.sendStatus(500);
    res.end();
}
function setHeader(res, filename){
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'inline; filename="' + filename + '"');
    res.header('Content-Transfer-Encoding', 'binary');
}
function optCleaner(opt) {
    opt = opt || {};
    opt.filename = clean.cleanOnlyString(opt.filename) || "file.pdf";
    opt.html = clean.cleanOnlyString(opt.html);
    opt.htmlContent = clean.cleanOnlyString(opt.htmlContent);
    opt.options = opt.options || {};
    opt.filePath = opt.filePath || {};
    return opt;
}
function sendHTMLPDF(res, filename, content, options){
    return new Promise(function(resolve, reject){
        setHeader(res, filename);
        pdf.create(content, options).toStream(function(err, stream){
            if(err){
                reject(err);
            }else{
                stream.pipe(res);
                stream.on('end', function(){
                    res.end();
                    resolve();
                })
            }
        });
    });
}
function savePDFFile(res, filePath, filename, content, options){
    return new Promise(function(resolve, reject){
        console.log(filePath+'/'+filename);
        pdf.create(content, options).toFile(filePath+'/'+filename, function(err, response){
            if(err){
                reject(err);
            }else{
                res.end();
                resolve();
            }
        });
    });
}

var _pdf = function(filename){
    var _this = this;
    return new Promise(function(resolve, reject){
        fs.stat(filename, function(err, stat){
            if(err){
                notFound(_this);
                return reject(filename + ' does not exists');
            }
            setHeader(_this, path.basename(filename));
            var stream = fs.createReadStream(filename);
            stream.pipe(_this);
            stream.on('end', function(){
                _this.end();
                resolve();
            });
            stream.on('error', function(error){
                reject(error);
            });
        });
    });
};

var _pdfFromHTML = function(opt) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        opt = optCleaner(opt);
        if(opt.html === undefined && opt.htmlContent === undefined){
            internalError(_this);
            return reject('html and htmlContent not set');
        }

        var optdata = opt.htmlContent || '';

        if(opt.html) {
            fs.readFile(opt.html, 'utf-8', function(err, data){
                if(err){
                    notFound(_this);
                    return reject(opt.html + ' does not exists');
                }
                optdata = data;
            });
        }

        sendHTMLPDF(_this, opt.filename, optdata, opt.options)
        .then(resolve, reject);
    });
};

var _savePDF = function(opt) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        opt = optCleaner(opt);
        if(opt.html === undefined && opt.htmlContent === undefined){
            internalError(_this);
            return reject('html and htmlContent not set');
        }

        var optdata = opt.htmlContent || '';

        if(opt.html) {
            fs.readFile(opt.html, 'utf-8', function(err, data){
                if(err){
                    notFound(_this);
                    return reject(opt.html + ' does not exists');
                }
                optdata = data;
            });
        }

        savePDFFile(_this, opt.filePath, opt.filename, optdata, opt.options)
        .then(resolve, reject);
    })
}

function PDF(req, res, next){
    res.pdf = _pdf;
    res.pdfFromHTML = _pdfFromHTML;
    res.htmlToFile = _savePDF;
    next();
}

exports = module.exports = PDF;
