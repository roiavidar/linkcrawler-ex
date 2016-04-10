(function() {
    "use strict";

    function LinkTree() {
        var linkTree = {
                link: undefined,
                children: []
            },
            linkRequests = {};

        function build(link) {
            linkTree.link = link;
            getHtml(link, linkTree, 0);
        }

        function getHtml(url, parentLinkObj, linkLevel) {
            if (linkLevel < 5) {
                var xhr = new XMLHttpRequest();
                xhr.addEventListener("load", createLinkTree.bind(xhr, url, parentLinkObj, linkLevel = linkLevel+1));
                xhr.open("GET", url);
                xhr.send();
                linkRequests[url] = "pending";
            }
        }

        function createLinkTree(currentLink, parentLinkObj, linkLevel) {
            var linkRegex = /<a href=("[^#].+")>(.+)<\/a>/g,
                htmlText = this.responseText,
                result,
                link,
                title,
                newLinkObj;

            if (parentLinkObj.link !== undefined) {
                delete linkRequests[parentLinkObj.link];
            }

            while (result = linkRegex.exec(htmlText)) {
                link = result[1].substring(1, result[1].length - 1);
                title = result[2];

                newLinkObj = updateLinkTree(parentLinkObj, link, title);
                getHtml(link, newLinkObj, linkLevel);
            }

            if (Object.keys(linkRequests).length === 0) {
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
            localStorage.setItem("linkTree", JSON.stringify(linkTree));
        }

        return {
            build: build
        };

    }

    document.addEventListener('DOMContentLoaded', LinkTree().build.bind(null, "exampleSite/index.html"));

})();