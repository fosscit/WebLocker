document.addEventListener('DOMContentLoaded',() =>{
    console.log('DOM fully loaded and parsed');

    const addButton=document.getElementById('addSitesConfirm');
    const deleteButton=document.getElementById('deleteSitesConfirm');
    const addSiteInput=document.getElementById('addSites');
    const deleteSiteInput=document.getElementById('deleteSites');
    const siteListDiv=document.getElementById('listSites');

    console.log('Elements:',addButton,addSiteInput,siteListDiv);

    displaySites();

    addButton.addEventListener('click',() =>{
        const site=addSiteInput.value.trim();
        if(site){
            addSite(site);
            addSiteInput.value="";
            displaySites();
        }
    });
    deleteButton.addEventListener('click', () => {
        const siteToDelete = deleteSiteInput.value.trim();
        if (siteToDelete) {
            deleteSite(siteToDelete);
            deleteSiteInput.value = "";
            displaySites();
        }
    });
});

function addSite(site){
    console.log('Adding site:',site);

    // Get sites from local storage
    const sites=JSON.parse(localStorage.getItem('protectedSites')) || [];
    console.log('Existing sites:',sites);

    sites.push(site);

    // Overwrite local storage
    localStorage.setItem('protectedSites',JSON.stringify(sites));
}

function displaySites(){
    const siteListDiv=document.getElementById('listSites');
    if(!siteListDiv){
        console.error('Element with id "siteList" not found.');
        return;
    }

    console.log('Displaying sites');

    siteListDiv.innerHTML='';

    // Get sites from localStorage
    const sites=JSON.parse(localStorage.getItem('protectedSites')) || [];
    console.log('Sites to display:',sites);

    // Create a list of sites
    const ul=document.createElement('ul');
    sites.forEach(site =>{
        const li=document.createElement('li');
        li.textContent=site;
        ul.appendChild(li);
    });
    siteListDiv.appendChild(ul);
}

function deleteSite(siteToDelete){
    // Get existing sites from localStorage
    const sites=JSON.parse(localStorage.getItem('protectedSites')) || [];
    
    // Filter out the site to delete
    const updatedSites=sites.filter(site => site !== siteToDelete);
    
    // Update local storage
    localStorage.setItem('protectedSites',JSON.stringify(updatedSites));

    displaySites();
}