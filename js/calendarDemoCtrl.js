angular.module('calendarDemoApp', ['ui.rCalendar']);

angular.module('calendarDemoApp').controller('CalendarDemoCtrl', ['$scope', function ($scope) {
    'use strict';
	
	var CLIENT_ID = '808769547462-8qjt7heh358ug03pn3m3ua4u1221v9dj.apps.googleusercontent.com';
	var SCOPES = ['https://www.googleapis.com/auth/calendar'];
	var timeevents = [];
	 
	$scope.handleAuthClick = function () {
		gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
    };
	
	$scope.addEvent = function () {
		$('#addeventModal').modal("show");
		
		$('#starttime').datetimepicker();
		$('#endtime').datetimepicker();	
		
		$("#eventsave").click(function(){
			var eventssummary = $('.eventssummary').val();
			
			var starttime = $('#starttime').find('input[type=text]').val();
			var endtime = $('#endtime').find('input[type=text]').val();
			
			var now = new Date(starttime);
			var today = now.toISOString();
			
			var newendtime = new Date(endtime);
			newendtime = newendtime.toISOString();
			
			 var resource = {
				"summary": eventssummary,
				"start": {"dateTime": today},
				"end": {"dateTime": newendtime}
			};
				
			var request = gapi.client.calendar.events.insert({
				'calendarId':		'primary',	
				"resource":			resource	
			});
			
			request.execute(function(resp) {
				$('#addeventModal').modal("hide");
				if(resp.status=='confirmed') {
					$('#successModal').modal("show");
					timeevents.push({
						title: eventssummary,
						startTime: today,
						endTime: newendtime,
						allDay: false
					});
					$scope.eventSource = timeevents;
				} else {
					$('#errorModal').modal("show");
				}
			});
		});
    };
	
    $scope.changeMode = function (mode) {
        $scope.mode = mode;
    };

    $scope.today = function () {
        $scope.currentDate = new Date();
    };

    $scope.isToday = function () {
        var today = new Date(),
            currentCalendarDate = new Date($scope.currentDate);

        today.setHours(0, 0, 0, 0);
        currentCalendarDate.setHours(0, 0, 0, 0);
        return today.getTime() === currentCalendarDate.getTime();
    };

    $scope.loadEvents = function () {
		$("#calendar").hide();
		$("#login").show();
		$("#error").hide();
		$("#noevents").hide();
		window.setTimeout(checkAuth,8);
    };

    $scope.onEventSelected = function (event) {
        $scope.event = event;
    };

	/**
       * Check if current user has authorized this application.
       */
      function checkAuth() {
        gapi.auth.authorize(
          {
            'client_id': CLIENT_ID,
            'scope': SCOPES,
            'immediate': true
          }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
          loadCalendarApi();
			$("#calendar").show();
			$("#login").hide();
			$("#error").hide();
			$("#noevents").hide();
        } else {
			$("#error").show();
        }
      }

      /**
       * Load Google Calendar client library. List upcoming events
       * once client library is loaded.
       */
      function loadCalendarApi() {
        gapi.client.load('calendar', 'v3', listUpcomingEvents);
      }

      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function listUpcomingEvents() {
        var request = gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': (new Date("2015-05-01")).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 10,
          'orderBy': 'startTime'
        });

        request.execute(function(resp) {
		  $("#noevents").hide();
		 
          var events = resp.items;
          if (events.length > 0) {
            for (var i = 0; i < events.length; i++) {
              var event = events[i];
              var when = event.start.dateTime;
			  var endwhen = event.end.dateTime;
			 
              if (!when) {
                when = event.start.date;
              }
			  
			  if (!endwhen) {
                endwhen = event.end.date;
              }
				timeevents.push({
                    title: event.summary,
                    startTime: when,
                    endTime: endwhen,
                    allDay: false
                });
            }
			$scope.eventSource = timeevents;
          } else {
			$("#noevents").show();
          }

        });
      }
}]);