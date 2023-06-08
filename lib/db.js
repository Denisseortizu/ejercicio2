var mysql = require('mysql');

var connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'',
	database:'construcciones2'
});
connection.connect(function(error){
	if(!!error) {
		console.log(error);
	} else {
		console.log('Conectado exitosamente a la Base de Datos..!!');
	}
});

module.exports = connection;