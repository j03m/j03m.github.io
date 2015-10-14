#!/usr/bin/env node
"use strict";
var marked = require("marked");
var fs = require("fs");
var Promise = require("bluebird");
var fsp = Promise.promisifyAll(fs);
var markedP = Promise.promisify(marked);


function md2post(input) {
    marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
        //highlight: function (code, lang, callback) {
        //    pbp({lang: "js", format: "html"}, code).then(function (result) {
        //        callback(null, result.toString());
        //    }); //crash on reject
        //}
        highlight: function (code) {
            return require('highlight.js').highlightAuto(code).value;
        }

    });
    return markedP(input);
}

function transform(input, output) {
    return fsp.readFileAsync(input).then(function (rawFile) {
        return md2post(rawFile.toString());
    }).then(function (html) {
        return fsp.writeFileAsync(output, html);
    });
}

md2post.transform = transform;
module.exports = md2post;

if (!module.parent) {
    var argv = require("yargs").usage("Usage: $0 --input [path to input file] --output [path to output file]")
        .demand(["input", "output"])
        .argv;
    transform(argv.input, argv.output).then(function () {
        console.log("Success!");
        /*eslint-disable */
        process.exit(0);
        /*eslint-ensable */
    }).error(function (e) {
        console.log("Failed:", e);
        throw e;
    });
}