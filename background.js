//console.log("background.js working")

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    //console.log("tabs.onUpdate v1")

    chrome.storage.local.get(['target_sites'], ret => {
        const this_site_origin = (new URL(tab.url)).origin
        if (ret.target_sites.includes(this_site_origin)) { // 登録外のウェブサイトは無視する

            if (changeInfo.status === 'complete' && tab.active && tab.url !== "chrome://newtab/") {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    //console.log("send message", tabs[0].id)
                    chrome.tabs.sendMessage(tabs[0].id, { action: "emphasize_visited_links" });
                });
            }
        }
    })
});

async function check_visited_urls(_link_list) {
    let visited_links = new Array()
    let func_list = new Array()

    for (let a_url of _link_list) {
        const getvisits = chrome.history.getVisits({ url: a_url });
        func_list.push(getvisits)
    }

    await Promise.allSettled(func_list).then(
        (visited_result) => {
            for (let [idx, result] of visited_result.entries()) {
                //console.log(result)
                if (result.status !== 'fulfilled') {
                    //console.log("error", _link_list[idx], result)
                }
                if (result.status === 'fulfilled' && result.value.length >= 1) {
                    visited_links.push(_link_list[idx])
                }
            }
        }
    );
    //console.log("visited_links", visited_links)
    return visited_links
}


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        //console.log("v4")

        if (request.process == "search_links") {
            //console.log(request.link_list)

            check_visited_urls(request.link_list).then(
                ret_list => {
                    //console.log(ret_list)
                    //console.log("send message from bg");
                    sendResponse({ "message": "succeed", "links": ret_list });
                }
            )
        }
        return true;
    }
);