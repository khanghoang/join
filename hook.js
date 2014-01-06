// Listen on port 9001
var gith = require('gith').create( 9001 );
// Import execFile, to run our bash script
var exec = require('child_process').exec;

gith({
    repo: 'trieukhang274/join'
}).on( 'all', function( payload ) {
    if( payload.branch === 'master' )
    {
    	console.log("Before exec file");

    		// var exec = require('child_process').exec;
            // Exec a shell script
            exec('/home/user/join/hook.sh', function(error, stdout, stderr) {
            		// console.log(__filename);
            		console.log("error = " + error);
                    // Log success in some manner
                    console.log( 'exec complete' );
            }); 
    }
});