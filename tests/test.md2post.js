var rewire = require("rewire");
var assert = require("assert")

var Promise = require("bluebird");
describe('md2post', function(){
    describe('transforms', function(){
        it('success write a file', function(done){
            var md2post = rewire("../lib/md2post.js");
            var input = "inputfile.md";
            var output = "outputfile.md";
            var fsMock = {
                readFileAsync: function (path, encoding) {
                    return new Promise(function(f,r){
                        assert(path===input, "Input path should be correct");
                        f("Paragraph. " +
                        "\n> * bq Item 1 " +
                        "\n> * bq Item 2 " +
                        "\n>   * New bq Item 1 " +
                        "\n>   * New bq Item 2 " +
                        "\n>   Text here " +
                        "\n" +
                        "\n* * *");
                    });
                },
                writeFileAsync: function(path, data){
                    return new Promise(function(f,r){
                        assert(path==output, "Output path should be correct");
                        var expected = "<p>Paragraph. </p>\n" +
                            "<blockquote>\n" +
                            "<ul>\n" +
                            "<li>bq Item 1 </li>\n" +
                            "<li>bq Item 2 <ul>\n" +
                            "<li>New bq Item 1 </li>\n" +
                            "<li>New bq Item 2 \n" +
                            "Text here </li>\n" +
                            "</ul>\n" +
                            "</li>\n" +
                            "</ul>\n" +
                            "</blockquote>\n" +
                            "<hr>\n";

                        for(var i =0;i<expected.length;i++){
                            if (expected[i] != data[i]){
                                console.log("Diff at char:",i);
                            }
                        }

                        assert(data===expected,"Output should be correct");
                        f(true);
                        done();
                    });
                }
            };
            md2post.__set__("fsp", fsMock);
            return md2post.transform(input,output);
        });

        it('file failures reject properly', function(done){
            var md2post = require("../lib/md2post.js"); //no dep stub needed
            md2post.transform("fake", "fake").then(function(){
                assert(false);
            }).error(function(e){
                assert(true);
                done();
            })
        });
    })
})