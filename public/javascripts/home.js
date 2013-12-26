
$("#switch-signup-link").click(function(){
	$("#login-form").slideUp(300);
	$("#signup-form").slideDown(300);
	$(this).parent().hide().next().show();
});
$("#switch-login-link").click(function(){
	$("#login-form").slideDown(300);
	$("#signup-form").slideUp(300);
	$(this).parent().hide().prev().show();
});
$("#login-form").find("input").on("focusin", function(){
	$(".error-dialog-box").removeClass("show").addClass("hide");
});