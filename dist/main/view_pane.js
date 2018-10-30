"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("atom");
const github_get_names = require("../github/get_names");
const github_issue = require("../github/github_issue");
//@ts-ignore
const etch = require("etch");
class MinskyEtchPane {
    //@ts-ignore
    constructor(props, children) {
        this.reposlug = github_get_names.getRepoNames();
        this.issue_number = props["issue_number"];
        this.promise_for_github_issue = github_issue.getGitHubIssue(this.reposlug[0], this.reposlug[1], this.issue_number);
        this.htmlcontainer = document.createElement("div");
        this.htmlcontainer.innerHTML = "Loading Issue information...";
        this.promise_for_github_issue.then(github_issue_result => {
            this.htmlcontainer.innerHTML = "\
      <style>p {\
        font-size: var(--editor-font-size);\
      }</style>";
            this.htmlcontainer.innerHTML += "<p>User <a href=" + github_issue_result.user.html_url + "><b>" + github_issue_result.user.login + "</b></a> wrote: </p>";
            this.htmlcontainer.innerHTML += github_issue_result.body;
            var promise_for_github_issue_comments = github_issue_result.getAllComments();
            promise_for_github_issue_comments.then(github_issue_comments_result => {
                for (var github_issue_comment_result of github_issue_comments_result) {
                    this.htmlcontainer.appendChild(document.createElement(github_issue_comment_result.body));
                }
            });
        });
        this.promise_for_github_issue.catch(github_issue_result => {
            this.htmlcontainer.innerHTML = "Failed to get issue info!";
            this.htmlcontainer.appendChild(document.createElement('div').innerHTML = github_issue_result.message);
        });
        etch.initialize(this);
    }
    getTitle() {
        return "Minsky Link #" + this.issue_number;
    }
    render() {
        return this.htmlcontainer;
    }
    //@ts-ignore
    update(props, children) {
        return etch.update(this);
    }
    async destroy() {
        await etch.destroy(this);
    }
}
exports.MinskyEtchPane = MinskyEtchPane;
class MinskyEtchPaneView {
    // @ts-ignore
    constructor(serializedState, uri) {
        this.element = document.createElement('div');
        this.uri = uri || "minsky://minsky-link/0";
        this.element.innerHTML = "Hello Minsky!<br>My URI is " + uri;
        var issue_number = parseInt(this.uri.split('/')[this.uri.split('/').length - 1]);
        console.log("Creating new Etch Renderer for issue #" + issue_number);
        this.internal_etch_renderer = new MinskyEtchPane({
            issue_number: issue_number
        }, []);
    }
    getTitle() {
        return this.internal_etch_renderer.getTitle();
    }
    getURI() {
        return this.uri;
    }
    serialize() {
        return {
            deserializer: "minsky-link/MinskyEtchPaneView"
        };
    }
    destroy() {
        this.element.remove();
    }
    getElement() {
        return this.internal_etch_renderer.render();
    }
}
exports.MinskyEtchPaneView = MinskyEtchPaneView;
atom.workspace.addOpener(uri => {
    console.log("Opener checking URI \"" + uri + "\"");
    if (uri.startsWith("minsky://")) {
        return new MinskyEtchPaneView(null, uri);
    }
});
//# sourceMappingURL=view_pane.js.map