//Register Stuff
  var user = null;

$(function() {

  $('#Register').on("click",function(e) {
    e.preventDefault();
    $('.welcome-area').toggle();
    $('.billboard-login').toggle();
  });

  $('#cancel').on("click",function(e) {
    e.preventDefault();
    $('.welcome-area').show();
    $('.billboard-login').hide();
  });

  $("#register-click").click( function(e) {
    e.preventDefault();
    var equal = this.form.pass.value === this.form.passconf.value
    var longEnough = this.form.email.value.length > 8;
    if (!equal) alert('Passwords don\'t match');
    if (!longEnough) alert('Passwords need to be longer than 8 chars');

    if(longEnough && equal) {
      $.ajax({
        url: "/register",
        method: "POST",
        data: { email : this.form.email.value, pass:this.form.pass.value },
        dataType: "json"
      })
      .done(function(data) {
        $('.billboard-welcome').html('check your email!')
        $('.welcome-area').toggle();
        $('.billboard-login').toggle();
      })
      .fail(function(err) {
        alert(err.responseJSON.message);
      })
    }
  })
})
