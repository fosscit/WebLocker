/** @private */
const PAGES_KEY = "pages";
/** Shared logic */
class PageService {
  static getPages = () => {
    const promise = toPromise((resolve, reject) => {
      chrome.storage.local.get([PAGES_KEY], (result) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);

        const researches = result.pages ?? [];
        resolve(researches);
      });
    });

    return promise;
  };
  static detectpage = async (url) => {
    const pages = await this.getPages();
    console.log(pages.map((site) => site.url).includes(url), url);
    return pages.map((site) => site.url).includes(url);
  };

  static savePage = async (url) => {
    const pages = await this.getPages();

    const pagelist = [];
    pages.forEach((site) => {
      pagelist.push(site.url);
    });

    if (pagelist.includes(url)) {
      return;
    }

    const updatedPages = [...pages, { url }];

    const promise = toPromise((resolve, reject) => {
      chrome.storage.local.set({ [PAGES_KEY]: updatedPages }, async () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);

        // Send a message to background to update the blocking rules immediately
        chrome.runtime.sendMessage({ type: "updateBlockRules" }, (response) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          resolve(updatedPages);
        });
      });
    });

    return promise;
  };
  static removePage = async (url) => {
    const pages = await this.getPages();
    const updatedPages = pages.filter((site) => site.url !== url);

    const promise = toPromise((resolve, reject) => {
      chrome.storage.local.set({ [PAGES_KEY]: updatedPages }, () => {
        chrome.runtime.sendMessage({ type: "updateBlockRules" }, (response) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          resolve(updatedPages);
        });
      });
    });

    return promise;
  };

  static clearPages = () => {
    const promise = toPromise((resolve, reject) => {
      chrome.storage.local.remove([PAGES_KEY], () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);

        resolve();
      });
    });

    return promise;
  };
}

const toPromise = (callback) => {
  const promise = new Promise((resolve, reject) => {
    try {
      callback(resolve, reject);
    } catch (err) {
      reject(err);
    }
  });
  return promise;
};
