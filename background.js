importScripts("page_service.js","password_service.js");



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateBlockRules") {
    updateData(); // Call updateData to re-apply the blocking rules
    sendResponse({ success: true });
  }
});


const updateData = async () => {
  chrome.declarativeNetRequest.getDynamicRules((previousRules) => {
    if (previousRules !== undefined) {
      const newRules = [];
      const updateBlocks = async () => {
        const blockUrls = await PageService.getPages();
        blockUrls.forEach((domain, index) => {
          newRules.push({
            id: index + 1,
            priority: 1,
            action: { type: "block" },
            condition: { urlFilter: domain.url, resourceTypes: ["main_frame"] },
          });
        });
      };
      updateBlocks()
        .then(() => {
          const previousRuleIds = previousRules.map((rule) => rule.id);
          const res = chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: previousRuleIds,
            addRules: newRules,
          },
        () => {
          chrome.tabs.query( {},(tabs) => {
            const changedTabs = newRules.map((rule)=> rule.condition.urlFilter)
            const oldtabs = previousRules.map((rule) => rule.condition.urlFilter )
            tabs.filter(x => {

            const a = new URL(x.url)

             return changedTabs.filter(x => !oldtabs.includes(x)).includes(a.origin) ||
                    oldtabs.filter(x => !changedTabs.includes(x) ).includes(a.origin)

            }).map(x => {
              chrome.tabs.reload(x.id)
            })
          });
        }
        );
        })
        .catch((err) => {
          console.log("error found", err);
        });
    } else {
      console.log("undefined");
    }
  });
};
updateData();
