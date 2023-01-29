console.log("content-script.js")

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    
    let get_color = chrome.storage.local.get(["string_color", "background_color"])

    get_color.then(event => {
        if (event.string_color) {
            string_color = event.string_color;
        }
        if (event.background_color) {
            background_color = event.background_color;
        }
    })

    console.log("receive message v8")
    console.log(message.action)
    if (message.action === "emphasize_visited_links") {
        
        let link_elements = Array.from(document.querySelectorAll("a"))
        let link_list = link_elements.map(x => x.href);
        let cleaned_list = link_list.map(x => {
            const xx = new URL(x)
            return xx.pathname ? `${xx.origin}${xx.pathname}` : xx.origin
        })
        const query_list = [...(new Set(cleaned_list))]

        console.log("send links at content")
        let sendsearchlinks = chrome.runtime.sendMessage(
            {
                "process": "search_links",
                "link_list": query_list
            }
        );
        sendsearchlinks.then(res => {
            console.log(res);
            let target_links = link_elements.filter(x => res.links.includes(x.href))
            console.log(target_links)
            target_links.forEach(x => {
                x.style.backgroundColor = background_color
                x.style.color = string_color
            })

            console.log("receive links at content");
        }
        ).catch(error => {
            console.log(error);
        })
        console.log("end of process")
        };
    }
);
