var request = require('request');
var cheerio = require("cheerio");
var URL = require("url-parse");

var startPage = "http://www.arstechnica.com";
var wordSearch = "nigger";
var maxPages = 10000;

var PagesVisited = {};
var NumPagesVisited = 0;
var PagesToVisit = [];
var url = new URL(startPage);
var baseUrl = url.protocol + "//" + url.hostname;
var results = [];



PagesToVisit.push(startPage);
crawl();

function crawl(){

    if(NumPagesVisited > maxPages){
        console.log("Max page amount visited...");
        console.log("Results: ");
        for (var i=0; i<results.length;i++){
            console.log(results[i]);
        }
        return
    }
    var nextPage = PagesToVisit.pop();
    if(nextPage in PagesVisited){
        crawl();
    }else {
        if(NumPagesVisited % 5 == 0){
            visitPage(nextPage, crawl);
            console.log("[-} Pages visited: " + NumPagesVisited + ", pages to visit: " + PagesToVisit.length);
        }else {
            visitPage(nextPage, crawl);
        }
    }
}

function visitPage(url, callback) {
    // Add page to our set
    PagesVisited[url] = true;
    NumPagesVisited++;

    // Make the request
    //console.log("now visiting page " + url);
    request(url, function(error, response, body) {
        if(response.statusCode !== 200) {
            callback();
            return;
        }
        // Parse the document body
        var $ = cheerio.load(body);
        var isWordFound = searchWord($, wordSearch);
        if(isWordFound) {
            console.log('[+] Word ' + wordSearch + ' found at page ' + url);
            results.push(url)
            collectLinks($);
            callback();
        } else {
            collectLinks($);
            callback();
        }
    });
}


function searchWord($, word){
    var bodyText = $("html > body").text().toLowerCase();
    return(bodyText.indexOf(word.toLowerCase()) !== -1);

}

function collectLinks($){
    var allAbsolute = [];
    var allRelative = [];

    var relativeLinks =$("a[href^='/']");

    //COLLECT RELATIVE
    relativeLinks.each(function (){
        allRelative.push($(this).attr('href'));
        PagesToVisit.push(baseUrl + $(this).attr('href'));
    })
    //COLLECT ABSOLUTE
    var absoluteLinks = $("a[href^='http']");
    absoluteLinks.each(function() {
        allAbsolute.push($(this).attr('href'));
    });

    console.log("[+] Found " + allRelative.length + " relative links to add" + " and " + allAbsolute.length + " absolute links" + "\r");

}