importScripts("page_service.js");

chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log("changes in ", areaName);
  console.log(changes);
  if (areaName === "local" && changes.pages !== undefined) {
    updateData();
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
          });
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
