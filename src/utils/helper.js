export let compareTitle = (a, b) => {
    if (a?.Title > b?.Title) {
        return 1;
    } else {
        return -1;
    }
};
export let compareStars = (a, b) => {
    if (a["My Rating"] > b["My Rating"]) {
        return -1;
    } else {
        return 1;
    }
};
export let compareAuthor = (a, b) => {
    if (a.Author > b.Author) {
        return 1;
    } else {
        return -1;
    }
};