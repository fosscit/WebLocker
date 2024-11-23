document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  const addButton = document.getElementById("addSitesConfirm");
  const currentAddButton = document.getElementById("currentWebsiteBlockButton");
  const deleteButton = document.getElementById("deleteSitesConfirm");
  const addSiteInput = document.getElementById("addSites");
  const deleteSiteInput = document.getElementById("deleteSites");
  const siteListDiv = document.getElementById("listSites");
  const submitButton = document.getElementById("submitPassword");
  const submitButtonForRemoval = document.getElementById("submitPasswordForRemoval");
  const passwordInput = document.getElementById("passwordField" );
  const passwordInputForRemoval = document.getElementById("passwordFieldForRemoval");

  console.log("Elements:", addButton, addSiteInput, siteListDiv);

  displaySites();

currentAddButton.addEventListener("click", async () => {
  await fetchAndBlockCurrentSite();
  displaySites();
});


  addButton.addEventListener("click", async () => {
    const site = addSiteInput.value.trim();
    if (site) {
      const pageexists = await   PasswordService.detectPage(site)
      if (!pageexists){
      document.getElementsByClassName('password-new')[0].style.display = 'block'
      }else{
          await PageService.savePage(site);
          addSiteInput.value = "";
          displaySites();
    }
  }
  });
 submitButton.addEventListener("click",async  () => {
    const site = addSiteInput.value.trim();
    const password = passwordInput.value.trim();
    if (site && password ) {
        await PasswordService.saveEntry(site,password) 
        await PageService.savePage(site);
        addSiteInput.value = "";
        displaySites();
        currentAddButton.addEventListener("click", async () => {
          await fetchAndBlockCurrentSite();
          displaySites();
        })
        document.getElementsByClassName('password-new')[0].style.display = 'none'
    }
    passwordInput.value = "";
    });
  deleteButton.addEventListener("click", async () => {
    const siteToDelete = deleteSiteInput.value.trim();

    if (siteToDelete && PasswordService.detectPage(siteToDelete)) {

      document.getElementsByClassName('password-old')[0].style.display = 'block'
      document.getElementById('siteToBeRemoved').innerHTML = siteToDelete;
      deleteSiteInput.value = '';
    }
  });
 submitButtonForRemoval.addEventListener("click",async  () => {
    const site = document.getElementById('siteToBeRemoved').textContent;
    const password = passwordInputForRemoval.value.trim();
    if (site && password ) {
      if(await PasswordService.validatePage(site,password)){
        await PageService.removePage(site);
        displaySites();
        document.getElementsByClassName('password-old')[0].style.display = 'none'
      passwordInputForRemoval.value = "";
      document.getElementById('siteToBeRemoved').value = ""
    }
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
  if (await PasswordService.detectPage(url.origin)) {
    await PageService.savePage(url.origin);
  }else{
    document.getElementById('addSites').value = url.origin;

    document.getElementsByClassName('password-new')[0].style.display = 'block'
  }
  
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
    input.type = "button";
    input.value = "X"
    input.addEventListener("click",async ()=> {
      
      document.getElementsByClassName('password-old')[0].style.display = 'block'
      document.getElementById('siteToBeRemoved').innerHTML = site.url;
    })
    li.appendChild(input);
    ul.appendChild(li);
  });
  siteListDiv.appendChild(ul);
}
