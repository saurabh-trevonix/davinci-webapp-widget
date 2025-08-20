let at;
let it;
let st;
let idTokenClaims;
let atTokenClaims;
var sessionActive;

window.addEventListener("load", (event) => {
  console.log(event);
    
  //redirect option
  var parsedHash = new URLSearchParams(window.location.hash.substr(1));
  if (parsedHash.size != 0){
    if (parsedHash.get("access_token")) {
      at = decodeToken(parsedHash.get("access_token"));
      it = decodeToken(parsedHash.get("id_token"));
      // flush parameter from window url
      window.history.pushState({}, document.title, window.location.pathname);
      handleUI(it.fname,it.sname);
      sessionActive = true;
    } else if (parsedHash.get("error")) {
      document.getElementById("error").style.display = "block";
    } else {
      sessionActive = false;
      
    }
  }
  
  // Check authentication status on page load for all pages
  checkAuthStatusOnLoad();
});

function openDialog(pol){
  document.getElementById('dialog').showModal();
  loadDV(pol);
}

function loadDV(polId){
  const tokenURL = "https://orchestrate-api.pingone.eu";
  const companyId = "fd4cecf9-f6b6-45da-a0c3-2f8af9874182";
  const policyId = polId;
  const apiKey =
    "1d7ceddc35cd195e6abe59ae58c8f5184994caae4499fe77a0f422a775a9d175e4c4e79653024a92b339091b7a5dcb48e5d2a39d802fd77a4649ec4150d99678145211a384ff69de17852ca77adb921e883275af0d194fb722b7cc8e6e63ce4e052d8c1931420d9c01205f789427489df527af412409a75251de3e34585203e7";

  let flowInputVariables = {};

  const oidcConfigUrl = "https://auth.pingone.eu/fd4cecf9-f6b6-45da-a0c3-2f8af9874182/as/.well-known/openid-configuration";

  console.log("OIDC Config URL:", oidcConfigUrl);

  /*** Build the DaVinci Token URL. ***/
  const skGetTokenUrl =
    tokenURL + "/v1/company/" + companyId + "/sdktoken";

  console.log("Token URL:", skGetTokenUrl);

  //*** Add the API Key from your DaVinci Application. ***/
  var headers = new Headers();
  headers.append("X-SK-API-KEY", apiKey);

  var requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };
  
  /*** Retrieve DaVinci Token and OIDC Config ***/
  Promise.all([
    fetch(skGetTokenUrl, requestOptions),
    fetch(oidcConfigUrl)
  ])
    .then(([tokenResponse, oidcResponse]) => Promise.all([tokenResponse.json(), oidcResponse.json()]))
    .then(([tokenData, oidcConfig]) => {
      console.log("OIDC Response:", oidcConfig);
      console.log("Authorization Endpoint:", oidcConfig.authorization_endpoint);
      console.log("Modified API Root:", oidcConfig.authorization_endpoint.replace('/authorize', ''));
      console.log("Base Domain for API Root:", "https://auth.pingone.eu");
      
      var props = {
        config: {
          method: "runFlow",
          apiRoot: "https://auth.pingone.eu",
          accessToken: tokenData.access_token,
          companyId: companyId,
          policyId: policyId,
          parameters: flowInputVariables,
        },
        useModal: false,
        successCallback,
        errorCallback,
        onCloseModal,
      };
      /*** Invoke DaVinci Widget ****/
      console.log("Final DaVinci Props:", props);
      davinci.skRenderScreen(
        document.getElementById("widget"),
        props
      );
    })
    .catch((error) => console.log("error", error));

  function successCallback(response) {
    console.log(response);
    at = decodeToken(response.access_token);
    it = decodeToken(response.id_token);
    st = response.sessionToken;
    sessionActive = true;
    
    // Store authentication data in sessionStorage for persistence across pages
    sessionStorage.setItem('accessToken', response.access_token);
    sessionStorage.setItem('idToken', response.id_token);
    sessionStorage.setItem('sessionToken', response.sessionToken);
    sessionStorage.setItem('sessionActive', 'true');
    
    // Store decoded token data for easy access
    sessionStorage.setItem('decodedAccessToken', JSON.stringify(at));
    sessionStorage.setItem('decodedIdToken', JSON.stringify(it));
    
    console.log('Access Token Data:', at);
    console.log('ID Token Data:', it);
    
    //document.cookie = "f1TV=" + at.F1TVSub + ";";
    //handleUI(it.fname,it.sname);
    window.location.href = "./account.html";
  }

  function errorCallback(error) {
    console.log(error);
  }

  function onCloseModal() {
    console.log("onCloseModal");
  }
}

function handleUI(fname,sname){
  document.getElementById('register').style.display = "none";
  document.getElementById('login').style.display = "none";
  document.getElementById('logout').style.display = "block";
  document.getElementById('name').style.display = "block";
  document.getElementById('name').innerText = "Hello "+fname+' '+sname;
  document.getElementById('dialog').close();
}

// Add function to check authentication status on page load
function checkAuthStatusOnLoad() {
  // Check if we're on the account page and need to restore authentication
  if (window.location.pathname.includes('account.html')) {
    // Try to restore authentication data from sessionStorage
    const storedDecodedAccessToken = sessionStorage.getItem('decodedAccessToken');
    const storedDecodedIdToken = sessionStorage.getItem('decodedIdToken');
    const storedSessionToken = sessionStorage.getItem('sessionToken');
    
    if (storedDecodedAccessToken && storedDecodedIdToken) {
      // Restore global variables
      try {
        at = JSON.parse(storedDecodedAccessToken);
        it = JSON.parse(storedDecodedIdToken);
        st = storedSessionToken;
        sessionActive = true;
        
        console.log('Authentication restored from sessionStorage:', { at, it, st });
      } catch (error) {
        console.error('Error restoring authentication data:', error);
        sessionActive = false;
      }
    } else {
      console.log('No stored authentication data found');
      sessionActive = false;
    }
  }
}

// Enhanced logout function to clear sessionStorage
function logout(){
  // Clear sessionStorage
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('idToken');
  sessionStorage.removeItem('sessionToken');
  sessionStorage.removeItem('sessionActive');
  sessionStorage.removeItem('decodedAccessToken');
  sessionStorage.removeItem('decodedIdToken');
  
  // Clear global variables
  at = undefined;
  it = undefined;
  st = undefined;
  sessionActive = false;
  
  // Handle UI based on current page
  if (window.location.pathname.includes('account.html')) {
    // On account page, redirect to login page
    window.location.href = "./index.html";
  } else {
    // On other pages, update UI elements
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const logoutBtn = document.getElementById('logout');
    const nameDiv = document.getElementById('name');
    
    if (registerBtn) registerBtn.style.display = "initial";
    if (loginBtn) loginBtn.style.display = "initial";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (nameDiv) nameDiv.style.display = "none";
  }
  
  let callback = encodeURI(window.location.href);
  let uri = "https://auth.pingone.eu/fd4cecf9-f6b6-45da-a0c3-2f8af9874182/as/signoff?post_logout_redirect_uri="+callback;
  window.location.href = uri;
}

function decodeToken(token){
  return JSON.parse(atob(token.split('.')[1]));
}

function readCookieValue(name){
  return document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || "";
}