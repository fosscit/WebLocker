/** @private */
const ENTRIES_KEY = "passwords";
/** Shared logic */
class PasswordService {
  static getEntries = () => {
    const promise = resolvePromise((resolve, reject) => {
      chrome.storage.local.get([ENTRIES_KEY], (result) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);

        console.log(result)
        const researches = result.passwords ?? [];
        resolve(researches);
      });
    });

    return promise;
  };

  static saveEntry = async (url,password) => {
    const entries = await this.getEntries()

    const pagelist = [];
    entries.forEach((site) => {
      pagelist.push(site.url);
    });

    if (pagelist.includes(url)) {
        console.log("page exists ")
      return;
    }

    const updatedEntries = [...entries, { url : url,password : password }];

    const promise = resolvePromise((resolve, reject) => {
    chrome.storage.local.set({ [ENTRIES_KEY]: updatedEntries }, async () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);

      // Send a message to background to update the blocking rules immediately
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        resolve(updatedEntries);
    });
  });

    return promise;
  };

  static validatePage = async (url,password) => {
    const entries = await this.getEntries()
    return entries.filter(x => x.url === url && x.password === password).length === 1
  }
  static detectPage = async (url) => {
    const entries = await this.getEntries()
    console.log(entries)
    return entries.filter(x => x.url === url ).length === 1
  }

  static removeEntry = async (url) => {
    const pages = await this.getEntries();
    const updatedPages = pages.filter((site) => site.url !== url);

    const promise = resolvePromise((resolve, reject) => {
      chrome.storage.local.set({ [ENTRIES_KEY]: updatedPages }, () => {

        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        resolve(updatedPages);
    });

    });

    return promise;
  };

 
}

const resolvePromise = (callback) => {
  const promise = new Promise((resolve, reject) => {
    try {
      callback(resolve, reject);
    } catch (err) {
      reject(err);
    }
  });
  return promise;
};

