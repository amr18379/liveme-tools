/*
	Favorites Module
*/
"use strict";

const 	{ app, dialog } = require('electron'),
		path = require('path'), axios = require('axios'), fs = require('fs'),
		eventEmitter = new(require('events').EventEmitter)();

var 	fav_list = [], last_change = 0, is_saved = false, index = 0, test_var = 0;


module.exports = {

	events: eventEmitter,

	add : function(e) {
		fav_list.push(e);
		update_single_user(fav_list.length - 1);
		eventEmitter.emit('refresh', fav_list);
	},

	refresh: function() { 
		eventEmitter.emit('status', 'Loading list, please wait...');
		eventEmitter.emit('refresh', fav_list); 
	},

	remove: function(e) {
		var idx = 0;
		for (var i = 0; i < fav_list.length; i++) {
			if (fav_list[i].uid == e) {
				fav_list.splice(i, 1);
			}
		}
		
		write_to_file();
		eventEmitter.emit('removeSingle', { userid: e });
	},

	save: function() {
		write_to_file();
		eventEmitter.emit('refresh', fav_list);
	},

	load: function() {
		eventEmitter.emit('status', 'Loading list, please wait...');
		fs.readFile(path.join(app.getPath('appData'), app.getName(), 'favorites.json'), 'utf8', function (err,data) {
			if (err) {
				fav_list = [];
			} else {
				var i, j = JSON.parse(data);
				for (i = 0; i < j.length; i++) {
					fav_list.push({
						'uid' : j[i].uid,
						'face' : j[i].face,
						'nickname' : j[i].nickname,
						'sex' : j[i].sex,
						'level' : j[i].level,
						'video_count' : j[i].video_count,
						'usign' : j[i].usign,
						'stars' : j[i].stars
					})
				}

				fav_list = JSON.parse(data);
				eventEmitter.emit('refresh', fav_list);
			}
		});

	},

	isOnList: function(e) {
		for (var i = 0; i < fav_list.length; i++) {
			if (fav_list[i].uid == e) return true;
		}
		return false;
	},

	tick : function() { },
	forceSave : function() { write_to_file(true); },
	update: function() {
		eventEmitter.emit('status', 'Refreshing list, please wait...');
		index = 0;
		update_favorites_list();
		//eventEmitter.emit('refresh', fav_list);
	},

	export: function(file) {
		let ids = "# Generated by LiveMe-Tools";

		for (let o of fav_list) {
			ids += "\n" + o['uid']; // Just use \n even though windows uses \r\n. It will look stupid in Notepad, but it will still work if this file gets transferred between Windows and Linux/Mac. The importer will parse for \n, not \r\n.
		}

		fs.writeFile(file, ids, 'utf8', function(err) {
			if (err) {
				dialog.showErrorBox('Export Error', 'There was an error when attempting to export your favorites');
				console.error(err);
			}
		});
	},

	import: function(file) {
		fs.readFile(file, 'utf8', (err, data) => {
			if (err) {
				dialog.showErrorBox('Export Error', 'There was an error when attempting to export your favorites');
				console.error(err);
			} else {
				for (let id of data.split("\n")) {
					id = id.trim();

					if (id.startsWith('#') || id.length == 0) {
						continue;
					}

					if (this.isOnList(id)) {
						continue;
					}
					
					fav_list.push({ uid: id });
				}

				this.update();
			}
		});
	}
}





function write_to_file() {
	var ti = new Date().getTime() / 1000;
	last_change = ti;

	fs.writeFile(path.join(app.getPath('appData'), app.getName(), 'favorites.json'), JSON.stringify(fav_list, null, 2), function(){ });
}

function read_from_file(cb) {
	fs.readFile(path.join(app.getPath('appData'), app.getName(), 'favorites.json'), 'utf8', function (err,data) {
		if (err) {
			fav_list = [];
		} else {
			fav_list = JSON.parse(data);
			last_change = new Date().getTime() / 1000;
			cb(fav_list);
		}
	});

}

function update_single_user(index) {

	axios.get('http://live.ksmobile.net/user/getinfo',{
		params: { 
			userid: fav_list[index].uid 
		}
	}).then(function(resp) {
		var j = resp.data.data.user;

		if (resp.data.status == 200) {
			fav_list[index].face = j.user_info.face;
			fav_list[index].nickname = j.user_info.nickname;
			fav_list[index].usign = j.user_info.usign;
			fav_list[index].level = j.user_info.level;
			fav_list[index].stars = j.user_info.star;
			fav_list[index].currency = j.user_info.currency;
			fav_list[index].stars = j.user_info.star;
			fav_list[index].stars = j.user_info.star;
			fav_list[index].stars = j.user_info.star;
			fav_list[index].sex = j.user_info.sex > -1 ? ( j.user_info.sex > 0 ? 'male' : 'female') : '';
			fav_list[index].video_count = j.count_info.video_count;
		} 

		fs.writeFile(path.join(app.getPath('appData'), app.getName(), 'favorites.json'), JSON.stringify(fav_list, null, 2), function(){
			eventEmitter.emit('refresh', fav_list);
		});

	}).catch(function(err){
		console.log('Error during favorites list update: ' + err);
	});
}

function update_favorites_list() {

	axios.get('http://live.ksmobile.net/user/getinfo',{
		params: { 
			userid: fav_list[index].uid 
		}
	}).then(function(resp) {
		var j = resp.data.data.user;

		if (resp.data.status == 200) {
			fav_list[index].face = j.user_info.face;
			fav_list[index].nickname = j.user_info.nickname;
			fav_list[index].usign = j.user_info.usign;
			fav_list[index].level = j.user_info.level;
			fav_list[index].stars = j.user_info.star;
			fav_list[index].currency = j.user_info.currency;
			fav_list[index].stars = j.user_info.star;
			fav_list[index].stars = j.user_info.star;
			fav_list[index].stars = j.user_info.star;
			fav_list[index].sex = j.user_info.sex > -1 ? ( j.user_info.sex > 0 ? 'male' : 'female') : '';
			fav_list[index].video_count = j.count_info.video_count;
		} 
		index++;

		if (index == fav_list.length) {
			fs.writeFile(path.join(app.getPath('appData'), app.getName(), 'favorites.json'), JSON.stringify(fav_list, null, 2), function(){
				eventEmitter.emit('refresh', fav_list);
			});
		}

		eventEmitter.emit('status', 'Refreshing '+index+' of ' + fav_list.length + '...');
		update_favorites_list();
		
	}).catch(function(err){
		console.log('Error during favorites list update: ' + err);
	});
}
