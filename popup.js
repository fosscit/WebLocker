document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed");

  // Element references
  const addButton = document.getElementById("addSitesConfirm");
  const currentAddButton = document.getElementById("currentWebsiteBlockButton");
  const deleteButton = document.getElementById("deleteSitesConfirm");
  const addSiteInput = document.getElementById("addSites");
  const deleteSiteInput = document.getElementById("deleteSites");
  const siteListDiv = document.getElementById("listSites");
  const submitButton = document.getElementById("submitPassword");
  const submitButtonForRemoval = document.getElementById(
    "submitPasswordForRemoval",
  );
  const passwordInput = document.getElementById("passwordField");
  const passwordInputForRemoval = document.getElementById(
    "passwordFieldForRemoval",
  );

  // Ensure all required elements exist
  if (
    !addButton ||
    !currentAddButton ||
    !deleteButton ||
    !addSiteInput ||
    !deleteSiteInput ||
    !siteListDiv ||
    !submitButton ||
    !submitButtonForRemoval ||
    !passwordInput ||
    !passwordInputForRemoval
  ) {
    console.error("Missing required DOM elements.");
    return;
  }

  // Get active tab
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const url = new URL(tab.url);

  try {
    const pagedetectedInBlockList = await PageService.detectpage(url.origin);

    if (pagedetectedInBlockList) {
      currentAddButton.style = "display:none";
      toggleDisplay("password-old", true);
      scrollToTop();
      document.getElementById("siteToBeRemoved").textContent = url.origin;
      deleteSiteInput.value = "";
    } else {
      currentAddButton.innerText = "Block current website";
      currentAddButton.addEventListener("click", async () => {
        await BlockCurrentSite(url.origin);
        await displaySites();
      });
    }

    await displaySites();

    // Add site to blocklist
    addButton.addEventListener("click", async () => {
      const site = addSiteInput.value.trim();
      if (site) {
        const pageExists = await PasswordService.detectPage(site);
        if (!pageExists) {
          toggleDisplay("password-new", true);
          scrollToTop();
        } else {
          await PageService.savePage(site);
          addSiteInput.value = "";
          await displaySites();
        }
      }
    });

    // Add site with password
    submitButton.addEventListener("click", async () => {
      const site = addSiteInput.value.trim();
      const password = passwordInput.value.trim();
      if (site && password) {
        await PasswordService.saveEntry(site, password);
        await PageService.savePage(site);
        addSiteInput.value = "";
        await displaySites();
        toggleDisplay("password-new", false);
        document.getElementById("currentWebsiteBlockButton").style =
          "display:none";
        toggleDisplay("password-old", true);
        scrollToTop();
        document.getElementById("siteToBeRemoved").textContent = url.origin;
      }
      passwordInput.value = "";
    });

    // Prepare site for deletion
    deleteButton.addEventListener("click", async () => {
      const siteToDelete = deleteSiteInput.value.trim();
      if (siteToDelete) {
        const pageExists = await PasswordService.detectPage(siteToDelete);
        if (pageExists) {
          toggleDisplay("password-old", true);
          scrollToTop();
          document.getElementById("siteToBeRemoved").textContent = siteToDelete;
          deleteSiteInput.value = "";
        }
      }
    });

    // Delete site with password
    submitButtonForRemoval.addEventListener("click", async () => {
      const site = document.getElementById("siteToBeRemoved").textContent;
      const password = passwordInputForRemoval.value.trim();
      if (site && password) {
        const isValid = await PasswordService.validatePage(site, password);
        if (isValid) {
          await PageService.removePage(site);
          await displaySites();
          toggleDisplay("password-old", false);
          passwordInputForRemoval.value = "";
          document.getElementById("siteToBeRemoved").textContent = "";

          const currentpage = await getCurrentWebsite();

          if (
            currentpage === site ||
            (await PageService.detectpage(currentpage)) === false
          ) {
            currentAddButton.style = "display:block";
            currentAddButton.innerText = "Block current website";
            currentAddButton.addEventListener("click", async () => {
              await BlockCurrentSite(url.origin);
              await displaySites();
            });
          } else {
            toggleDisplay("password-old", true);
            document.getElementById("siteToBeRemoved").textContent =
              currentpage;
          }
        }
      }
    });
  } catch (error) {
    console.error("Error initializing app:", error);
  }
});

async function getCurrentWebsite() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const url = new URL(tab.url);
  return url.origin;
}

// Helper function to block current site
async function BlockCurrentSite(siteURL) {
  try {
    const pageDetectedInPasswords = await PasswordService.detectPage(siteURL);
    if (pageDetectedInPasswords) {
      await PageService.savePage(siteURL);
      document.getElementById("currentWebsiteBlockButton").style =
        "display:none";
      toggleDisplay("password-new", false);
      toggleDisplay("password-old", true);
      scrollToTop();
      document.getElementById("siteToBeRemoved").textContent = siteURL;
      document.getElementById("deleteSites").value = "";
    } else {
      document.getElementById("addSites").value = siteURL;
      toggleDisplay("password-new", true);
      scrollToTop();
    }
  } catch (error) {
    console.error("Error blocking site:", error);
  }
}

// Helper function to display sites
async function displaySites() {
  const siteListDiv = document.getElementById("listSites");
  if (!siteListDiv) {
    console.error('Element with id "listSites" not found.');
    return;
  }

  try {
    siteListDiv.innerHTML = ""; // Clear previous list
    const sites = await PageService.getPages(); // Fetch sites from storage

    const ul = document.createElement("ul");
    sites.forEach((site) => {
      const li = document.createElement("li");
      li.textContent = site.url;

      const deleteButton = document.createElement("input");
      deleteButton.type = "button";
      deleteButton.value = "X";
      deleteButton.addEventListener("click", () => {
        toggleDisplay("password-old", true);
        scrollToTop();
        document.getElementById("siteToBeRemoved").textContent = site.url;
      });

      li.appendChild(deleteButton);
      ul.appendChild(li);
    });

    siteListDiv.appendChild(ul);
  } catch (error) {
    console.error("Error displaying sites:", error);
  }
}

// Utility functions
function toggleDisplay(className, show) {
  const element = document.getElementsByClassName(className)[0];
  if (element) {
    element.style.display = show ? "block" : "none";
  }
}

function scrollToTop() {
  window.scrollTo(0, 0);
}
