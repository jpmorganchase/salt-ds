"use strict";
const glob = require("glob");
const path = require("path");
const execaSync = require("execa").sync;

const componentNames = glob
  .sync("./packages/*/src/!(__tests__|*-context)/")
  .map((name) => path.basename(name).replaceAll("-", ""))
  .filter((name) => name);

const dependencies = execaSync("yarn", [
  "info",
  "--name-only",
  "-R",
  "--all",
  "--json",
])
  .stdout.split(/\r?\n/)
  .map((line) => {
    return Array.from(line.matchAll(/"(.*)@/g))[0][1];
  });

module.exports = {
  language: "en-US",
  useGitignore: true,
  caseSensitive: false,
  dictionaries: [
    "softwareTerms",
    "typescript",
    "html",
    "css",
    "lorem-ipsum",
    "html-symbol-entities",
    "fullstack",
  ],
  words: [
    "uitk",
    "jpmorganchase",
    "jpmuitk",
    "turbosnap",
    "prefixer",
    "zindex",
    "wcag",
    "xdescribe",
    "classname",
    "webfonts",
    "typecheck",
    "spacebar",
    "componentry",
    "disableable",
    "overlayable",
    "interactable",
    "overflowable",
    "pushable",
    "stackable",
    "resizeable",
    "reorderable",
    "deselectable",
    "stackoverflow",
    "testid",
    "divs",
    "popout",
    "docgen",
    "argstable",
    "Atrule",
    "ts-nocheck", // Issues in theme-editor mean this is necessary
    "relocator",
    "sharktooth",
    "resetwrapper",
    "docsblock",
    "chainer",
    "minichart",
    "accname",
    "subcomponents",
    "pageerror",
    "overscan",
    "multipass",
    "outdir",
    "vcard",
    "storysource",
    "moines",
    "paulo",
    "mediumlight",
    "marana",
    "kolkata",
    "unalaska",
    "nightmute",
    "flexitem",
    "flexlayout",
    "flowlayout",
    "decklayout",
    "borderitem",
    "borderlayout",
    "griditem",
    "gridlayout",
    "layerlayout",
    "splitlayout",
    "stacklayout",
    "parentchildlayout",
    "tooltray",
    "tabstrip",
    "appbar",
    "niblings",
    "dragobject",
    "droptarget",
    "deleter",
    ...componentNames,
    ...dependencies,
  ],
};
