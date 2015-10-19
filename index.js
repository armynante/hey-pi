require('shelljs/global');

// CHECK TO SEE IF MONGODB IS INSTALED
module.exports = {
		init: function() {
				
				var ver_array = exec('mongo --version').split(" ");
				var ver_num  = ver_array[ver_array.length -1].trim();
				
				if (ver_num === undefined) {
						echo("Looks like you don't have MongoDB installed." );
						exit(1);
				} else {
						echo("Mongo version " + ver_num + "installed...")
				}
		}
}
