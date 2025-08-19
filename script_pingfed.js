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