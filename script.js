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
  
});

function openDialog(pol){
  document.getElementById('dialog').showModal();
  loadDV(pol);
}

function loadDV(polId){
  const tokenURL = "https://orchestrate-api.pingone.com";
  const flowURL = "https://auth.pingone.com/";
  const companyId = "6fa1cf7d-3008-4baa-a835-b8ced178e984";
  const policyId = polId;
  const apiKey =
    "22cc48febb484a293fccd2ec62c40ca5ee0644fd3e0efc1cdd5aae6b63be19f0e5b511e5d6971e9d34c82927d77d1e9b4632658a0a853c820413d186160cc08a144e6ffd830d5e1bed12c4f8f867244e1eaad0a46fe73fe141021e72682f678370bd3a1b9f8547b1639e2032a3376c1953b4c71fe400a961add767ed3cef7d03";

  let flowInputVariables = {};

  /*** Build the DaVinci Token URL. ***/
  const skGetTokenUrl =
    tokenURL + "/v1/company/" + companyId + "/sdktoken";

  //*** Add the API Key from your DaVinci Application. ***/
  var headers = new Headers();
  headers.append("X-SK-API-KEY", apiKey);

  var requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };
  
  /*** Retrieve DaVinci Token ***/
  fetch(skGetTokenUrl, requestOptions)
    .then((response) => response.json())
    .then((responseData) => {
      var props = {
        config: {
          method: "runFlow",
          apiRoot: flowURL,
          accessToken: responseData.access_token,
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
      console.log(props);
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

function logout(){
  
  document.getElementById('register').style.display = "initial";
  document.getElementById('login').style.display = "initial";
  document.getElementById('logout').style.display = "none";
  document.getElementById('name').style.display = "none";
  
  let callback = encodeURI(window.location.href);
  
  let uri = "https://auth.pingone.com/6fa1cf7d-3008-4baa-a835-b8ced178e984/as/signoff?post_logout_redirect_uri="+callback;
  window.location.href = uri;

}

function decodeToken(token){
  return JSON.parse(atob(token.split('.')[1]));
}

function readCookieValue(name){
  return document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || "";
}