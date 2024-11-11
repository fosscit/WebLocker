document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  const addButton = document.getElementById("addSitesConfirm");
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
  deleteButton.addEventListener("click", async () => {
    const siteToDelete = deleteSiteInput.value.trim();
    if (siteToDelete) {
      await PageService.removePage(siteToDelete);
      deleteSiteInput.value = "";
      displaySites();
    }
  });
});

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
    ul.appendChild(li);
  });
  siteListDiv.appendChild(ul);
}
