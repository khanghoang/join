// Listen on port 9001
var gith = require('gith').create( 9001 );
// Import execFile, to run our bash script
var execFile = require('child_process').execFile;

gith({
    repo: 'trieukhang274/join'
}).on( 'all', function( payload ) {
    if( payload.branch === 'master' )
    {
    	console.log("Before exec file");
            // Exec a shell script
            execFile('hook.sh', function(error, stdout, stderr) {
                    // Log success in some manner
                    console.log( 'exec complete' );
            });
    }
});