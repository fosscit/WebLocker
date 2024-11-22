document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  const addButton = document.getElementById("addSitesConfirm");
  const currentAddButton = document.getElementById("currentWebsiteBlockButton");
  const deleteButton = document.getElementById("deleteSitesConfirm");
  const addSiteInput = document.getElementById("addSites");
  const deleteSiteInput = document.getElementById("deleteSites");
  const siteListDiv = document.getElementById("listSites");

  console.log("Elements:", addButton, addSiteInput, siteListDiv);

  displaySites();

  addButton.addEventListener("click", async () => {
    const site = addSiteInput.value.trim();
    if (site) {
      await PageService.savePage(site);
      addSiteInput.value = "";
      displaySites();
    }
  });
  currentAddButton.addEventListener("click", async () => {
    await fetchAndBlockCurrentSite();
    displaySites();
  });
  deleteButton.addEventListener("click", async () => {
    const siteToDelete = deleteSiteInput.value.trim();
    if (siteToDelete) {
      await PageService.removePage(siteToDelete);
      deleteSiteInput.value = "";
      displaySites();
    }
  });
});

async function fetchAndBlockCurrentSite() {
  // see the note below on how to choose currentWindow or lastFocusedWindow
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const url = new URL(tab.url);
  await PageService.savePage(url.origin);
  
}

async function displaySites() {
  const siteListDiv = document.getElementById("listSites");
  if (!siteListDiv) {
    console.error('Element with id "siteList" not found.');
    return;
  }

  console.log("Displaying sites");

  siteListDiv.innerHTML = "";

  // Get sites from localStorage
  const sites = await PageService.getPages();
  console.log("Sites to display:", sites);

  // Create a list of sites
  const ul = document.createElement("ul");
  sites.forEach((site) => {
    const li = document.createElement("li");
    li.textContent = site.url;
    const input = document.createElement("input")
    input.textContent = "X";
    input.type = "button";
    input.addEventListener("click",async ()=> {
      await PageService.removePage(site.url);
      displaySites();

    })
    li.appendChild(input);
    ul.appendChild(li);
  });
  siteListDiv.appendChild(ul);
}
