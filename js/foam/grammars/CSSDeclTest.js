/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.grammars',
  name: 'CSSDeclTest',

  requires: [ 'foam.grammars.CSSDecl' ],
  imports: [ 'assert' ],

  properties: [
    {
      type: 'foam.grammars.CSSDecl',
      name: 'css',
      defaultValue: ''
    }
  ],

  methods: [
    function testSetUp() {
      this.css = this.CSSDecl.create();
    },
    function testTearDown() {
      this.css = '';
    },
    function parseString(str, opt_production) {
      var production = opt_production || 'START';
      var p = this.css.parser;
      var ps = p.stringPS;
      ps.str = str;
      var res = p.parse(p[production], ps);

      return res;
    },
    function testProduction(production, posEg, opt_negEg) {
      var negEg = opt_negEg || [], results = [];
      var res, i;
      for ( i = 0; i < posEg.length; ++i ) {
        res = this.parseString(posEg[i], production);
        this.assert(res && typeof res.value === 'string' &&
            res.toString() === '',
                    'Expected parse from "' + posEg[i] + '" on production "' +
                        production + '"');
        results.push(res);
      }
      for ( i = 0; i < negEg.length; ++i ) {
        try {
          res = this.parseString(negEg[i], production);
          this.assert(!(res && res.value) || res.toString() !== '',
                      'Expected parse failure from "' + negEg[i] +
                          '" on production "' + production + '"');
          results.push(res);
        } catch (e) {
          results.push(res);
        }
      }
      return results;
    },
  ],

  tests: [
    {
      model_: 'UnitTest',
      name: 'Stylesheet',
      description: 'Test stylesheet production',
      code: function() {
        var posEgs = [
          '',
          'a;',
          ' a; ',
          'a{}',
          ' a {} ',
          'a .b{}',
          'a .b {}',
          'a .b #c {}',
          'a .b #c:d {}',
          'a .b #c:d e::f {}',
          'a;b{}',
          ' a ; b { } ',
          'a { b: c }',
          'a { b: c; }',
          'a { b{} }',
          'a { b #c:d e::f {} }',
          'a { b{ c{} } }',
          'a { b{ #c:d e::f {} } }',
          'a { b{ c{ d: e; f: g; } } }',
        ];
        var negEgs = [
          '}',
          ' }',
          ' } ',
          'a { b{} c; }',
          'a { b; c{} }',
          'a { b: c; d{} }',
        ];

        this.testProduction('stylesheet', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Stylesheet',
      description: 'Test declaration rewrite',
      code: function() {
        var prefixes = this.css.PREFIXES;
        var keys = this.css.PREFIXED_KEYS;
        var posEgs = [];
        var negEgs = [];
        var expected = [];
        Object_forEach(keys, function(v, k) {
          posEgs.push('a{' + k + ':' + v + '}');
          var exp = [];
          for ( var i = 0; i < prefixes.length; ++i ) {
            if ( v === true ) exp.push(prefixes[i] + k + ':' + v);
            else              exp.push(k + ':' + prefixes[i] + v);
          }
          expected.push(exp);
        });

        var results = this.testProduction('stylesheet', posEgs, negEgs);
        this.assert(results.length == expected.length, 'Expected number of ' +
            'results to match number of expectations');
        for ( var i = 0; i < results.length; ++i ) {
          for ( var j = 0; j < expected[i].length; ++j ) {
            this.assert(results[i].value.indexOf(expected[i][j]) >= 0,
                        'Expected parse value "' + results[i].value + '" to ' +
                            'contain "' + expected[i][j] + '"');
          }
        }
      }
    },
    {
      model_: 'UnitTest',
      name: 'Stylesheet',
      description: 'Test large stylesheet',
      code: function() {
        var posEgs = [
                    multiline(function() {/*
html, body {
  margin: 0px;
  padding: 0px;
}

body {
  font-family: Roboto, "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif;
  font-size: 12px;
}
p, h1, form, button {
  border: 0;
  margin: 0;
  padding: 0;
}

.spacer {
  clear: both;
  height: 1px;
}

.foamform {
  margin: 0 auto;
  width: 450px;
  padding: 14px;
}

.stackview {
  width: 100%;
}

.stackview-viewarea {
  width: 100%;
}

.stackview-previewarea {
  height: 100%;
}

.stackview-previewarea .actionToolbar {
  display: none;
}

.stackview-slidearea {
  background: white;
  box-shadow: 0px 0px 30px black;
  height: 100%;
  position: fixed;
  z-index: 4;
}

.stackview-dimmer {
  background: black;
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s;
}


.detailView {
  display: table;
  border: solid 2px #dddddd;
  background: #fafafa;
  width: 99%;
}

.detailView .heading {
  float: left;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.detailView .propertyLabel {
  font-size: 14px;
  display: block;
  font-weight: bold;
  text-align: right;
  float: left;
}

.detailView input {
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 0px 10px;
}

.detailView textarea {
  float: left;
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 0px 10px;
  width: 98%;
  overflow: auto;
}

.detailView select {
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 0px 10px;
}

.detailView .label {
  vertical-align: top;
}

.detailArrayLabel {
  font-size: medium;
}

.detailArrayLabel .foamTable {
  margin: 1px;
  width: 99%;
}


.summaryView {
  background: white;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.summaryView .table {
  table-layout: fixed;
}

.summaryView td: first-child { width: 50px; }

.summaryView .label{
  font-size: 14px;
  display: block;
  font-weight: bold;
  text-align: right;
  width: 120px;
  float: left;
}

.summaryView .value{
  float: left;
  font-size: 12px;
  padding-left: 8px;
  margin: 2px 15px 2px 0px;
}


.foamSearchView select{
  font-family: 'Courier New', Courier, monospace;
}

.helpView {
  width: 100%;
}

.helpView .intro{
  padding-top: 10px;
  font-size: 16px;
  font-weight: bold;
}

.helpView .label{
  padding-top: 10px;
  font-size: 14px;
  font-weight: bold;
}

.helpView .text{
  width: 100%;
  font-size: 14px;
  padding-left: 8px;
  margin: 2px 15px 2px 0px;
}

.actionBorder {
  width: 95%;
}

.actionToolbar {
  float: right;
}

.actionBorderActions {
  padding-right: 15px;
  text-align: right;
}

.ActionMenuPopup {
  position: absolute;
  width: 150px;
  border: 2px solid grey;
  background: white;
}

.ActionMenu .actionButton {
  background: white;
  border: none;
  border-radius: 0;
  text-align: left;
  width: 100%;
}

.imageView {
  display: inline-block;
}

#stylized {
  border: solid 2px #b7ddf2;
  background: #ebf4fb;
}
#stylized h1 {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}
#stylized p{
  font-size: 11px;
  color: #666666;
  margin-bottom: 20px;
  border-bottom: solid 1px #b7ddf2;
  padding-bottom: 10px;
}
#stylized label{
  display: block;
  font-weight: bold;
  text-align: right;
  width: 140px;
  float: left;
}
#stylized .small{
  color: #666666;
  display: block;
  font-size: 11px;
  font-weight: normal;
  text-align: right;
  width: 140px;
}
#stylized input{
  float: left;
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 20px 10px;
  width: 200px;
}
#stylized button{
  background: #666666;
  clear: both;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: bold;
  height: 31px;
  line-height: 31px;
  margin-left: 150px;
  text-align: center;
  width: 125px;
}


.foamTable {
  background: #fff;
  border-collapse: collapse;
  font-family: Roboto, "Lucida Sans Unicode", "Lucida Grande", Sans-Serif;
  font-size: 12px;
  margin: 10px;
  table-layout:fixed;
  text-align: left;
  width: 98%;
}
.BookmarkTable {
  width: 800px;
}
.foamTable caption {
  font-size: 16px;
  font-weight: bold;
  color: #039;
  padding: 10px 8px;
  text-align: left;
}
.foamTable th {
  font-size: 14px;
  font-weight: normal;
  color: #039;
  padding: 10px 8px;
  border-bottom: 2px solid #6678b1;
}
.foamTable td {
  color: #669;
  padding: 4px 8px 4px 8px;
}
.foamTable tbody tr:hover td {
  color: #009;
  background: #eee;
}
.foamTable tbody tr.rowSoftSelected td {
  color: #009;
  background: #eee;
}
.foamTable tr.rowSelected {
  color: #900;
  background: #eee;
  border: 2px solid #f00;
}
.foamTable .numeric {
  text-align: right;
}

button.actionButton {
  -webkit-box-shadow: inset 0 1px 0 0 #ffffff;
  box-shadow: inset 0 1px 0 0 #ffffff;
  background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #dfdfdf) );
  background: -moz-linear-gradient( center top, #ededed 5%, #dfdfdf 100% );
  background-color: #ededed;
  -moz-border-radius: 3px;
  -webkit-border-radius: 3px;
  border-radius: 3px;
  border: 1px solid #dcdcdc;
  display: inline-block;
  color: #777777;
  font-family: arial;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 16px;
  text-decoration: none;
  visibility: hidden;
}

button.actionButton.available {
  visibility: visible;
}

button.actionButton:hover {
  background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #dfdfdf), color-stop(1, #ededed) );
  background: -moz-linear-gradient( center top, #dfdfdf 5%, #ededed 100% );
  background-color: #dfdfdf;
}

.actionButton img {
  vertical-align: middle;
}

.scrollSpacer {
  height: 52;
}

.foamTable td,
.foamTable th,
.summaryView td,
.summaryView th,
.detailView td,
.detailView th {
  white-space: nowrap;
  overflow: hidden;
  text-overflow:ellipsis;
}

select {
  background-color:rgb(240,240,240);
  margin-bottom: 15px;
}

.foamSearchViewLabel {
  margin-top: 5px;
  padding-left: 4px;
}

.searchTitle {
  color:#039;
  font-size: 16px;
  padding-left: 5px;
}

.messageBody {
  white-space: normal;
}

.summaryView table {
  width: 100%;
}

.summaryView .label[colspan="2"] {
  width: 100%;
}

.summaryView .label {
  width: 30%;
}

div.gridtile td div a {
  color: #000;
  text-decoration: none;
  white-space: normal;
}

div.gridtile {
  width: 10em;
  float: left;
  margin: 2px;
}

div.gridtile {
  border: 2px solid #c3d9ff;
  border-radius: 6px;
  padding: 1px;
}

div.gridtile td.id {
  width: 5em;
  text-align: left;
  margin-left: 4px;
}

div.gridtile td.id a {
  margin-left: 4px;
}

div.gridtile td.status {
  font-size: 11px;
  text-align: right;
  width: 70%;
}

div.gridtile table, div.projecttile table {
  width: 100%;
  table-layout: fixed;
}

div.gridtile td, div.projecttile td {
  border: 0;
  padding: 2px;
  overflow: hidden;
  font-family: arial, sans-serif;
  font-size: 13px;
  font-style: normal;
}

div.gridtile td div {
  height: 5.5ex;
  font-size: 90%;
  line-height: 100%;
}

div.gridViewControl {
  padding: 5px;
  background: rgb(235, 239, 249);
  border-color: rgb(187, 187, 187);
  border-style: solid;
  border-width: 1px;
}

div.gridViewControl select {
  margin-bottom: 6px;
  font-family: arial, sans-serif;
  font-size: 10px;
  font-style: normal;
  font-variant: normal;
  font-weight: normal;
  color: rgb(0, 0, 0);
  outline-color: rgb(223, 215, 207);
  background-color: rgb(221, 221, 221);
}

.gridBy th {
  background: #eeeeee;
  border: 1px solid #ccc;
  border-spacing: 2px;
  font-family: arial, sans-serif;
  font-size: 13px;
  font-style: normal;
  font-variant: normal;
  font-weight: bold;
  padding: 2px;
  text-align: left;
}

.gridBy td {
  vertical-align: top;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 4px;
}

.idcount {
  color: #0000cc;
  text-decoration: underline;
  font: 82% arial,sans-serif;
}

.idlist {
  color: #0000cc;
  text-decoration: underline;
  font: 82% arial,sans-serif;
}


.buttonify {
  font-size: 100%;
  background: url("//ssl.gstatic.com/codesite/ph/images/button-bg.gif") repeat-x scroll left top #e3e3e3;
  background: -webkit-gradient(linear,0% 40%,0% 70%,from(#f9f9f9),to(#e3e3e3));
  background: -moz-linear-gradient(top,#fff,#ddd);
  vertical-align: baseline;
  padding: 1px 3px 1px 3px;
  border: 1px solid #aaa;
  border-top-color: #ccc;
  border-bottom-color: #888;
  border-radius: 3px;
  cursor: pointer;
  text-decoration: none;
}

.mode_button_active
{
  background: url("//ssl.gstatic.com/codesite/ph/images/button-bg.gif") repeat-x scroll left bottom #bbb;
  background: -webkit-gradient(linear,0% 40%,0% 70%,from(#e3e3e3),to(#f9f9f9));
  background: -moz-linear-gradient(top,#e3e3e3,#f9f9f9);
  border-color: #aaa;
}

.capsule_right {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.capsule_left {
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.altViewButtons {
  margin-right: 17px;
  float: right;
}

.arrayTileView {
  margin: 0;
  width: 100%;
  padding: 0px;
  display: inline-block;
  border-bottom: 2px inset;
}

.arrayTileItem {
  display: inline-block;
  list-style-type: none;
  margin: 2px 2px;
}

.arrayTileLastView {
  display: inline-block;
  margin: 0;
  list-style-type: none;
  vertical-align: 7px;
}

.listInputView {
  width: 100%;
  border: none;
  padding: 1px 0 1px 8px;
  outline: none;
  height: 36px;
}

.autocompleteListView {
  position: absolute;
  padding: 8px;
  margin: 0px;
  width: 300px;
  background: white;
  border-radius: 5px;
  border: 1px solid lightgrey;
  z-index: 10;
}

.autocompleteListItem {
  border: 1px solid transparent;
  border-radius: 3px;
  list-style-type: none;
  overflow: hidden;
}

.autocompleteSelectedItem {
  border: 1px solid #99e;
}

.richtext {
  overflow: hidden;
  position: relative;
}

.richtext iframe {
  background: white;
  height: 100%;
  position: absolute;
}

.dropzone {
  -webkit-box-orient: vertical;
  border: 4px dashed #ddd;
  box-sizing: border-box;
  color: #ddd;
  display: -webkit-box;
  font: 270% arial,sans-serif;
  height: 94%;
  margin: 7px;
  position: absolute;
  text-align: center;
  width: 95%;
  z-index: -1;
}

.dropzone .spacer {
  -webkit-box-flex: 1;
}

::-webkit-input-placeholder {
  color: #999;
  font-family: Arial;
  font-size: 13px;
  font-weight: normal;
}

.richtext .placeholder {
  color: #999;
  font-family: Arial;
  font-size: 13px;
  padding: 6px;
  position: absolute;
  z-index: 2;
}

.linkDialog {
  border: 1px solid;
  border-color: #bbb #bbb #a8a8a8;
  padding: 8px;
  z-index: 2;
  background: white;
}


.linkDialog .actionButton-insert {
  background: #4d90fe;
  border-radius: 3px;
  box-shadow: none;
  color: white;
  margin-left: 7px;
  padding: 10px 16px;
  text-shadow: none;
}

.linkDialog input  {
  height: 32px;
  padding-left: 8px;
  margin: 2px;
  border: 1px solid #d9d9d9 !important;
}

.linkDialog input[name="label"] {
  width: 99%;
}

.linkDialog th {
  font: normal 15px arial,sans-serif;
  padding-right: 10px;
}

.actionButton:disabled { color: #bbb; -webkit-filter: grayscale(0.8); }

.editColumnView {
  font-size: 80%;
  font-weight: normal;
  z-index: 2;
}
.editColumnView td {
  color: #0000cc;
  font-size: 80%;
  font-weight: normal;
  padding: 1px;
  text-align2: left;
}

.multiLineStringRemove {
  float: right;
}


.column {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
}

.expand {
  flex: 1 1 auto;
}

.rigid {
  flex: none;
}

.waiting * {
  cursor: wait;
  x-unused: white;
}

input.clickToEnableEdit:not(:focus) {
  border: none;
  background-color: inherit;
}

.galleryView {
  text-align: center;
}

.galleryView .swipeAltInner {
  overflow: hidden;
}

.galleryCirclesOuter {
  float: left;
  text-align: center;
  position: relative;
  width: 100%;
  bottom: 20px;
}

.galleryCircle {
  display: inline-block;
  margin: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #aaa;
}

.galleryCircle.selected {
  background-color: #333;
}

.galleryImage {
  width: 100%;
}

.foamTest {
  border: 1px solid black;
  border-radius: 5px;
  line-height: 150%;
  margin: 2px;
  padding: 6px;
}

.foamTestPassed {
  background-color: #cfc;
}

.foamTestFailed {
  background-color: #fcc;
}

.foamInnerTests {
  padding-left: 10px;
}

.foamTestOutput {
  background-color: #e3e3e3;
  margin: 4px;
  padding: 5px;
}

@media not print {

  @media (max-width: 800px) {

    book-title {
      border: 2px solid rgba(0,0,0);
      font-weight: bold;
      font-size: 40px;
      margin-top: 15px;
    }

  }

  @media (min-width: 800px) {

    book-title {
      font-weight: bold;
      font-size: 50px;
      margin-top: 20px;
    }

  }

}

@import url(http://www.google.com);

@media print {

  book-title {
    font-weight: bold;
    font-size: 32pt;
    margin-top: 1in;
  }

}
          */}),
        ];
        var negEgs = [];

        this.testProduction('stylesheet', posEgs, negEgs);
      }
    },
  ]
});