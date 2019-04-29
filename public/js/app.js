// console.log('teste')

const profile = {};


function onSuccess(googleUser) {
	
	profile.fullName = googleUser.getBasicProfile().getName();
	profile.firstName = googleUser.getBasicProfile().getGivenName();
	profile.imgUrl = googleUser.getBasicProfile().getImageUrl();
	profile.email = googleUser.getBasicProfile().getEmail();


	// console.log('Full Name: ' + googleUser.getBasicProfile().getName());
	// console.log('Given Name: ' + googleUser.getBasicProfile().getGivenName());
	// console.log('Image URL: ' + googleUser.getBasicProfile().getImageUrl());
	// console.log('Email: ' + googleUser.getBasicProfile().getEmail());
}
function onFailure(error) {
  console.log(error);
}
function renderButton() {
  gapi.signin2.render('my-signin2', {
    'scope': 'profile email',
    'width': 240,
    'height': 50,
    'longtitle': true,
    'theme': 'dark',
    'onsuccess': onSuccess,
    'onfailure': onFailure
  });
}

// console.log(profile);
module.exports = profile;






