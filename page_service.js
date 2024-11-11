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

  static savePage = async (url) => {
    const pages = await this.getPages();
    const updatedPages = [...pages, { url }];

    const promise = toPromise((resolve, reject) => {
      chrome.storage.local.set({ [PAGES_KEY]: updatedPages }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        resolve(updatedPages);
      });
    });

    return promise;
  };
  static removePage = async (url) => {
    const pages = await this.getPages();
    const updatedPages = pages.filter((site) => site.url !== url);

    const promise = toPromise((resolve, reject) => {
      chrome.storage.local.set({ [PAGES_KEY]: updatedPages }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        resolve(updatedPages);
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
