// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
	if (Session.get("sortby") == "name") {
		return Players.find({}, {sort: {name: 1}});
	}
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },

	'click input.delete': function () {
      Players.remove(Session.get("selected_player"));
    },

	'click input.reset': function () {
	  Players.find({}).forEach(function(player) {
       Players.update(player._id,
					{$set: { score: Math.floor(Random.fraction()*10)*5 } }
	  			);
	  });
    },

	'click input.sort': function () {
	  Session.set("sortby",Session.get("sortby") === "name" ? "score" : "name");
	},

	'keydown input#newname': function(event) {
		if(event.which == 13) {
			var name = $('#newname');
			if (name.val()) {
				Players.insert({
					name: name.val(),
					score: 0
				});
			}
			name.val('');
		}
	}

  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
