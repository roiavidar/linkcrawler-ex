(function() {
    "use strict";

    function LinkTree() {
        var linkTree = {
                link: undefined,
                children: []
            },
            linkPendingRequests = {};

        function build(link) {
            linkTree.link = link;
            getHtml(linkTree, 0);
        }

        function getHtml(linkObj, linkLevel) {
            if (linkLevel < 5) {
                var xhr = new XMLHttpRequest();
                xhr.addEventListener("load", createLinkNode.bind(xhr, linkObj, linkLevel));
                xhr.open("GET", linkObj.link);
                xhr.send();
                linkPendingRequests[linkObj.link] = "pending";
            }
        }

        function createLinkNode(parentLinkObj, linkLevel) {
            var linkRegex = /<a href=("[^#].+")>(.+)<\/a>/g,
                htmlText = this.responseText,
                result,
                link,
                title,
                newLinkObj;

            if (parentLinkObj.link !== undefined) {
                delete linkPendingRequests[parentLinkObj.link];
            }

            while (result = linkRegex.exec(htmlText)) {
                link = result[1].substring(1, result[1].length - 1);
                title = result[2];

                newLinkObj = updateLinkTree(parentLinkObj, link, title);
                getHtml(newLinkObj, linkLevel = linkLevel+1);
            }

            if (Object.keys(linkPendingRequests).length === 0) {
                saveToLocalStorage();
            }
        }

        function updateLinkTree(parentLinkObj, link, title) {
            var newLinkObj = {
                link: link,
                title: title,
                children: []
            };
            parentLinkObj.children.push(newLinkObj);
            return newLinkObj;
        }

        function saveToLocalStorage() {
            console.dir(linkTree);
            localStorage.setItem("linkTree", JSON.stringify(linkTree));
        }

        return {
            build: build
        };

    }

    document.addEventListener('DOMContentLoaded', LinkTree().build.bind(null, "exampleSite/index.html"));

})();