module.exports = {
	getFieldNames: function(collection){
		return Object.keys(collection);
	},
	stripPath: function(path){

		path = path.split("/")
		path.splice(0,1);
				console.log(path)
		return path;
	}
}
