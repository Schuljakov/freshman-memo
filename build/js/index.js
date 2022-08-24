window.onload = () => {
    const mediaQuery = window.matchMedia('(max-width: 1100px)');
    if (mediaQuery.matches) transformColumnView(mediaQuery);
    mediaQuery.addListener(transformColumnView);

    function transformColumnView(e) {
        let articles = document.getElementsByClassName("memo-article-block__content");

        if (e.matches) {
            for (let article of articles) {

                let columns = article.getElementsByClassName("memo-article-block__content-column");
                let blocks = [];
                for (let column of columns) {
                    for (let child of column.childNodes) {
                        if (child.nodeType == 1) {
                            blocks.push(child);
                        }
                    }
                }
                blocks.sort((contentBox1, contentBox2) => {
                    return contentBox1.dataset.order - contentBox2.dataset.order;
                });

                article.innerHTML = "";

                let column = document.createElement("div");
                column.classList.add("memo-article-block__content-column");

                for (let child of blocks) {
                    column.append(child);
                }

                article.appendChild(column);
            }
        }
        else {
            for (let article of articles) {
                let column = article.firstChild;

                let leftSide = [];
                let rightSide = [];

                for (let block of column.childNodes) {
                    if (block.dataset.side == "left") leftSide.push(block);
                    else rightSide.push(block);
                }
                article.innerHTML = "";

                let columnLeft = document.createElement("div");
                columnLeft.classList.add("memo-article-block__content-column");
                let columnRight = document.createElement("div");
                columnRight.classList.add("memo-article-block__content-column");

                leftSide.forEach((element) => columnLeft.appendChild(element));
                rightSide.forEach((element) => columnRight.appendChild(element));

                article.appendChild(columnLeft);
                article.appendChild(columnRight);
            }
        }
    }

    function backToTop() {
        console.log("123")
        if (window.pageYOffset > 0) {
          window.scrollBy(0, -80);
          setTimeout(backToTop, 0);
        }
    }

    document.getElementsByClassName("memo-nav-button_control")[0].addEventListener("click", function (e) {
        e.preventDefault();
        backToTop();
    })
}